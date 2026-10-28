/**
 * Honeypot validation for forms.
 * Adds a hidden field that bots typically fill in, while humans ignore it.
 *
 * Usage in forms: render <HoneypotField /> (app/components/HoneypotField.tsx)
 * Then in the server action: reject the request when isValid is false.
 */

export const HONEYPOT_FIELD_NAME = "ugle-honeypot";

export type HoneypotResult =
  | { isValid: true; error: null }
  | { isValid: false; error: string };

export function validateHoneypot(
  maybeHoneypot: string | null | undefined,
): HoneypotResult {
  // Browsers always submit the hidden input (as an empty string), and humans
  // never fill it in. Only a non-empty value indicates automated traffic.
  if (maybeHoneypot === null || maybeHoneypot === undefined) {
    return { isValid: true, error: null };
  }

  if (String(maybeHoneypot).trim() === "") {
    return { isValid: true, error: null };
  }

  return {
    isValid: false,
    error: "Verification failed.",
  };
}
