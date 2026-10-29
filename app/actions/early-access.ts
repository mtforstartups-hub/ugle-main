"use server";
import * as z from "zod";
import { getResendClient } from "@/app/lib/resend";
import { resendConfig, sheetsConfig } from "@/app/lib/env";
import {
  EarlyAccessConfirmationEmail,
  EarlyAccessAdminNotificationEmail,
} from "../components/email-templates/EarlyAccessTemplates";
import { EarlyAccessSheetService } from "@/app/lib/sheets";
import { verifyTurnstile } from "@/app/lib/turnstile";
import { rateLimit } from "@/app/lib/rate-limit";
import { validateHoneypot } from "@/app/lib/honeypot";
import {
  DISPOSABLE_EMAIL_MESSAGE,
  isDisposableEmail,
} from "@/app/lib/disposable-email";
import { normalizeEmail } from "@/app/lib/email-identity";
import { getClientIp } from "@/app/lib/client-ip";
import {
  checkEmailRateLimit,
  checkIpRateLimit,
  claimEmail,
  confirmEmailClaim,
  releaseEmailClaim,
} from "@/app/lib/ip-rate-limit";
import {
  emailField,
  singleLineText,
  subjectText,
} from "@/app/lib/validation";

const earlyAccessSchema = z.object({
  firstName: subjectText("First name is required"),
  lastName: subjectText("Last name is required"),
  // Trial requests are the main abuse target: block throwaway inboxes so one
  // person can't farm unlimited trials with disposable aliases.
  email: emailField().refine(
    (value) => !isDisposableEmail(value),
    DISPOSABLE_EMAIL_MESSAGE,
  ),
  phone: singleLineText("Contact number is required", 30),
  os: z.enum(["macOS", "Windows"], {
    error: "Please select your primary OS",
  }),
  // Honeypot field - bots will fill this in, humans will leave empty
  "ugle-honeypot": z.string().optional(),
});

export type ActionState = {
  success: boolean;
  message: string;
  error?: string;
};

/**
 * Extract honeypot value from formData
 * The honeypot field should be hidden via CSS; bots typically fill it in.
 */
function getHoneypotValue(formData: FormData): string | null {
  const value = formData.get("ugle-honeypot");
  // `FormData.get` can return a File; treat any uploaded value as suspicious
  // rather than casting it to string.
  if (value === null) return null;
  return typeof value === "string" ? value : "non-string-value";
}

function duplicateEmailResponse(): ActionState {
  const message =
    "A trial has already been requested with this email. Contact support if you need help accessing it.";
  return { success: false, message, error: message };
}

/**
 * Number of emails Resend reports as sent. The batch response nests the
 * per-email results as `{ data: { data: [{ id }] } }`.
 */
function sentEmailCount(response: unknown): number {
  if (!response || typeof response !== "object") return 0;
  const res = response as { data?: unknown };
  if (Array.isArray(res.data)) {
    return res.data.length;
  }
  const body = res.data as { data?: unknown } | null | undefined;
  return body && Array.isArray(body.data) ? body.data.length : 0;
}

