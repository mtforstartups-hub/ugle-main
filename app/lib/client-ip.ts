import "server-only";
import { headers } from "next/headers";
import { isIP } from "node:net";

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

  const withoutPort = stripPort(first);

  return withoutPort.length > 0 && withoutPort.length <= 64
    ? withoutPort
    : null;
}

// Strip an optional port: "203.0.113.4:51234" or "[2001:db8::1]:443"
function stripPort(addr: string): string {
  // Bracketed IPv6, with or without a port: "[::1]:8080" or "[::1]"
  if (addr.startsWith("[")) {
    const end = addr.indexOf("]");
    return end === -1 ? addr : addr.slice(1, end);
  }

  // Already a valid bare IPv4 or IPv6 address, so there's no port to strip
  if (isIP(addr)) return addr;

  // "1.2.3.4:80" or "example.com:80"
  const i = addr.lastIndexOf(":");
  return i === -1 ? addr : addr.slice(0, i);
}
