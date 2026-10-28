/**
 * IP rate limiter for the marketing site's request-trial form.
 *
 * Deployed as a standalone Cloudflare Worker on the Workers Free plan. It is
 * NOT proxying site traffic and does not touch DNS — the Next.js server action
 * calls it over HTTPS with the visitor's IP, and receives a yes/no decision.
 *
 * Counters live in a SQLite-backed Durable Object so they are global (shared
 * across every Vercel serverless instance) and survive deployments.
 *
 * Endpoints:
 *   GET  /health  -> { ok: true }
 *   POST /check   -> { allowed, retryAfter }   (Authorization: Bearer <secret>)
 */

interface Env {
  RATE_LIMITER: DurableObjectNamespace;
  RATE_LIMIT_SECRET: string;
  HOURLY_LIMIT: string;
  DAILY_LIMIT: string;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Keep counters long enough to debug, then drop them. */
const RETENTION_DAYS = 2;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

/** Length-independent comparison so the secret can't be timed. */
function timingSafeEqual(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < max; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function isAuthorized(request: Request, secret: string | undefined): boolean {
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return token.length > 0 && timingSafeEqual(token, secret);
}

/**
 * Rate-limit keys are IP addresses. Reject anything that isn't shaped like an
 * IPv4/IPv6 literal so arbitrary strings can't create unbounded DO rows.
 */
function sanitizeKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  if (key.length === 0 || key.length > 64) return null;
  if (!/^[0-9a-f:.]+$/.test(key)) return null;
  if (!key.includes(".") && !key.includes(":")) return null;
  return key;
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Raw IPs are never persisted: the Durable Object only sees a keyed hash, so
 * storage can't be used to reconstruct who visited. The hash is deterministic
 * (same IP → same key) and scoped by the shared secret.
 */
async function hashKey(key: string, secret: string): Promise<string> {
  const data = new TextEncoder().encode(`${secret}:${key}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true });
    }

    if (request.method !== "POST" || url.pathname !== "/check") {
      return json({ error: "not_found" }, 404);
    }

    if (!isAuthorized(request, env.RATE_LIMIT_SECRET)) {
      return json({ error: "unauthorized" }, 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    const key = sanitizeKey((body as { key?: unknown } | null)?.key);
    if (!key) return json({ error: "invalid_key" }, 400);

    const hashedKey = await hashKey(key, env.RATE_LIMIT_SECRET);

    // A single Durable Object keeps every counter in one SQLite table. Trial
    // traffic is tiny, and serialising through one object removes all races.
    const stub = env.RATE_LIMITER.get(env.RATE_LIMITER.idFromName("global"));
    const result = await stub.fetch("https://rate-limiter/check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        key: hashedKey,
        hourlyLimit: positiveInt(env.HOURLY_LIMIT, 5),
        dailyLimit: positiveInt(env.DAILY_LIMIT, 15),
      }),
    });

    return new Response(result.body, {
      status: result.status,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  },
};

interface CheckPayload {
  key: string;
  hourlyLimit: number;
  dailyLimit: number;
}

export class RateLimiter implements DurableObject {
  private readonly ctx: DurableObjectState;

  constructor(ctx: DurableObjectState) {
    this.ctx = ctx;

    ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS counters (
        key TEXT PRIMARY KEY,
        hour_bucket INTEGER NOT NULL,
        hour_count INTEGER NOT NULL,
        day_bucket INTEGER NOT NULL,
        day_count INTEGER NOT NULL
      )
    `);

    // Periodic cleanup so stale IPs don't accumulate forever.
    ctx.blockConcurrencyWhile(async () => {
      const alarm = await ctx.storage.getAlarm();
      if (alarm === null) {
        await ctx.storage.setAlarm(Date.now() + DAY_MS);
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    let payload: CheckPayload;
    try {
      payload = (await request.json()) as CheckPayload;
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    if (typeof payload?.key !== "string" || payload.key.length === 0) {
      return json({ error: "invalid_key" }, 400);
    }

    const hourlyLimit = positiveInt(String(payload.hourlyLimit), 5);
    const dailyLimit = positiveInt(String(payload.dailyLimit), 15);

    const now = Date.now();
    const hourBucket = Math.floor(now / HOUR_MS);
    const dayBucket = Math.floor(now / DAY_MS);

    // Single-statement upsert: the DO may interleave requests at await points,
    // so read-modify-write in JS would race. SQLite makes this atomic.
    const rows = this.ctx.storage.sql
      .exec<{ hour_count: number; day_count: number }>(
        `INSERT INTO counters (key, hour_bucket, hour_count, day_bucket, day_count)
         VALUES (?, ?, 1, ?, 1)
         ON CONFLICT(key) DO UPDATE SET
           hour_count = CASE
             WHEN counters.hour_bucket = excluded.hour_bucket
             THEN counters.hour_count + 1 ELSE 1 END,
           hour_bucket = excluded.hour_bucket,
           day_count = CASE
             WHEN counters.day_bucket = excluded.day_bucket
             THEN counters.day_count + 1 ELSE 1 END,
           day_bucket = excluded.day_bucket
         RETURNING hour_count, day_count`,
        payload.key,
        hourBucket,
        dayBucket,
      )
      .toArray();

    const hourCount = rows[0]?.hour_count ?? 1;
    const dayCount = rows[0]?.day_count ?? 1;

    const hourExceeded = hourCount > hourlyLimit;
    const dayExceeded = dayCount > dailyLimit;
    const allowed = !hourExceeded && !dayExceeded;

    const retryAfter = !allowed
      ? hourExceeded
        ? Math.ceil((hourBucket + 1) * HOUR_MS - now) / 1000
        : Math.ceil((dayBucket + 1) * DAY_MS - now) / 1000
      : 0;

    return json({
      allowed,
      retryAfter: Math.max(0, Math.ceil(retryAfter)),
    });
  }

  async alarm(): Promise<void> {
    const cutoff = Math.floor(Date.now() / DAY_MS) - RETENTION_DAYS;
    this.ctx.storage.sql.exec(
      "DELETE FROM counters WHERE day_bucket < ?",
      cutoff,
    );
    await this.ctx.storage.setAlarm(Date.now() + DAY_MS);
  }
}