export async function requestEarlyAccess(
  initialState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const turnstileValue = formData.get("cf-turnstile-response");
    const turnstileToken =
      typeof turnstileValue === "string" ? turnstileValue : null;
    const honeypotValue = getHoneypotValue(formData);

    // 1. Honeypot check first - it is free, so obvious bots never reach the
    // (paid, networked) Turnstile verification step.
    const honeypotResult = validateHoneypot(honeypotValue);
    if (!honeypotResult.isValid) {
      return {
        success: false,
        message: honeypotResult.error,
        error: honeypotResult.error,
      };
    }

    // 2. Zod schema validation. This is local and free, so it runs before
    // Turnstile: a typo in the form must not consume the single-use token
    // (otherwise the corrected retry fails verification).
    const raw = Object.fromEntries(formData);
    const result = earlyAccessSchema.safeParse(raw);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid input";
      return { success: false, message: errorMsg, error: errorMsg };
    }

    // 3. Turnstile verification
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) {
      return {
        success: false,
        message: "Verification failed. Please try again.",
        error: "Verification failed. Please try again.",
      };
    }

    // 4. IP rate limiting (Cloudflare Worker + Durable Object). This is the
    // layer that catches one person cycling through fresh email addresses.
    // Skipped when no client IP is available or the limiter isn't configured.
    const clientIp = await getClientIp();
    if (clientIp) {
      const ipCheck = await checkIpRateLimit(clientIp);
      if (!ipCheck.allowed) {
        const minutes = Math.max(
          1,
          Math.ceil(ipCheck.retryAfterSeconds / 60),
        );
        const message = `Too many trial requests from your network. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`;
        return { success: false, message, error: message };
      }
    }

    // 5. Rate limiting per normalized email - prevent flooding across
    // instances. Normalizing first means aliases share one bucket. The durable
    // limiter is authoritative when available; the in-memory limiter is only a
    // per-instance fallback (it resets on cold starts).
    const normalizedEmail = normalizeEmail(result.data.email);
    const emailRateLimit = await checkEmailRateLimit(normalizedEmail);
    const emailAllowed = emailRateLimit.checked
      ? emailRateLimit.allowed
      : rateLimit(`earlyaccess-${normalizedEmail}`, {
          limit: 3,
          interval: 60 * 60 * 1000, // 1 hour
        }).success;

    if (!emailAllowed) {
      const message =
        "You've submitted too many requests. Please wait an hour before trying again.";
      return {
        success: false,
        message,
        error: message,
      };
    }

    const { firstName, lastName, email, phone, os } = result.data;

    // 6. One trial request per inbox. Aliases (j.doe+trial2@gmail.com) resolve
    // to the same normalized address, so they can't farm extra trials.
    //
    // The durable claim is atomic, so two concurrent submissions cannot both
    // pass (a Sheets read-then-append cannot guarantee that). It also removes
    // the O(n) full-column read on every submission and no longer depends on
    // Sheets being configured. Sheets is only read as a fallback when the
    // claim store is unavailable.
    //
    // The claim is provisional (short TTL): it is promoted to the full TTL only
    // after a lead has actually been captured. If this request dies between
    // here and the integrations, the reservation lapses on its own instead of
    // blocking the inbox for months.
    let claimHeld = false;
    const claim = await claimEmail(normalizedEmail, { provisional: true });

    if (claim.durable) {
      if (!claim.claimed) {
        return duplicateEmailResponse();
      }
      claimHeld = true;
    } else if (sheetsConfig.success && normalizedEmail) {
      try {
        const existingEmails = await new EarlyAccessSheetService().emails();
        const alreadyRequested = existingEmails.some(
          (existing) => normalizeEmail(existing) === normalizedEmail,
        );

        if (alreadyRequested) {
          return duplicateEmailResponse();
        }
      } catch (err) {
        // Fail open: a Sheets outage must not block genuine signups.
        console.error("[EarlyAccess] Duplicate email check failed:", err);
      }
    } else {
      console.warn(
        "[EarlyAccess] No durable claim store or Sheets configured - duplicate trial protection is disabled.",
      );
    }

    const submittedAt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());

    // 7. Subjects are built from these already-validated fields: Zod rejects
    // any control characters, so they can't carry header-injection payloads.
    // Run both operations concurrently and independently.
    // Promise.allSettled guarantees both are always attempted regardless of
    // whether the other one fails.
    // Each operation is started inside an async thunk. This matters because a
    // *synchronous* throw while building the call (e.g. a client factory or a
    // service constructor throwing) would otherwise escape Promise.allSettled
    // and prevent the other integration from running at all.
    const [emailResult, sheetsResult] = await Promise.allSettled([
      // Operation 1: Send confirmation + admin notification emails via Resend
      (async () => {
        if (!resendConfig.success) {
          throw new Error("Resend is not configured");
        }

        return getResendClient()!.batch.send([
          {
            from: `Ugle <${resendConfig.data.RESEND_FROM_EMAIL}>`,
            to: [email],
            subject: `${firstName}, you're on the Ugle early access list ⚡`,
            react: EarlyAccessConfirmationEmail({ firstName, email, os }),
          },
          {
            from: `Ugle <${resendConfig.data.RESEND_FROM_EMAIL}>`,
            to: resendConfig.data.ADMIN_EMAIL,
            subject: `New early access request: ${firstName} ${lastName} (${os})`,
            react: EarlyAccessAdminNotificationEmail({
              firstName,
              lastName,
              email,
              phone,
              os,
              submittedAt,
            }),
          },
        ]);
      })(),

      // Operation 2: Append lead row to Google Sheets
      (async () => {
        return new EarlyAccessSheetService().append({
          firstName,
          lastName,
          email,
          phone,
          os,
          submittedAt,
        });
      })(),
    ]);

    // Log individual failures server-side for visibility
    if (emailResult.status === "rejected") {
      console.error("[EarlyAccess] Resend failed:", emailResult.reason);
    } else if (emailResult.value.error) {
      console.error(
        "[EarlyAccess] Resend batch error:",
        emailResult.value.error,
      );
    }

    if (sheetsResult.status === "rejected") {
      console.error("[EarlyAccess] Google Sheets failed:", sheetsResult.reason);
    }

    // Option A: succeed if at least one method captured the lead.
    //
    // Resend's batch endpoint defaults to strict validation (all-or-nothing),
    // but we still require both message IDs: if the response is ever truncated
    // or sent with permissive validation, a missing ID means that recipient
    // did not get their email.
    const emailOk =
      emailResult.status === "fulfilled" &&
      !emailResult.value.error &&
      sentEmailCount(emailResult.value) === 2;
    const sheetsOk = sheetsResult.status === "fulfilled";

    if (!emailOk && !sheetsOk) {
      // Nothing captured this lead: release the reservation so the same inbox
      // can retry once the outage is over.
      if (claimHeld) {
        await releaseEmailClaim(normalizedEmail);
      }

      return {
        success: false,
        message: "Something went wrong. Please try again.",
        error: "Something went wrong. Please try again.",
      };
    }

    if (!emailOk && sheetsOk) {
      // The lead is safe in Sheets, but neither the user nor the admin got an
      // email. Surface it as an actionable failure (no PII in the log).
      console.error(
        "[EarlyAccess] ALERT: lead saved to Sheets but no emails were sent - admin was not notified.",
        { os, submittedAt },
      );
    }

    // Promote the provisional reservation to the full TTL now that the lead is
    // captured. Awaited so a serverless runtime cannot drop it, but never fatal:
    // if it fails the claim simply lapses early.
    if (claimHeld) {
      const confirmation = await confirmEmailClaim(normalizedEmail);
      if (!confirmation.confirmed) {
        console.warn(
          "[EarlyAccess] Claim confirmation failed - duplicate protection for this email lapses when the provisional claim expires.",
          { durable: confirmation.durable },
        );
      }
    }

    return { success: true, message: "Request submitted" };
  } catch (err) {
    console.error("[EarlyAccess] Unexpected error:", err);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
      error: "Unexpected error",
    };
  }
}
