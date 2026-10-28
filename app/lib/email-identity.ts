/**
 * Email identity normalization used for abuse detection.
 *
 * The goal is to compare addresses the way a provider treats them, so a single
 * person cannot appear to be several users by adding aliases:
 *   John.Doe+trial1@gmail.com  ->  johndoe@gmail.com
 *   john+2@outlook.com         ->  john@outlook.com
 *
 * This is used ONLY for duplicate/rate-limit comparisons. The address the user
 * typed is what gets stored and what email is actually sent to.
 */

/**
 * Providers that treat the local part case-insensitively and support
 * "+tag" sub-addressing. Stripping the tag is safe for these.
 */
const PLUS_ALIAS_PROVIDERS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "outlook.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "live.com",
  "live.co.uk",
  "msn.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.co.in",
  "ymail.com",
  "rocketmail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "fastmail.com",
  "fastmail.fm",
  "hey.com",
  "zoho.com",
  "aol.com",
  "gmx.com",
  "gmx.net",
  "yandex.com",
  "yandex.ru",
]);

/** Domains that are the same mailbox as another domain. */
const DOMAIN_ALIASES: Record<string, string> = {
  "googlemail.com": "gmail.com",
  "pm.me": "proton.me",
};

/**
 * Normalize an email address for comparison purposes.
 *
 * - Trims and lowercases the whole address.
 * - Maps known provider aliases (googlemail.com -> gmail.com).
 * - Removes "+tag" sub-addressing on providers that support it.
 * - Removes dots from Gmail local parts (Gmail ignores them).
 *
 * Returns an empty string for input that isn't shaped like an email.
 */
export function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return "";

  let local = trimmed.slice(0, at);
  let domain = trimmed.slice(at + 1).replace(/\.$/, "");

  if (!local || !domain) return "";

  domain = DOMAIN_ALIASES[domain] ?? domain;

  if (PLUS_ALIAS_PROVIDERS.has(domain)) {
    const plus = local.indexOf("+");
    if (plus > 0) local = local.slice(0, plus);
  }

  // Gmail ignores dots in the local part: j.doe@gmail.com === jdoe@gmail.com
  if (domain === "gmail.com") {
    local = local.replace(/\./g, "");
  }

  return `${local}@${domain}`;
}
