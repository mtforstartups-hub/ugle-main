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
import { pageMetadata, SITE_URL, serializeJsonLd } from "@/app/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: "Simple, transparent pricing for Ugle. Buy a lifetime or subscription license for 100% private, on-device audio search.",
  path: "/pricing",
});

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

  const pricingJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/pricing#product`,
    name: "Ugle",
    description:
      "Local-first media search application for macOS and Windows. On-device transcription and search, no cloud uploads.",
    url: `${SITE_URL}/pricing`,
    image: `${SITE_URL}/ugle-icon.png`,
    brand: { "@type": "Brand", name: "Ugle" },
    offers: [
      {
        "@type": "Offer",
        "@id": `${SITE_URL}/pricing#offer-monthly-${region}`,
        name: "Monthly licence",
        price: priceConfig.monthly.toFixed(2),
        priceCurrency: priceConfig.currency,
        url: `${SITE_URL}/pricing`,
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        "@id": `${SITE_URL}/pricing#offer-annual-${region}`,
        name: "Annual licence",
        price: priceConfig.annual.toFixed(2),
        priceCurrency: priceConfig.currency,
        url: `${SITE_URL}/pricing`,
        availability: "https://schema.org/InStock",
      },
    ],
  };

  return (
    <div className="bg-[#F8FAF9] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(pricingJsonLd) }}
        />
        {/* ── Header ── */}
        <PricingHeader />

        <PricingMain priceConfig={priceConfig} />

        {/* ── FAQ — always visible ── */}
        <PricingFaq />
      </div>
    </div>
  );
}
