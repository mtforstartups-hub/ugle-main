import * as z from "zod";

/**
 * Shared Zod field validators.
 *
 * These validate *and* reject unsafe input instead of silently rewriting it.
 * The important guarantee for email subjects is that a value can never
 * contain CR/LF (or any other control character), which is what header
 * injection attempts rely on.
 */

/** Control characters that are never valid in a single-line field. */
const SINGLE_LINE_CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/;

/** Control characters that are never valid in multi-line text (allows \t, \n, \r). */
const MULTILINE_CONTROL_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/;

/**
 * Single-line text that is safe to interpolate into an email subject.
 * Rejects line breaks, tabs, and other control characters.
 */
export function subjectText(requiredMessage: string, maxLength = 100) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .max(maxLength, `Must be ${maxLength} characters or fewer`)
    .refine(
      (value) => !SINGLE_LINE_CONTROL_CHARS.test(value),
      "Contains invalid characters",
    );
}

/**
 * Single-line text that is not used in email subjects, but is still bounded
 * and free of control characters (e.g. phone numbers, select values).
 */
export function singleLineText(requiredMessage: string, maxLength = 200) {
  return subjectText(requiredMessage, maxLength);
}

/**
 * Multi-line text (textarea). Newlines/tabs are allowed; other control
 * characters are rejected.
 */
export function paragraphText(requiredMessage: string, maxLength = 2000) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .max(maxLength, `Must be ${maxLength} characters or fewer`)
    .refine(
      (value) => !MULTILINE_CONTROL_CHARS.test(value),
      "Contains invalid characters",
    );
}

export function emailField(message = "Invalid email address") {
  return z.email(message).max(254, "Email address is too long");
}

/**
 * Optional http(s) URL. An empty string (the value an untouched optional
 * input submits) is accepted and treated as "not provided".
 */
export function optionalHttpUrl(message: string, maxLength = 500) {
  return z
    .string()
    .trim()
    .max(maxLength, `Must be ${maxLength} characters or fewer`)
    .refine((value) => value === "" || isHttpUrl(value), message)
    .optional();
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
