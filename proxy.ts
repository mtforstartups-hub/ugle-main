import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  REGION_COOKIE,
  REGION_HEADER,
  COUNTRY_TO_REGION,
  DEFAULT_REGION,
  ALL_REGIONS,
  type Region,
} from "./app/lib/priceConfig";

type DetectionResult = {
  region: Region;
  reason: "cookie" | "vercel-geo" | "accept-language" | "default";
  // raw signal values for debugging
  cookieValue: string | null;
  vercelCountry: string | null;
  acceptLanguage: string | null;
};

function detectRegion(request: NextRequest): DetectionResult {
  const cookieValue = request.cookies.get(REGION_COOKIE)?.value ?? null;
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  const acceptLanguage = request.headers.get("accept-language");

  // 1. Honour an existing user-set cookie (manual footer override)
  if (cookieValue && (ALL_REGIONS as string[]).includes(cookieValue)) {
    return {
      region: cookieValue as Region,
      reason: "cookie",
      cookieValue,
      vercelCountry,
      acceptLanguage,
    };
  }

  // 2. Vercel geo header (x-vercel-ip-country, injected on every Vercel request)
  if (vercelCountry && COUNTRY_TO_REGION[vercelCountry]) {
    return {
      region: COUNTRY_TO_REGION[vercelCountry],
      reason: "vercel-geo",
      cookieValue,
      vercelCountry,
      acceptLanguage,
    };
  }

  // 3. Accept-Language best-effort fallback (useful in local dev)
  if (acceptLanguage) {
    if (/\ben-GB\b/i.test(acceptLanguage))
      return { region: "GB", reason: "accept-language", cookieValue, vercelCountry, acceptLanguage };
    if (/\ben-IN\b/i.test(acceptLanguage))
      return { region: "IN", reason: "accept-language", cookieValue, vercelCountry, acceptLanguage };
    if (/\b(de|fr|nl|es|it|pl)\b/i.test(acceptLanguage))
      return { region: "EU", reason: "accept-language", cookieValue, vercelCountry, acceptLanguage };
  }

  // 4. Nothing matched — fall back to default
  return {
    region: DEFAULT_REGION,
    reason: "default",
    cookieValue,
    vercelCountry,
    acceptLanguage,
  };
}

export function proxy(request: NextRequest) {
  const detection = detectRegion(request);

  // ── Structured log — visible in Vercel function logs ────────────────────────
  console.log("[ugle/region]", JSON.stringify({
    url: request.nextUrl.pathname,
    selected: detection.region,
    reason: detection.reason,
    signals: {
      cookie: detection.cookieValue,
      "x-vercel-ip-country": detection.vercelCountry,
      "accept-language": detection.acceptLanguage,
    },
  }));
  // ────────────────────────────────────────────────────────────────────────────

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REGION_HEADER, detection.region);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.cookies.set(REGION_COOKIE, detection.region, {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}


export const config = {
  matcher: [
    // Run on all paths except static files, API routes, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
