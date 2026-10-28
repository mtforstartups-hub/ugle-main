import "server-only";

/**
 * Simple in-memory rate limiter with a fixed window.
 * Note: In-memory only works for single-instance deployments.
 * For multi-instance, use D1/KV or Redis.
 *
 * Usage: rateLimit(key, { limit, interval })
 * Returns: { success, remaining, reset }
 */

const MAX_ENTRIES = 10000;
const DEFAULT_INTERVAL = 60 * 1000; // 1 minute

const limiter = new Map<string, { count: number; resetAt: number }>();

function cleanOldEntries() {
  const now = Date.now();
  for (const [key, entry] of limiter.entries()) {
    if (now > entry.resetAt) {
      limiter.delete(key);
    }
  }
  // Enforce max entries
  if (limiter.size > MAX_ENTRIES) {
    // Remove oldest entries
    const entries = Array.from(limiter.entries());
    entries.sort((a, b) => a[1].resetAt - b[1].resetAt);
    for (let i = 0; i < entries.length - MAX_ENTRIES; i++) {
      limiter.delete(entries[i][0]);
    }
  }
}

export function rateLimit(
  key: string,
  options: { limit: number; interval?: number } = {
    limit: 5,
    interval: DEFAULT_INTERVAL,
  },
) {
  cleanOldEntries();
  const now = Date.now();
  const { limit, interval = DEFAULT_INTERVAL } = options;

  const entry = limiter.get(key);

  // Expired entries are normally removed by cleanOldEntries(), but keep this
  // guard so the window still resets correctly if cleanup is skipped.
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + interval;
    limiter.set(key, { count: 1, resetAt });
    return {
      success: 1 <= limit,
      remaining: Math.max(0, limit - 1),
      reset: resetAt,
    };
  }

  // Fixed window: the reset time is anchored to the first request and is NOT
  // extended on subsequent requests, otherwise a client could keep pushing
  // the window forward indefinitely.
  entry.count++;
  limiter.set(key, entry);

  return {
    success: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.resetAt,
  };
}

/**
 * Get rate limit status for a key
 */
export function getRateLimitEntry(key: string) {
  const entry = limiter.get(key);
  const now = Date.now();
  if (!entry || entry.resetAt <= now) {
    return { count: 0, reset: 0, active: false };
  }
  return { count: entry.count, reset: entry.resetAt, active: true };
}

// Export for cleanup on server restarts (best effort)
export { cleanOldEntries };

/** Reset all counters — used by tests for isolation. */
export function resetRateLimits() {
  limiter.clear();
}
