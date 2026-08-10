import { cookies } from "next/headers";
import {
  PRICE_CONFIG,
  REGION_COOKIE,
  DEFAULT_REGION,
  type Region,
} from "../lib/priceConfig";
import PricingHeader from "../components/pricing/PricingHeader";
import PricingMain from "../components/pricing/PricingMain";
import PricingFaq from "../components/pricing/PricingFaq";

export default async function Pricing() {
  const jar = await cookies();
  const raw = jar.get(REGION_COOKIE)?.value ?? DEFAULT_REGION;
  const region = (raw in PRICE_CONFIG ? raw : DEFAULT_REGION) as Region;
  const priceConfig = PRICE_CONFIG[region];

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
