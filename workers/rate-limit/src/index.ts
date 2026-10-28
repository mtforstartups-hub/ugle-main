/**
 * IP / email rate limiter for the marketing site's request-trial form.
 *
 * Deployed as a standalone Cloudflare Worker on the Workers Free plan. It is
 * NOT proxying site traffic and does not touch DNS - the Next.js server action
 * calls it over HTTPS and receives a decision.
 *
 * Counters and claims live in a SQLite-backed Durable Object so they are
 * global (shared across every Vercel serverless instance) and survive
 * deployments.
 *
 * Endpoints (all except /health require Authorization: Bearer <secret>):
 *   GET  /health    -> { ok: true }
 *   POST /check     -> { allowed, retryAfter }   rate limit a key (ip | email)
 *   POST /claim     -> { claimed }               atomically reserve an email
 *                      body: { namespace: "email", key, provisional?: boolean }
 *   POST /confirm   -> { confirmed }             upgrade a provisional claim
 *                                                to the full TTL
 *   POST /release   -> { released }              release a provisional claim
 *                      body: { namespace: "email", key, force?: boolean }
 *   POST /backfill  -> { inserted, invalid }     one-off import of existing
 *                      body: { emails: string[] } (already normalized)
 *
 * Errors: 400 bad input, 401 bad secret, 404 unknown route, 413 body too
 * large, 503 limiter storage unavailable. Callers should treat these
 * distinctly (a 400/503 must never be interpreted as "duplicate").
 *
 * Keys are namespaced and hashed with a secret before storage. IPv6 addresses
 * are collapsed to their /64 prefix so rotating the low 64 bits does not
 * yield fresh buckets.
 */
import * as z from "zod";
import { isIP } from "node:net";

interface Env {
  RATE_LIMITER: DurableObjectNamespace;
  /** Bearer token the app must present. */
  RATE_LIMIT_SECRET: string;
  /**
   * Salt for key hashing. Optional: falls back to RATE_LIMIT_SECRET so
   * existing hashes (and therefore existing claims) stay valid. Set this to
   * the CURRENT RATE_LIMIT_SECRET value before you ever rotate the bearer
   * token, so rotation doesn't wipe your claims.
   */
  HASH_SECRET?: string;
  HOURLY_LIMIT: string;
  DAILY_LIMIT: string;
  CLAIM_TTL_DAYS?: string;
  /** How long a provisional claim lives before it self-expires. */
  PROVISIONAL_CLAIM_MINUTES?: string;
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Keep counters long enough to debug, then drop them. */
const RETENTION_DAYS = 2;

const DEFAULT_CLAIM_TTL_DAYS = 180;
const DEFAULT_PROVISIONAL_MINUTES = 10;

/** Grace period when deciding whether a claim is still provisional. */
const RELEASE_SLACK_MS = 60 * 1000;

const MAX_BODY_BYTES = 256 * 1024;
const MAX_BACKFILL_BATCH = 500;

type KeyNamespace = "ip" | "email";

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

// ---------------------------------------------------------------------------
// IP normalization
// ---------------------------------------------------------------------------

function parseIpv4(value: string): number[] | null {
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number.parseInt(part, 10);
    if (n > 255) return null;
    octets.push(n);
  }
  return octets;
}

/**
 * Canonicalize an IP literal into a rate-limit bucket key:
 *  - IPv4            -> dotted quad (leading zeros stripped)
 *  - IPv4-mapped v6  -> the embedded IPv4 (::ffff:1.2.3.4)
 *  - any other IPv6  -> its /64 prefix, e.g. "2001:db8:1:2::/64"
 */
