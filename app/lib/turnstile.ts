import "server-only";
import { turnstileConfig } from "@/app/lib/env";

/**
 * Verifies a Turnstile token.
 *
 * - If Turnstile isn't configured at all, verification is skipped so local
 *   development and previews without the keys still work.
 * - If it IS configured, a missing or invalid token is rejected. Allowing a
 *   missing token would let a bot bypass verification entirely by simply
 *   omitting `cf-turnstile-response`.
 * - If Cloudflare's endpoint errors or times out, we fail open so an outage
 *   on their side doesn't take down lead capture.
 */
export async function verifyTurnstile(token: string | null): Promise<boolean> {
  if (!turnstileConfig.success) {
    // Not configured at all — skip verification entirely.
    return true;
  }

  if (!token) {
    // Turnstile IS configured but the client didn't send a token. Reject:
    // otherwise bots could skip the widget and submit directly.
    console.warn("[Turnstile] No token provided — rejecting submission.");
    return false;
  }

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: turnstileConfig.data.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      },
    );

    if (!res.ok) {
      console.error("[Turnstile] Verification request failed:", res.status);
      return true; // fail open
    }

    const data = await res.json();
    if (data.success !== true) {
      console.warn(
        "[Turnstile] Verification rejected:",
        data["error-codes"] ?? "unknown",
      );
    }
    return data.success === true;
  } catch (err) {
    console.error("[Turnstile] Verification errored:", err);
    return true; // fail open — Cloudflare being down shouldn't break signups
  }
}
