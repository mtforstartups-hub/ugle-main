import "server-only";

/**
 * IP rate limiting backed by the Cloudflare Worker in `workers/rate-limit`.
 *
 * The Worker owns the counters (SQLite-backed Durable Object), so limits are
 * shared across every Vercel serverless instance and survive deployments —
 * unlike the in-memory limiter in `rate-limit.ts`.
 *
 * Deliberately fails open: if the Worker is unreachable, slow, or not
 * configured, the submission proceeds. A rate-limiter outage must never block
 * real customers.
 */

const WORKER_URL = process.env.RATE_LIMIT_WORKER_URL?.replace(/\/+$/, "");
const WORKER_SECRET = process.env.RATE_LIMIT_WORKER_SECRET;

const TIMEOUT_MS = 2000;

export type IpRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const ALLOWED: IpRateLimitResult = { allowed: true, retryAfterSeconds: 0 };

export function isIpRateLimitConfigured(): boolean {
  return Boolean(WORKER_URL && WORKER_SECRET);
}

export async function checkIpRateLimit(ip: string): Promise<IpRateLimitResult> {
  if (!WORKER_URL || !WORKER_SECRET) return ALLOWED;

  try {
    const res = await fetch(`${WORKER_URL}/check`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${WORKER_SECRET}`,
      },
      body: JSON.stringify({ key: ip }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[IpRateLimit] Worker responded:", res.status);
      return ALLOWED;
    }

    const data = (await res.json()) as {
      allowed?: unknown;
      retryAfter?: unknown;
    };

    const retryAfter =
      typeof data.retryAfter === "number" && data.retryAfter > 0
        ? data.retryAfter
        : 0;

    return {
      allowed: data.allowed !== false,
      retryAfterSeconds: retryAfter,
    };
  } catch (err) {
    console.error("[IpRateLimit] Check failed:", err);
    return ALLOWED;
  }
}
