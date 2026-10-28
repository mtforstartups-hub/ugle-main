import "server-only";

/**
 * Durable rate limiting and email claims backed by the Cloudflare Worker in
 * `workers/rate-limit`.
 *
 * The Worker owns the state (SQLite-backed Durable Object), so limits and
 * duplicate claims are shared across every Vercel serverless instance and
 * survive deployments - unlike the in-memory limiter in `rate-limit.ts`.
 *
 * Deliberately fails open: if the Worker is unreachable, slow, not configured,
 * or not yet redeployed with the `/claim` endpoint, the caller falls back to
 * its other protections. A store outage must never block real customers.
 */

const WORKER_URL = process.env.RATE_LIMIT_WORKER_URL?.replace(/\/+$/, "");
const WORKER_SECRET = process.env.RATE_LIMIT_WORKER_SECRET;

const TIMEOUT_MS = 2000;

/** Per-email limits. One trial per inbox is enforced separately by `claimEmail`. */
const EMAIL_HOURLY_LIMIT = 3;
const EMAIL_DAILY_LIMIT = 6;

export type IpRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  /**
   * True only when the durable store actually answered. When false the caller
   * should apply its local fallback instead of trusting `allowed`.
   */
  checked: boolean;
};

export type EmailClaimResult = {
  /**
   * True only when the durable store answered, making `claimed` authoritative.
   * False means "unknown / unavailable" - never treat it as "not claimed".
   */
  durable: boolean;
  claimed: boolean;
};

const ALLOWED: IpRateLimitResult = {
  allowed: true,
  retryAfterSeconds: 0,
  checked: false,
};

export function isIpRateLimitConfigured(): boolean {
  return Boolean(WORKER_URL && WORKER_SECRET);
}

async function post(path: string, body: unknown): Promise<Response | null> {
  if (!WORKER_URL || !WORKER_SECRET) return null;

  try {
    return await fetch(`${WORKER_URL}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${WORKER_SECRET}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    console.error(`[RateLimit] ${path} request failed:`, err);
    return null;
  }
}

async function readJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    const data = await res.json();
    return data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

async function checkRateLimit(
  body: Record<string, unknown>,
): Promise<IpRateLimitResult> {
  const res = await post("/check", body);
  if (!res) return ALLOWED;

  if (!res.ok) {
    console.error("[RateLimit] Worker responded:", res.status);
    return ALLOWED;
  }

  const data = await readJson(res);
  if (!data) return ALLOWED;

  const retryAfterSeconds =
    typeof data.retryAfter === "number" && data.retryAfter > 0
      ? data.retryAfter
      : 0;

  return {
    allowed: data.allowed !== false,
    retryAfterSeconds,
    checked: true,
  };
}

export function checkIpRateLimit(ip: string): Promise<IpRateLimitResult> {
  return checkRateLimit({ key: ip, namespace: "ip" });
}

/**
 * Cross-instance per-email limiter. Normalize the address before calling so
 * aliases share one bucket. Callers should fall back to the in-memory limiter
 * when `checked` is false.
 */
export function checkEmailRateLimit(
  normalizedEmail: string,
): Promise<IpRateLimitResult> {
  return checkRateLimit({
    key: normalizedEmail,
    namespace: "email",
    hourlyLimit: EMAIL_HOURLY_LIMIT,
    dailyLimit: EMAIL_DAILY_LIMIT,
  });
}

/**
 * Atomically reserve an email in the durable store. Two concurrent requests
 * for the same inbox cannot both get `{ durable: true, claimed: true }`.
 */
export async function claimEmail(
  normalizedEmail: string,
): Promise<EmailClaimResult> {
  const res = await post("/claim", {
    key: normalizedEmail,
    namespace: "email",
  });

  if (!res) return { durable: false, claimed: false };

  if (!res.ok) {
    console.error("[RateLimit] Claim responded:", res.status);
    return { durable: false, claimed: false };
  }

  const data = await readJson(res);
  if (typeof data?.claimed !== "boolean") {
    return { durable: false, claimed: false };
  }

  return { durable: true, claimed: data.claimed };
}

/**
 * Undo a reservation when the submission could not be captured anywhere, so a
 * transient outage does not permanently block the user's email.
 */
export async function releaseEmailClaim(
  normalizedEmail: string,
): Promise<void> {
  const res = await post("/release", {
    key: normalizedEmail,
    namespace: "email",
  });

  if (res && !res.ok) {
    console.error("[RateLimit] Release responded:", res.status);
  }
}
