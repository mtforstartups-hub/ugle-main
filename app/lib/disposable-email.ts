import "server-only";
import disposableDomains from "disposable-domains";

/**
 * Disposable / temporary email domain blocking.
 *
 * The trial form is the highest-value target for abuse: a single person can
 * register for an unlimited number of trials by cycling through throwaway
 * inboxes. The bulk of the blocklist comes from the community-maintained
 * `disposable-domains` package (130k+ domains), bundled locally so the check
 * adds no network latency and fails closed (a blocked domain stays blocked
 * even if a third-party service is down).
 *
 * Only the `request-trial` submission uses this. Other forms (newsletter,
 * contact, demo) still accept any valid address.
 *
 * Updating the list: bump the `disposable-domains` dependency (Dependabot /
 * Renovate or a scheduled CI job recommended).
 */

/**
 * Domains we want to block that the upstream list doesn't contain yet.
 * Keep this short; if something is genuinely disposable, also consider
 * contributing it upstream.
 */
const EXTRA_BLOCKED_DOMAINS: readonly string[] = [
  // "example-throwaway.com",
];

/**
 * Domains that must never be blocked, even if the upstream list (or a parent
 * domain on it) matches. Use this to resolve false-positive reports from
 * real customers.
 */
const ALLOWED_DOMAINS: readonly string[] = [
  // "legit-customer.com",
];

/**
 * Built once at module load: O(n) one-time cost per server instance,
 * O(1) per lookup afterwards.
 */
const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set([
  ...disposableDomains,
  ...EXTRA_BLOCKED_DOMAINS,
]);

const ALLOWED_DOMAIN_SET: ReadonlySet<string> = new Set(ALLOWED_DOMAINS);

/**
 * Domains that are widely used but are not classic throwaway inboxes. They are
 * intentionally NOT blocked, because real customers use them:
 *   gmail.com, outlook.com, hotmail.com, yahoo.com, icloud.com, proton.me, ...
 */

/** Extract a normalized domain from an email address. */
function getDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at === -1) return null;

  const domain = email
    .slice(at + 1)
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");

  return domain.length > 0 ? domain : null;
}

/**
 * True when `domain` or any of its parent domains is in `set`.
 * "abc.mailinator.com" -> checks "abc.mailinator.com", then "mailinator.com".
 * Runs in O(d), where d is the number of labels in the domain.
 */
function matchesDomainOrParent(
  set: ReadonlySet<string>,
  domain: string,
): boolean {
  if (set.has(domain)) return true;

  for (let i = domain.indexOf("."); i !== -1; i = domain.indexOf(".", i + 1)) {
    if (set.has(domain.slice(i + 1))) return true;
  }

  return false;
}

/**
 * True when the address belongs to a known disposable email provider.
 * Subdomains of listed providers count as disposable too, unless the domain
 * (or a parent) is explicitly allowlisted.
 */
export function isDisposableEmail(email: string): boolean {
  const domain = getDomain(email);
  if (!domain) return false;

  if (matchesDomainOrParent(ALLOWED_DOMAIN_SET, domain)) return false;

  return matchesDomainOrParent(DISPOSABLE_DOMAINS, domain);
}

/** Message shown to users who submit a disposable address. */
export const DISPOSABLE_EMAIL_MESSAGE =
  "Please use your work or personal email address. Disposable email addresses aren't accepted for trials.";
