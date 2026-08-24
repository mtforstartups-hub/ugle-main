import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  PRICE_CONFIG,
  DEFAULT_REGION,
  REGION_HEADER,
  type Region,
} from "../lib/priceConfig";
import PricingHeader from "../components/pricing/PricingHeader";
import PricingMain from "../components/pricing/PricingMain";
import PricingFaq from "../components/pricing/PricingFaq";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Ugle. Buy a lifetime or subscription license for 100% private, on-device audio search.",
  openGraph: {
    title: "Pricing",
    description:
      "Simple, transparent pricing for Ugle. Buy a lifetime or subscription license for 100% private, on-device audio search.",
    url: "/pricing",
  },
};

export default async function Pricing() {
  const hdrs = await headers();
  const raw = hdrs.get(REGION_HEADER) ?? null;
  const region = (raw && raw in PRICE_CONFIG ? raw : DEFAULT_REGION) as Region;
  const priceConfig = PRICE_CONFIG[region];

  // ── Debug log — remove once currency switching is confirmed working ──────────
  console.log("[ugle/pricing-page]", JSON.stringify({
    headerReceived: raw,              // null = proxy header not present
    regionResolved: region,
    priceMonthly: priceConfig.monthly,
    currency: priceConfig.currency,
  }));
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#F8FAF9] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-6">
        {/* ── Header ── */}
        <PricingHeader />

        <PricingMain priceConfig={priceConfig} />

        {/* ── FAQ — always visible ── */}
        <PricingFaq />
      </div>
    </div>
  );
}
