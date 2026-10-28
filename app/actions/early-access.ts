"use server";
import * as z from "zod";
import { getResendClient } from "@/app/lib/resend";
import { resendConfig } from "@/app/lib/env";
import {
  EarlyAccessConfirmationEmail,
  EarlyAccessAdminNotificationEmail,
} from "../components/email-templates/EarlyAccessTemplates";
import { EarlyAccessSheetService } from "@/app/lib/sheets";
import { verifyTurnstile } from "@/app/lib/turnstile";
import { rateLimit } from "@/app/lib/rate-limit";
import { validateHoneypot } from "@/app/lib/honeypot";
import {
  emailField,
  singleLineText,
  subjectText,
} from "@/app/lib/validation";

const earlyAccessSchema = z.object({
  firstName: subjectText("First name is required"),
  lastName: subjectText("Last name is required"),
  email: emailField(),
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
  return formData.get("ugle-honeypot") as string | null;
}

export async function requestEarlyAccess(
  initialState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const turnstileToken = formData.get("cf-turnstile-response") as
      string | null;
    const honeypotValue = getHoneypotValue(formData);

    // 1. Turnstile verification
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) {
      return {
        success: false,
        message: "Verification failed. Please try again.",
        error: "Verification failed. Please try again.",
      };
    }

    // 2. Honeypot check - bots often fill hidden fields
    const honeypotResult = validateHoneypot(honeypotValue);
    if (!honeypotResult.isValid) {
      return {
        success: false,
        message: honeypotResult.error,
        error: honeypotResult.error,
      };
    }

    // 3. Zod schema validation (includes honeypot optional field)
    const raw = Object.fromEntries(formData);
    const result = earlyAccessSchema.safeParse(raw);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid input";
      return { success: false, message: errorMsg, error: errorMsg };
    }

    // 4. Rate limiting per email - prevent flooding
    const rateLimitCheck = rateLimit(`earlyaccess-${result.data.email}`, {
      limit: 3,
      interval: 60 * 60 * 1000, // 1 hour
    });
    if (!rateLimitCheck.success) {
      return {
        success: false,
        message:
          "You've submitted too many requests. Please wait an hour before trying again.",
        error: "Rate limit exceeded",
      };
    }

    const { firstName, lastName, email, phone, os } = result.data;
    const submittedAt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());

    // 5. Subjects are built from these already-validated fields: Zod rejects
    // any control characters, so they can't carry header-injection payloads.
    // Run both operations concurrently and independently.
    // Promise.allSettled guarantees both are always attempted regardless of
    // whether the other one fails.
    const [emailResult, sheetsResult] = await Promise.allSettled([
      // Operation 1: Send confirmation + admin notification emails via Resend
      resendConfig.success
        ? getResendClient()!.batch.send([
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
          ])
        : Promise.reject(new Error("Resend is not configured")),

      // Operation 2: Append lead row to Google Sheets
      new EarlyAccessSheetService().append({
        firstName,
        lastName,
        email,
        phone,
        os,
        submittedAt,
      }),
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

    // Option A: succeed if at least one method captured the lead
    const emailOk =
      emailResult.status === "fulfilled" && !emailResult.value.error;
    const sheetsOk = sheetsResult.status === "fulfilled";

    if (!emailOk && !sheetsOk) {
      return {
        success: false,
        message: "Something went wrong. Please try again.",
        error: "Something went wrong. Please try again.",
      };
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