function normalizeIp(value: string): string | null {
  if (!value.includes(":")) {
    const v4 = parseIpv4(value);
    return v4 ? v4.join(".") : null;
  }

  let addr = value;

  // Convert an embedded IPv4 tail (e.g. ::ffff:1.2.3.4) into two hextets.
  const lastColon = addr.lastIndexOf(":");
  const tail = addr.slice(lastColon + 1);
  if (tail.includes(".")) {
    const v4 = parseIpv4(tail);
    if (!v4) return null;
    const hi = ((v4[0] << 8) | v4[1]).toString(16);
    const lo = ((v4[2] << 8) | v4[3]).toString(16);
    addr = `${addr.slice(0, lastColon + 1)}${hi}:${lo}`;
  }

  const halves = addr.split("::");
  if (halves.length > 2) return null;

  const toGroups = (part: string) => (part === "" ? [] : part.split(":"));
  const head = toGroups(halves[0]);

  let groups: string[];
  if (halves.length === 2) {
    const rest = toGroups(halves[1]);
    const missing = 8 - head.length - rest.length;
    if (missing < 1) return null;
    groups = [...head, ...new Array<string>(missing).fill("0"), ...rest];
  } else {
    groups = head;
  }

  if (groups.length !== 8) return null;
  if (!groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return null;

  const hextets = groups.map((g) => Number.parseInt(g, 16));

  // IPv4-mapped (::ffff:a.b.c.d) -> treat as the IPv4 address.
  if (hextets.slice(0, 5).every((h) => h === 0) && hextets[5] === 0xffff) {
    return [
      hextets[6] >> 8,
      hextets[6] & 0xff,
      hextets[7] >> 8,
      hextets[7] & 0xff,
    ].join(".");
  }

  return `${hextets
    .slice(0, 4)
    .map((h) => h.toString(16))
    .join(":")}::/64`;
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const emailSchema = z
  .string()
  .trim()
  .max(254)
  .transform((value) => value.toLowerCase())
  .pipe(z.email())
  .nullable()
  .catch(null);

const ipSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .transform((value) => value.toLowerCase())
  .refine((value) => isIP(value) !== 0)
  .transform(normalizeIp);

function sanitizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;

  return emailSchema.parse(value);
}

function sanitizeIp(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const result = ipSchema.safeParse(value);
  return result.success ? result.data : null;
}

function sanitizeKey(value: unknown, namespace: KeyNamespace): string | null {
  return namespace === "email" ? sanitizeEmail(value) : sanitizeIp(value);
}

function namespaceOf(value: unknown): KeyNamespace {
  return value === "email" ? "email" : "ip";
}

function positiveInt(value: unknown, fallback: number): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(typeof value === "string" ? value : "", 10);
  return Number.isFinite(parsed) && parsed > 0
    ? Math.min(parsed, 100_000)
    : fallback;
}

/** Parse a JSON body without throwing. */
async function readJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Raw keys are never persisted: the Durable Object only sees a keyed hash, so
 * storage can't be used to reconstruct who visited. The hash is deterministic
 * (same key -> same hash) and scoped by both the namespace and a secret.
 */
