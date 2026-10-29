"use server";
import * as z from "zod";
import { getResendClient } from "@/app/lib/resend";
import { resendConfig, trialApiConfig } from "@/app/lib/env";
import { verifyTurnstile } from "@/app/lib/turnstile";
import { validateHoneypot } from "@/app/lib/honeypot";
import {
  DISPOSABLE_EMAIL_MESSAGE,
  isDisposableEmail,
} from "@/app/lib/disposable-email";
import { normalizeEmail } from "@/app/lib/email-identity";
import { getClientIp } from "@/app/lib/client-ip";
import { checkIpRateLimit } from "@/app/lib/ip-rate-limit";
import { emailField, singleLineText, subjectText } from "@/app/lib/validation";
import {
  TrialAdminAlertEmail,
  TrialAdminNotificationEmail,
  TrialConfirmationEmail,
} from "../components/email-templates/TrialTemplates";
import { TrialSheetService } from "@/app/lib/sheets";

const requestTrialSchema = z.object({
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
 * Extract honeypot value from formData.
 * The honeypot field should be hidden via CSS; bots typically fill it in.
 */
function getHoneypotValue(formData: FormData): string | null {
  const value = formData.get("ugle-honeypot");
  // `FormData.get` can return a File; treat any uploaded value as suspicious
  // rather than casting it to string.
  if (value === null) return null;
  return typeof value === "string" ? value : "non-string-value";
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

// ---------------------------------------------------------------------------
// Trial API
// ---------------------------------------------------------------------------

type TrialApiOutcome =
  | { status: "ok" }
  | { status: "cap_reached" }
  | { status: "trials_disabled" }
  | { status: "needs_manual_check" }
  | { status: "skipped" };

/**
 * POST to the ugle-api trial provisioning endpoint.
 *
 * ugle-api is the authoritative system for email deduplication and key
 * provisioning. 202 is returned for both new and repeat emails (repeat
 * re-sends the existing key). The site never tells the visitor whether their
 * email is already registered.
 *
 * Rules from trial.md:
 * - 202                      → ok (new key issued, or existing key re-sent)
 * - 503 cap_reached          → cap_reached  (global cap; no key issued)
 * - 503 trials_disabled      → trials_disabled (admin must send key manually)
 * - other 5xx / timeout /
 *   503 unavailable          → retry once after 2 s; if retry resolves to
 *                              202 or cap_reached handle as those; otherwise
 *                              → needs_manual_check
 * - 400 / 401                → needs_manual_check (never retried)
 *
 * Returns "skipped" when TRIAL_API_SECRET is not configured.
 */
async function callTrialApi(params: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  os: string;
}): Promise<TrialApiOutcome> {
  if (!trialApiConfig.success) return { status: "skipped" };

  const { TRIAL_API_SECRET, TRIAL_API_URL } = trialApiConfig.data;
  const body = JSON.stringify({
    first_name: params.firstName,
    last_name: params.lastName,
    email: params.email,
    phone: params.phone,
    // API spec: os must be the literal string "macos" (the only accepted value).
    os: "macos",
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TRIAL_API_SECRET}`,
  };

  async function attempt(): Promise<Response | null> {
    try {
      return await fetch(TRIAL_API_URL, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      return null; // timeout or network error
    }
  }

  async function parseOutcome(
    res: Response | null,
  ): Promise<TrialApiOutcome | null> {
    if (!res) return null; // transient failure — eligible for retry

    if (res.status === 202) {
      console.log("[RequestTrial] Trial API accepted the request (202).");
      return { status: "ok" };
    }

    if (res.status === 503) {
      let json: { error?: string } = {};
      try {
        json = await res.json();
      } catch {
        // empty or non-JSON body — treat as transient
      }
      if (json.error === "cap_reached") return { status: "cap_reached" };
      if (json.error === "trials_disabled")
        return { status: "trials_disabled" };
      return null; // 503 unavailable — transient
    }

    // 400 / 401: not retried (would fail the same way)
    if (res.status === 400 || res.status === 401) {
      console.error(
        "[RequestTrial] Trial API rejected the request:",
        res.status,
      );
      return { status: "needs_manual_check" };
    }

    return null; // other 5xx — transient
  }

  const firstOutcome = await parseOutcome(await attempt());
  if (firstOutcome !== null) return firstOutcome;

  // Single server-side retry after 2 s (never ask the visitor to retry)
  await new Promise((r) => setTimeout(r, 2_000));
  const retryOutcome = await parseOutcome(await attempt());
  if (retryOutcome !== null) return retryOutcome;

  return { status: "needs_manual_check" };
}

/**
 * Dispatch an urgent notification to the admin when ugle-api returns a code
 * that requires manual intervention. Non-blocking and fails safe.
 */
async function sendAdminAlertEmail(params: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  os: string;
  submittedAt: string;
  notice: string;
  subject: string;
}): Promise<void> {
  if (!resendConfig.success) return;

  try {
    const resend = getResendClient();
    if (!resend) return;

    await resend.batch.send([
      {
        from: `Ugle <${resendConfig.data.RESEND_FROM_EMAIL}>`,
        to: resendConfig.data.ADMIN_EMAIL,
        subject: params.subject,
        react: TrialAdminAlertEmail({
          firstName: params.firstName,
          lastName: params.lastName,
          email: params.email,
          phone: params.phone,
          os: params.os,
          submittedAt: params.submittedAt,
          notice: params.notice,
        }),
      },
    ]);
  } catch (err) {
    console.error("[RequestTrial] Failed to send admin alert email:", err);
  }
}

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------

export async function requestTrial(
  initialState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const turnstileValue = formData.get("cf-turnstile-response");
    const turnstileToken =
      typeof turnstileValue === "string" ? turnstileValue : null;
    const honeypotValue = getHoneypotValue(formData);

    // 1. Honeypot check first — it is free, so obvious bots never reach the
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
    const result = requestTrialSchema.safeParse(raw);

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

    // 4. IP rate limiting — catches one IP cycling through many addresses.
    // Email-level deduplication is delegated entirely to ugle-api, which
    // returns 202 for both new and repeat emails (re-sending the existing key).
    // Skipped when no client IP is available or the limiter isn't configured.
    const clientIp = await getClientIp();
    if (clientIp) {
      const ipCheck = await checkIpRateLimit(clientIp);
      if (!ipCheck.allowed) {
        const minutes = Math.max(1, Math.ceil(ipCheck.retryAfterSeconds / 60));
        const message = `Too many trial requests from your network. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`;
        return { success: false, message, error: message };
      }
    }

    const { firstName, lastName, email, phone, os } = result.data;
    // Normalize before calling ugle-api so Gmail dots and +tags resolve to the
    // same address. Resend and Sheets use the original address — the user
    // entered it, and their inbox is at the un-normalized address.
    const normalizedEmail = normalizeEmail(email);

    const submittedAt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());

    // 5. Fire all three integrations concurrently.
    //
    // Promise.allSettled guarantees all are always attempted regardless of
    // whether another one fails. Each is inside an async thunk so a
    // synchronous throw inside the thunk cannot escape allSettled and prevent
    // the other integrations from running.
    //
    // ugle-api is the authoritative system. Resend and Sheets are lead-record
    // integrations only — their outcome does NOT gate the visitor's response.
    const [emailResult, sheetsResult, trialApiResult] =
      await Promise.allSettled([
        // Operation 1: Send confirmation + admin notification emails via Resend
        (async () => {
          if (!resendConfig.success) {
            throw new Error("Resend is not configured");
          }
          return getResendClient()!.batch.send([
            {
              from: `Ugle <${resendConfig.data.RESEND_FROM_EMAIL}>`,
              to: [email],
              subject: `${firstName}, your Ugle trial request is confirmed ⚡`,
              react: TrialConfirmationEmail({ firstName, email, os }),
            },
            {
              from: `Ugle <${resendConfig.data.RESEND_FROM_EMAIL}>`,
              to: resendConfig.data.ADMIN_EMAIL,
              subject: `New trial request: ${firstName} ${lastName} (${os})`,
              react: TrialAdminNotificationEmail({
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
          return new TrialSheetService().append({
            firstName,
            lastName,
            email,
            phone,
            os,
            submittedAt,
          });
        })(),

        // Operation 3: Provision trial key via ugle-api (server-side only;
        // secret never touches the browser).
        callTrialApi({
          firstName,
          lastName,
          email: normalizedEmail,
          phone,
          os,
        }),
      ]);

    // Log lead-record failures for visibility — these do not affect the visitor.
    const emailOk =
      emailResult.status === "fulfilled" &&
      !emailResult.value.error &&
      sentEmailCount(emailResult.value) === 2;

    if (emailResult.status === "rejected") {
      console.error("[RequestTrial] Resend failed:", emailResult.reason);
    } else if (emailResult.value.error) {
      console.error(
        "[RequestTrial] Resend batch error:",
        emailResult.value.error,
      );
    }

    if (sheetsResult.status === "rejected") {
      console.error(
        "[RequestTrial] Google Sheets failed:",
        sheetsResult.reason,
      );
    }

    if (!emailOk && sheetsResult.status === "fulfilled") {
      console.error(
        "[RequestTrial] ALERT: lead saved to Sheets but no emails were sent — admin was not notified.",
        { os, submittedAt },
      );
    }

    // 6. Visitor response — driven entirely by ugle-api outcome.
    //    Only cap_reached changes the visitor's message (trial.md).
    if (trialApiResult.status === "rejected") {
      console.error(
        "[RequestTrial] Trial API call threw:",
        trialApiResult.reason,
      );
    }

    const trialOutcome: TrialApiOutcome =
      trialApiResult.status === "fulfilled"
        ? trialApiResult.value
        : { status: "needs_manual_check" };

    switch (trialOutcome.status) {
      case "ok":
        return { success: true, message: "Check your inbox for your key." };

      case "cap_reached":
        return {
          success: true,
          message:
            "We're overwhelmed by the response — email support@ugle.ai and we'll send your trial key.",
        };

      case "trials_disabled": {
        const notice =
          "ugle-api did NOT accept this request — send the key by hand";
        console.error(`[RequestTrial] ALERT: ${notice}`, { os, submittedAt });
        await sendAdminAlertEmail({
          firstName,
          lastName,
          email,
          phone,
          os,
          submittedAt,
          notice,
          subject: `⚠️ ACTION REQUIRED: ugle-api did NOT accept trial request for ${firstName} ${lastName}`,
        });
        return { success: true, message: "Check your inbox for your key." };
      }

      case "needs_manual_check": {
        const notice = `ugle-api may not have accepted this request. Run \`ugle-api trial reissue --email ${email}\` first: hand-send a key only if it reports no trial.`;
        console.error(`[RequestTrial] ALERT: ${notice}`, { os, submittedAt });
        await sendAdminAlertEmail({
          firstName,
          lastName,
          email,
          phone,
          os,
          submittedAt,
          notice,
          subject: `⚠️ ACTION REQUIRED: Verify trial key for ${firstName} ${lastName}`,
        });
        return { success: true, message: "Check your inbox for your key." };
      }

      case "skipped":
        // ugle-api not configured — fall back to whether a lead was captured.
        if (emailOk || sheetsResult.status === "fulfilled") {
          return { success: true, message: "Request submitted" };
        }
        return {
          success: false,
          message: "Something went wrong. Please try again.",
          error: "Something went wrong. Please try again.",
        };
    }
  } catch (err) {
    console.error("[RequestTrial] Unexpected error:", err);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
      error: "Unexpected error",
    };
  }
}
