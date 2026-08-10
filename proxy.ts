import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  REGION_COOKIE,
  COUNTRY_TO_REGION,
  DEFAULT_REGION,
  ALL_REGIONS,
  type Region,
} from "./app/lib/priceConfig";

function detectRegion(request: NextRequest): Region {
  // 1. Already set by user (manual override via footer switcher) — honour it
  const existing = request.cookies.get(REGION_COOKIE)?.value as
    | Region
    | undefined;
  if (existing && (ALL_REGIONS as string[]).includes(existing)) return existing;

  // 2. Cloudflare geo header (available on Vercel / CF-backed deployments)
  const cfCountry = request.headers.get("CF-IPCountry") ?? "";
  if (cfCountry && COUNTRY_TO_REGION[cfCountry])
    return COUNTRY_TO_REGION[cfCountry];

  // 3. Accept-Language best-effort fallback
  const lang = request.headers.get("accept-language") ?? "";
  if (/\ben-GB\b/i.test(lang)) return "GB";
  if (/\ben-IN\b/i.test(lang)) return "IN";
  if (/\b(de|fr|nl|es|it|pl)\b/i.test(lang)) return "EU";

  return DEFAULT_REGION;
}

export function proxy(request: NextRequest) {
  const region = detectRegion(request);
  const response = NextResponse.next();
  response.cookies.set(REGION_COOKIE, region, {
    maxAge: 60 * 60 * 24, // 1 day — re-detects if user travels
    path: "/",
    sameSite: "lax",
    httpOnly: false, // readable by client JS for the footer switcher
  });
  return response;
}

export const config = {
  matcher: [
    // Only run on pricing page — zero overhead elsewhere
    "/pricing",
    "/pricing/:path*",
  ],
};
