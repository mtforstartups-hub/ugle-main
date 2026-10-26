import type { Region } from "./priceConfig";

/**
 * Hosted checkout wiring.
 *
 * IMPORTANT: both provider URLs are supplied by the payments team and must not
 * be edited. Dodo refuses payments made through altered links (and refunds
 * them), so the only permitted additions are the per-visitor `country` and
 * `disableCountry` parameters appended in `checkoutUrlFor()`.
 */

/** India — Cashfree. Returns 404 until launch day. */
export const CASHFREE_CHECKOUT_URL =
  "https://api.ugle.ai/checkout?plan=yearly";

/** International — Dodo Payments. */
export const DODO_CHECKOUT_URL =
  "https://checkout.dodopayments.com/buy/pdt_0NqLtxGzr2RCw1gV9jOVf?quantity=1&paymentCurrency=USD&showCurrencySelector=false&showDiscounts=false&redirect_url=https://ugle.ai/payment/success";

const ISO_COUNTRY_CODE = /^[A-Z]{2}$/;

/**
 * Master switch. Off by default so the India checkout, which 404s until
 * launch, is never linked from the pricing page in production.
 */
export function paymentsAreLive(): boolean {
  return process.env.PAYMENTS_LIVE?.trim().toLowerCase() === "true";
}

/**
 * Resolve the hosted checkout URL for a visitor.
 *
 * - India goes to Cashfree.
 * - Everyone else goes to Dodo, with their country appended when known.
 *
 * The base URLs stay byte-for-byte identical to the supplied links.
 */
export function checkoutUrlFor(
  region: Region,
  country?: string | null,
): string {
  if (region === "IN") {
    return CASHFREE_CHECKOUT_URL;
  }

  // Never forward India to Dodo; `country` must be a clean ISO 3166-1 alpha-2
  // code so nothing user-controlled can alter the checkout link.
  const countryCode = country?.trim().toUpperCase() ?? "";
  if (!ISO_COUNTRY_CODE.test(countryCode) || countryCode === "IN") {
    return DODO_CHECKOUT_URL;
  }

  return `${DODO_CHECKOUT_URL}&country=${countryCode}&disableCountry=true`;
}
