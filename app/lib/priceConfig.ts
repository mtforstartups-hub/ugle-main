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
    annual: 169,
    origMonthly: 25,
    origAnnual: 199,
    locale: "en-US",
    currency: "USD",
  },
  GB: {
    symbol: "£",
    monthly: 16,
    annual: 135,
    origMonthly: 20,
    origAnnual: 159,
    locale: "en-GB",
    currency: "GBP",
  },
  EU: {
    symbol: "€",
    monthly: 19,
    annual: 159,
    origMonthly: 23,
    origAnnual: 189,
    locale: "de-DE",
    currency: "EUR",
  },
  IN: {
    symbol: "₹",
    monthly: 1499,
    annual: 12999,
    origMonthly: 1899,
    origAnnual: 15999,
    locale: "en-IN",
    currency: "INR",
  },
};

export const ALL_REGIONS: Region[] = ["US", "GB", "EU", "IN"];
export const DEFAULT_REGION: Region = "US";
export const REGION_COOKIE = "ugle_region";

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
