import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort client IP for abuse checks.
 *
 * On Vercel the request headers are set by the platform, not the browser:
 *   x-vercel-forwarded-for  client IP, then any proxies
 *   x-real-ip               client IP
 *   x-forwarded-for         client IP, then any proxies
 *
 * Returns null when no usable value is present (e.g. local development), in
 * which case callers should skip IP-based checks rather than guess.
 */
export async function getClientIp(): Promise<string | null> {
  const h = await headers();

  const candidates = [
    h.get("x-vercel-forwarded-for"),
    h.get("x-real-ip"),
    h.get("x-forwarded-for"),
  ];

  for (const candidate of candidates) {
    const ip = firstToken(candidate);
    if (ip) return ip;
  }

  return null;
}

function firstToken(value: string | null): string | null {
  if (!value) return null;

  const first = value.split(",")[0]?.trim();
  if (!first) return null;

  // Strip an optional port: "203.0.113.4:51234" or "[2001:db8::1]:443"
  const withoutPort = first.startsWith("[")
    ? first.slice(0, first.indexOf("]") + 1).replace(/^\[|\]$/g, "")
    : first.replace(/:\d+$/, "");

  return withoutPort.length > 0 && withoutPort.length <= 64
    ? withoutPort
    : null;
}
