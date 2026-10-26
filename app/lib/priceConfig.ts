export type Region = "US" | "GB" | "EU" | "IN";

export interface PriceConfig {
  symbol: string;
  monthly: number;
  annual: number;
  origMonthly: number;
  origAnnual: number;
  locale: string;
  currency: string;
}

export const PRICE_CONFIG: Record<Region, PriceConfig> = {
  US: {
    symbol: "$",
    monthly: 20,
    annual: 225,
    origMonthly: 20,
    origAnnual: 300,
    locale: "en-US",
    currency: "USD",
  },
  GB: {
    symbol: "£",
    monthly: 15,
    annual: 168,
    origMonthly: 15,
    origAnnual: 224,
    locale: "en-GB",
    currency: "GBP",
  },
  EU: {
    symbol: "€",
    monthly: 17,
    annual: 200,
    origMonthly: 23,
    origAnnual: 268,
    locale: "de-DE",
    currency: "EUR",
  },
  IN: {
    symbol: "₹",
    monthly: 1900,
    annual: 16990,
    origMonthly: 1900,
    origAnnual: 22666,
    locale: "en-IN",
    currency: "INR",
  },
};

export const ALL_REGIONS: Region[] = ["US", "GB", "EU", "IN"];
export const DEFAULT_REGION: Region = "US";
export const REGION_COOKIE = "ugle_region";
export const REGION_HEADER = "x-ugle-region";
export const COUNTRY_HEADER = "x-ugle-country";

// Map Cloudflare CF-IPCountry codes → region
export const COUNTRY_TO_REGION: Record<string, Region> = {
  GB: "GB",
  IE: "GB",
  DE: "EU",
  FR: "EU",
  NL: "EU",
  ES: "EU",
  IT: "EU",
  PL: "EU",
  AT: "EU",
  BE: "EU",
  PT: "EU",
  SE: "EU",
  FI: "EU",
  DK: "EU",
  IN: "IN",
};
