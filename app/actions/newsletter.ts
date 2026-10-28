"use server";
import * as z from "zod";
import { getResendClient } from "@/app/lib/resend";
import { resendConfig } from "@/app/lib/env";
import {
  NewsletterAdminNotificationEmail,
  NewsletterWelcomeEmail,
} from "../components/email-templates/NewsletterTemplates";
import { NewsletterSheetService } from "@/app/lib/sheets";
import { verifyTurnstile } from "@/app/lib/turnstile";
import { rateLimit } from "@/app/lib/rate-limit";
import { validateHoneypot } from "@/app/lib/honeypot";
import { emailField } from "@/app/lib/validation";

const newsletterSchema = z.object({
  email: emailField("Invalid Input"),
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

export async function newsletterJoin(
  initialState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const honeypotValue = getHoneypotValue(formData);
    const turnstileToken = formData.get("cf-turnstile-response") as
      string | null;

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

    const email = formData.get("email");
    const result = newsletterSchema.safeParse({ email: email });

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid Input";
      return {
        success: false,
        message: errorMsg,
        error: errorMsg,
      };
    }

    // 3. Rate limiting per email - prevent flooding
    const subscriberEmail = result.data.email;
    const rateLimitCheck = rateLimit(`newsletter-${subscriberEmail}`, {
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

    const subscribedAt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());

    // 4. The email has already passed Zod validation (no control characters),
    // so it is safe to interpolate into the admin email subject.
    const [emailResult, sheetsResult] = await Promise.allSettled([
      resendConfig.success
        ? getResendClient()!.batch.send([
            {
              from: `Ugle <${resendConfig.data.RESEND_FROM_EMAIL}>`,
              to: [subscriberEmail],
              subject: "Welcome to Ugle — you're in 🎬",
              react: NewsletterWelcomeEmail({ email: subscriberEmail }),
            },
            {
              from: `Ugle <${resendConfig.data.RESEND_FROM_EMAIL}>`,
              to: resendConfig.data.ADMIN_EMAIL,
              subject: `New subscriber: ${subscriberEmail}`,
              react: NewsletterAdminNotificationEmail({
                subscriberEmail,
                subscribedAt,
              }),
            },
          ])
        : Promise.reject(new Error("Resend is not configured")),

      new NewsletterSheetService().append({
        email: subscriberEmail,
        subscribedAt,
      }),
    ]);

    if (emailResult.status === "rejected") {
      console.error("[Newsletter] Resend failed:", emailResult.reason);
    } else if (emailResult.value.error) {
      console.error(
        "[Newsletter] Resend batch error:",
        emailResult.value.error,
      );
    }

    if (sheetsResult.status === "rejected") {
      console.error("[Newsletter] Google Sheets failed:", sheetsResult.reason);
    }

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

    return {
      success: true,
      message: "Successfully Joined",
    };
  } catch (err) {
    // Last line of defense: anything unexpected (bad turnstile call,
    // unforeseen throw, etc.) still returns a clean ActionState
    // instead of surfacing as a 500.
    console.error("[Newsletter] Unexpected error:", err);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
      error: "Unexpected error",
    };
  }
}
