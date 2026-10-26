import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CASHFREE_CHECKOUT_URL,
  DODO_CHECKOUT_URL,
  checkoutUrlFor,
  paymentsAreLive,
} from "../payments";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("checkoutUrlFor", () => {
  it("uses the exact Cashfree link for India", () => {
    expect(checkoutUrlFor("IN", "IN")).toBe(
      "https://api.ugle.ai/checkout?plan=yearly",
    );
    expect(CASHFREE_CHECKOUT_URL).toBe(
      "https://api.ugle.ai/checkout?plan=yearly",
    );
  });

  it("uses the exact Dodo link when the visitor country is unknown", () => {
    expect(checkoutUrlFor("US", null)).toBe(DODO_CHECKOUT_URL);
    expect(checkoutUrlFor("GB", "")).toBe(DODO_CHECKOUT_URL);
  });

  it("appends the visitor country to the Dodo link", () => {
    expect(checkoutUrlFor("GB", "GB")).toBe(
      `${DODO_CHECKOUT_URL}&country=GB&disableCountry=true`,
    );
    expect(checkoutUrlFor("EU", "de")).toBe(
      `${DODO_CHECKOUT_URL}&country=DE&disableCountry=true`,
    );
  });

  it("never sends India or malformed countries to Dodo", () => {
    expect(checkoutUrlFor("US", "IN")).toBe(DODO_CHECKOUT_URL);
    expect(checkoutUrlFor("US", "GB&country=IN")).toBe(DODO_CHECKOUT_URL);
    expect(checkoutUrlFor("US", "global")).toBe(DODO_CHECKOUT_URL);
  });

  it("keeps the supplied Dodo parameters untouched", () => {
    expect(DODO_CHECKOUT_URL).toBe(
      "https://checkout.dodopayments.com/buy/pdt_0NqLtxGzr2RCw1gV9jOVf?quantity=1&paymentCurrency=USD&showCurrencySelector=false&showDiscounts=false&redirect_url=https://ugle.ai/payment/success",
    );
  });
});

describe("paymentsAreLive", () => {
  it("is off by default", () => {
    vi.stubEnv("PAYMENTS_LIVE", "false");
    expect(paymentsAreLive()).toBe(false);
  });

  it("is only on when explicitly enabled", () => {
    vi.stubEnv("PAYMENTS_LIVE", "true");
    expect(paymentsAreLive()).toBe(true);

    vi.stubEnv("PAYMENTS_LIVE", "TRUE");
    expect(paymentsAreLive()).toBe(true);

    vi.stubEnv("PAYMENTS_LIVE", "yes");
    expect(paymentsAreLive()).toBe(false);
  });
});