async function hashKey(
  namespace: KeyNamespace,
  key: string,
  secret: string,
): Promise<string> {
  const data = new TextEncoder().encode(`${secret}:${namespace}:${key}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// ---------------------------------------------------------------------------
// Worker entrypoint
// ---------------------------------------------------------------------------

const POST_ROUTES = new Set([
  "/check",
  "/claim",
  "/confirm",
  "/release",
  "/backfill",
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true });
    }

    if (request.method !== "POST" || !POST_ROUTES.has(url.pathname)) {
      return json({ error: "not_found" }, 404);
    }

    if (!isAuthorized(request, env.RATE_LIMIT_SECRET)) {
      return json({ error: "unauthorized" }, 401);
    }

    const declaredLength = Number.parseInt(
      request.headers.get("content-length") ?? "0",
      10,
    );
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return json({ error: "payload_too_large" }, 413);
    }

    const body = await readJson(request);
    if (!body) return json({ error: "invalid_json" }, 400);

    const hashSecret = env.HASH_SECRET || env.RATE_LIMIT_SECRET;

    // Build the payload for the Durable Object.
    let payload: Record<string, unknown>;

    if (url.pathname === "/backfill") {
      const emails = Array.isArray(body.emails) ? body.emails : null;
      if (
        !emails ||
        emails.length === 0 ||
        emails.length > MAX_BACKFILL_BATCH
      ) {
        return json({ error: "invalid_emails" }, 400);
      }

      const keys: string[] = [];
      let invalid = 0;
      for (const raw of emails) {
        const email = sanitizeEmail(raw);
        if (!email) {
          invalid++;
          continue;
        }
        keys.push(await hashKey("email", email, hashSecret));
      }

      payload = {
        keys,
        invalid,
        ttlSeconds:
          positiveInt(env.CLAIM_TTL_DAYS, DEFAULT_CLAIM_TTL_DAYS) * 86400,
      };
    } else {
      const namespace = namespaceOf(body.namespace);

      // Claims only make sense for emails.
      if (url.pathname !== "/check" && namespace !== "email") {
        return json({ error: "invalid_namespace" }, 400);
      }

      const key = sanitizeKey(body.key, namespace);
      if (!key) return json({ error: "invalid_key" }, 400);

      const hashedKey = await hashKey(namespace, key, hashSecret);
      const fullTtlSeconds =
        positiveInt(env.CLAIM_TTL_DAYS, DEFAULT_CLAIM_TTL_DAYS) * 86400;

      if (url.pathname === "/claim") {
        const provisional = body.provisional === true;
        const ttlSeconds = provisional
          ? positiveInt(
              env.PROVISIONAL_CLAIM_MINUTES,
              DEFAULT_PROVISIONAL_MINUTES,
            ) * 60
          : fullTtlSeconds;
        payload = { key: hashedKey, ttlSeconds };
      } else if (url.pathname === "/confirm") {
        payload = { key: hashedKey, ttlSeconds: fullTtlSeconds };
      } else if (url.pathname === "/release") {
        // Only provisional reservations may be released by the app. A claim
        // that was already confirmed carries the full TTL and must not be
        // deleted by a late/duplicate release call. `force` exists for manual
        // operator recovery (e.g. unblocking your own address while testing).
        payload = {
          key: hashedKey,
          ttlSeconds:
            positiveInt(
              env.PROVISIONAL_CLAIM_MINUTES,
              DEFAULT_PROVISIONAL_MINUTES,
            ) * 60,
          force: body.force === true,
        };
      } else {
        payload = {
          key: hashedKey,
          hourlyLimit: positiveInt(
            body.hourlyLimit,
            positiveInt(env.HOURLY_LIMIT, 5),
          ),
          dailyLimit: positiveInt(
            body.dailyLimit,
            positiveInt(env.DAILY_LIMIT, 15),
          ),
        };
      }
    }

    // A single Durable Object keeps every counter/claim in one SQLite table.
    // Trial traffic is tiny, and serialising through one object removes all
    // races (this is what makes duplicate detection atomic).
    try {
      const stub = env.RATE_LIMITER.get(env.RATE_LIMITER.idFromName("global"));
      const result = await stub.fetch(`https://rate-limiter${url.pathname}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      return new Response(result.body, {
        status: result.status,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      });
    } catch (err) {
      console.error("[RateLimiter] Durable Object call failed:", err);
      return json({ error: "limiter_unavailable" }, 503);
    }
  },
};

// ---------------------------------------------------------------------------
// Durable Object
// ---------------------------------------------------------------------------

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

    // One row per reserved email (hashed). `expires_at` lets a provisional
    // claim self-heal and lets a genuine customer re-apply long after their
    // original request.
    ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS claims (
        key TEXT PRIMARY KEY,
        expires_at INTEGER NOT NULL
      )
    `);

    // Periodic cleanup so stale IPs/claims don't accumulate forever.
    ctx.blockConcurrencyWhile(async () => {
      const alarm = await ctx.storage.getAlarm();
      if (alarm === null) {
        await ctx.storage.setAlarm(Date.now() + DAY_MS);
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    let payload: Record<string, unknown>;
    try {
      payload = (await request.json()) as Record<string, unknown>;
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    if (url.pathname === "/backfill") {
      return this.backfill(payload);
    }

    if (typeof payload?.key !== "string" || payload.key.length === 0) {
      return json({ error: "invalid_key" }, 400);
    }

    const key = payload.key;

    switch (url.pathname) {
      case "/claim":
        return this.claim(
          key,
          positiveInt(payload.ttlSeconds, DEFAULT_CLAIM_TTL_DAYS * 86400),
        );
      case "/confirm":
        return this.confirm(
          key,
          positiveInt(payload.ttlSeconds, DEFAULT_CLAIM_TTL_DAYS * 86400),
        );
      case "/release":
        return this.release(
          key,
          positiveInt(payload.ttlSeconds, DEFAULT_PROVISIONAL_MINUTES * 60),
          payload.force === true,
        );
      case "/check":
        return this.check(key, payload);
      default:
        return json({ error: "not_found" }, 404);
    }
  }

  /** Atomically reserve a key. Returns claimed=false if already reserved. */
  private claim(key: string, ttlSeconds: number): Response {
    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;

    // A single statement makes check-and-reserve race-free. The WHERE clause
    // only refreshes an expired reservation, never a live one.
    const rows = this.ctx.storage.sql
      .exec<{ key: string }>(
        `INSERT INTO claims (key, expires_at) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET expires_at = excluded.expires_at
         WHERE claims.expires_at <= ?
         RETURNING key`,
        key,
        expiresAt,
        now,
      )
      .toArray();

    return json({ claimed: rows.length > 0 });
  }

  /**
   * Upgrade a live (typically provisional) claim to the full TTL. Returns
   * confirmed=false if the claim no longer exists or already expired.
   */
  private confirm(key: string, ttlSeconds: number): Response {
    const now = Date.now();
    const rows = this.ctx.storage.sql
      .exec<{ key: string }>(
        `UPDATE claims SET expires_at = MAX(expires_at, ?)
         WHERE key = ? AND expires_at > ?
         RETURNING key`,
        now + ttlSeconds * 1000,
        key,
        now,
      )
      .toArray();

    return json({ confirmed: rows.length > 0 });
  }

  /**
   * Release a reservation. By default only claims that are still provisional
   * (expiring within the provisional window) are deleted, so a late or
   * duplicate release from a failed request cannot erase a claim that a
   * concurrent request already confirmed for the full TTL.
   */
  private release(
    key: string,
    provisionalSeconds: number,
    force: boolean,
  ): Response {
    if (force) {
      const rows = this.ctx.storage.sql
        .exec<{ key: string }>(
          "DELETE FROM claims WHERE key = ? RETURNING key",
          key,
        )
        .toArray();

      return json({ released: rows.length > 0, forced: true });
    }

    const cutoff = Date.now() + provisionalSeconds * 1000 + RELEASE_SLACK_MS;
    const rows = this.ctx.storage.sql
      .exec<{ key: string }>(
        "DELETE FROM claims WHERE key = ? AND expires_at <= ? RETURNING key",
        key,
        cutoff,
      )
      .toArray();

    return json({ released: rows.length > 0 });
  }

  /** One-off import of already-signed-up emails (hashed by the Worker). */
  private backfill(payload: Record<string, unknown>): Response {
    const keys = Array.isArray(payload.keys)
      ? payload.keys.filter(
          (k): k is string => typeof k === "string" && k.length > 0,
        )
      : [];
    const invalid = typeof payload.invalid === "number" ? payload.invalid : 0;
    const expiresAt =
      Date.now() +
      positiveInt(payload.ttlSeconds, DEFAULT_CLAIM_TTL_DAYS * 86400) * 1000;

    let inserted = 0;
    this.ctx.storage.transactionSync(() => {
      for (const key of keys) {
        const rows = this.ctx.storage.sql
          .exec<{ key: string }>(
            `INSERT INTO claims (key, expires_at) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET
               expires_at = MAX(claims.expires_at, excluded.expires_at)
             RETURNING key`,
            key,
            expiresAt,
          )
          .toArray();
        inserted += rows.length;
      }
    });

    return json({ inserted, invalid });
  }

  private check(key: string, payload: Record<string, unknown>): Response {
    const hourlyLimit = positiveInt(payload.hourlyLimit, 5);
    const dailyLimit = positiveInt(payload.dailyLimit, 15);

    const now = Date.now();
    const hourBucket = Math.floor(now / HOUR_MS);
    const dayBucket = Math.floor(now / DAY_MS);

    // Single-statement upsert: read-modify-write in JS could interleave at
    // await points. SQLite makes this atomic.
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
        key,
        hourBucket,
        dayBucket,
      )
      .toArray();

    const hourCount = rows[0]?.hour_count ?? 1;
    const dayCount = rows[0]?.day_count ?? 1;

    const hourExceeded = hourCount > hourlyLimit;
    const dayExceeded = dayCount > dailyLimit;
    const allowed = !hourExceeded && !dayExceeded;

    let retryAfter = 0;
    if (!allowed) {
      // Wait for the longer of the windows that were actually exceeded.
      const hourWait = hourExceeded ? (hourBucket + 1) * HOUR_MS - now : 0;
      const dayWait = dayExceeded ? (dayBucket + 1) * DAY_MS - now : 0;
      retryAfter = Math.ceil(Math.max(hourWait, dayWait) / 1000);
    }

    return json({ allowed, retryAfter: Math.max(0, retryAfter) });
  }

  async alarm(): Promise<void> {
    const cutoff = Math.floor(Date.now() / DAY_MS) - RETENTION_DAYS;
    this.ctx.storage.sql.exec(
      "DELETE FROM counters WHERE day_bucket < ?",
      cutoff,
    );
    this.ctx.storage.sql.exec(
      "DELETE FROM claims WHERE expires_at <= ?",
      Date.now(),
    );
    await this.ctx.storage.setAlarm(Date.now() + DAY_MS);
  }
}
