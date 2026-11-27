"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, Mail } from "lucide-react";
import Link from "next/link";
import { ProductHuntRatingBadge } from "@/app/components/ProductHuntProof";
import type { PriceConfig, Region } from "../../lib/priceConfig";

function fmt(amount: number, cfg: PriceConfig): string {
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Shared check-list row ─────────────────────────────────────────────────────

function Feature({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <div
      className={`flex items-start gap-2.5 text-[13.5px] font-medium ${dark ? "text-white/70" : "text-ugle-slate"}`}
    >
      <Check
        className={`size-3.5 shrink-0 mt-0.5 ${dark ? "text-[#75C043]" : "text-[#5DA233]"}`}
        strokeWidth={2.5}
      />
      <span>{text}</span>
    </div>
  );
}

// ── Individual pricing panel (CRO-01 3-Card Grid) ─────────────────────────────
function IndividualsPanel({
  isAnnual,
  priceConfig,
  region,
  checkoutUrl,
}: {
  isAnnual: boolean;
  priceConfig: PriceConfig;
  region: Region;
  checkoutUrl: string | null;
}) {
  const price = fmt(
    isAnnual ? priceConfig.annual : priceConfig.monthly,
    priceConfig,
  );
  const origPrice = fmt(
    isAnnual ? priceConfig.origAnnual : priceConfig.origMonthly,
    priceConfig,
  );
  const savings = fmt(
    Math.max(0, priceConfig.origAnnual - priceConfig.annual),
    priceConfig,
  );

  return (
    <div className="mb-14 md:mb-16">
      <div className="flex justify-center mb-6">
        <ProductHuntRatingBadge className="scale-90" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Card 1: Ungated 15-Day Free Trial */}
        <div className="bg-white border border-ugle-light/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#F8FAF9] border-b border-ugle-light/60 px-6 py-5 lg:min-h-[138px] flex flex-col justify-center">
            <div className="font-mono text-xs tracking-[0.14em] uppercase text-[#5DA233] font-semibold mb-1.5">
              15-Day Free Trial
            </div>
            <h2 className="text-[22px] font-extrabold text-ugle-slate tracking-tight">
              Ungated Trial
            </h2>
            <p className="text-[13.5px] text-ugle-gray mt-1">
              Full v1.0.1 access. Zero friction.
            </p>
          </div>

          <div className="px-6 py-6 flex-1 flex flex-col">
            <div className="space-y-2.5 flex-1">
              <Feature text="No credit card required" />
              <Feature text="No account or sign-up required" />
              <Feature text="No file count or hour limits" />
              <Feature text="30ms local search (99.4% recall)" />
              <Feature text="All NLE exports (EDL, XML, FCPXML, CSV, MP3/MP4/ZIP)" />
              <Feature text="SRT, VTT, TXT & Markdown transcripts" />
              <Feature text="Read-only searchable index kept after Day 15" />
            </div>

            <div className="border-t border-ugle-light/60 pt-5 mt-6 space-y-4">
              <div className="lg:min-h-[76px] flex flex-col justify-end">
                <div className="text-[12px] text-ugle-gray mb-1">
                  15-day evaluation
                </div>
                <div className="text-[30px] font-extrabold text-ugle-slate tracking-tight leading-none">
                  {fmt(0, priceConfig)}
                </div>
                <div className="text-[11.5px] text-ugle-gray/70 mt-1.5">
                  macOS 13.4+ &amp; Windows 10 64-bit+ (~192 MB)
                </div>
              </div>
              <Link
                href="/download"
                className="w-full inline-flex items-center justify-center px-5 py-3 bg-white border-2 border-ugle-slate text-ugle-slate font-bold text-sm rounded-[10px] hover:bg-ugle-slate hover:text-white transition-colors text-center"
              >
                Download Free Trial (~192 MB)
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Annual Personal Licence (Most Popular) */}
        <div className="bg-white border-2 border-[#75C043] rounded-2xl shadow-md overflow-hidden flex flex-col">
          <div className="bg-ugle-slate px-6 py-5 lg:min-h-[138px] flex flex-col justify-center">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono text-xs tracking-[0.14em] uppercase text-[#75C043] font-semibold">
                Most Popular
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider bg-[#75C043]/20 text-[#75C043] px-2.5 py-0.5 rounded-full">
                Flat Annual
              </span>
            </div>
            <h2 className="text-[22px] font-extrabold text-white tracking-tight">
              Annual Personal Licence
            </h2>
            <p className="text-[13.5px] text-white/75 mt-1">
              Save {savings} off the{" "}
              <span className="line-through">{origPrice}/yr</span> standard list
              price.
            </p>
          </div>

          <div className="px-6 py-6 flex-1 flex flex-col">
            <div className="space-y-2.5 flex-1">
              <Feature text="0% metering — unlimited hours & files" />
              <Feature text="Covers 2 personal machines per user" />
              <Feature text="15% loyalty renewal discount" />
              <Feature text="Whisper Large v3 Turbo + Metal GPU BGE-M3" />
              <Link
                href="/blog/languages-supported"
                className="flex items-start gap-2.5 text-[13.5px] font-medium text-ugle-green"
              >
                <Check
                  className="size-3.5 shrink-0 mt-0.5 text-[#5DA233]"
                  strokeWidth={2.5}
                />
                <span>99+ languages + 701 MB Indic Flex pack</span>
              </Link>
              <Feature text="AES-256 local index · Zero telemetry" />
              <Feature text="Jamf PKG & Windows MSI installers" />
              <Feature text="VAT/GST invoicing via Dodo Payments (MoR)" />
            </div>

            <div className="border-t border-ugle-light/60 pt-5 mt-6 space-y-4">
              <div className="lg:min-h-[76px] flex flex-col justify-end">
                <div className="text-[12px] text-ugle-gray mb-1">
                  per user, per year
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="line-through text-ugle-gray/40 text-sm">
                    {origPrice}
                  </span>
                  <div className="text-[30px] font-extrabold text-ugle-slate tracking-tight leading-none">
                    {price}
                  </div>
                  <span className="text-xs font-medium text-ugle-gray/80">
                    {region === "IN" ? "+ GST" : "+ local tax"}
                  </span>
                </div>
                <div className="text-[11.5px] text-ugle-gray/70 mt-1.5">
                  {region !== "IN" && checkoutUrl
                    ? "Tax shown at checkout · Billed via Dodo Payments"
                    : "Final price including tax shown at checkout"}
                </div>
              </div>

              {checkoutUrl ? (
                <a
                  href={checkoutUrl}
                  rel="noopener"
                  className="w-full inline-flex items-center justify-center px-5 py-3 bg-ugle-green hover:bg-[#86d950] text-white font-bold text-sm rounded-[10px] shadow-sm transition-colors text-center"
                >
                  Get Annual Licence — {price}/yr
                </a>
              ) : (
                <Link
                  href="/request-trial"
                  className="w-full inline-flex items-center justify-center px-5 py-3 bg-ugle-green hover:bg-[#86d950] text-white font-bold text-sm rounded-[10px] shadow-sm transition-colors text-center"
                >
                  Get Annual Licence — {price}/yr
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Education & Non-Commercial Licence */}
        <div className="bg-white border border-ugle-light/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#F8FAF9] border-b border-ugle-light/60 px-6 py-5 lg:min-h-[138px] flex flex-col justify-center">
            <div className="font-mono text-xs tracking-[0.14em] uppercase text-[#5DA233] font-semibold mb-1.5">
              Academic &amp; Non-Commercial
            </div>
            <h2 className="text-[22px] font-extrabold text-ugle-slate tracking-tight">
              Education &amp; Non-Commercial
            </h2>
            <p className="text-[13.5px] text-ugle-gray mt-1">
              For students, educators, researchers &amp; non-commercial creators.
            </p>
          </div>

          <div className="px-6 py-6 flex-1 flex flex-col">
            <div className="space-y-2.5 flex-1">
              <Feature text="100% free — full local-first indexing & search" />
              <Feature text="99+ languages + 701 MB Indic Flex pack" />
              <Feature text="Zero cloud uploads & AES-256 encryption" />
              <Feature text="All transcript exports (SRT, VTT, TXT, MD)" />
              <Feature text="Full NLE clip workflows (EDL, XML, FCPXML, CSV)" />
              <Feature text="Jamf PKG & Windows MSI lab deployment" />
              <Feature text="Accredited edu verification or non-commercial use" />
            </div>

            <div className="border-t border-ugle-light/60 pt-5 mt-6 space-y-4">
              <div className="lg:min-h-[76px] flex flex-col justify-end">
                <div className="text-[12px] text-ugle-gray mb-1">
                  approved academic &amp; non-commercial
                </div>
                <div className="text-[30px] font-extrabold text-ugle-slate tracking-tight leading-none">
                  100% Free
                </div>
                <div className="text-[11.5px] text-ugle-gray/70 mt-1.5">
                  processed within 2 business days
                </div>
              </div>
              <Link
                href="/education"
                className="w-full inline-flex items-center justify-center px-5 py-3 bg-ugle-slate text-white font-bold text-sm rounded-[10px] hover:bg-[#222] transition-colors text-center"
              >
                Apply for Free Licence
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty note */}
      <div className="mt-6 flex items-center justify-center gap-3 bg-[#F0F9EA] border border-[#75C043]/30 rounded-xl px-5 py-3 max-w-2xl mx-auto">
        <span className="text-[#5DA233] text-base">&#10022;</span>
        <p className="text-sm font-semibold text-ugle-slate">
          15% Loyalty discount on every renewal — annual stays flat with 0%
          metering.
        </p>
      </div>
    </div>
  );
}

const COMPARISON_ROWS = [
  {
    dimension: "Pricing Model",
    ugle: "$225/user/year flat annual ($300 standard list); 15% loyalty renewal discount; 0% metering",
    cloud:
      "Per-minute or per-hour transcription fees + recurring monthly platform subscriptions",
  },
  {
    dimension: "Heavy Archive Cost (100–500 hrs/yr)",
    ugle: "$225/year total ($0 incremental cost per indexed hour)",
    cloud:
      "Escalating per-minute bills ($150–$750+ per project) + cloud storage overages",
  },
  {
    dimension: "Trial Experience",
    ugle: "Ungated 15-day trial: no credit card, no account, no file/hour limit; read-only index kept after Day 15",
    cloud:
      "Gated 30-to-60-minute trial caps requiring credit card authorization",
  },
  {
    dimension: "Privacy & NDA Compliance",
    ugle: "100% local AES-256 hardware-derived index; zero cloud uploads, zero telemetry",
    cloud:
      "Media uploaded to cloud servers; third-party AI sub-processor data retention risks",
  },
  {
    dimension: "Indexing Speed",
    ugle: "~22 hrs/hr on M4 Pro Mac; 100h in 6–8h on Base Mac mini; first file searchable in ~30s",
    cloud:
      "Bottlenecked by internet upload bandwidth; multi-hour cloud processing queues",
  },
  {
    dimension: "Search Engine & Recall",
    ugle: "30ms hybrid search (Whisper Large v3 Turbo + Metal GPU BGE-M3 at 60.2 texts/s); 99.4% recall; 89% Top-1",
    cloud: "Basic cloud keyword search with web interface network latency",
  },
  {
    dimension: "Indic & Multilingual Accuracy",
    ugle: "90–95% across 99+ languages; optional 701 MB Indic pack (Bodhan AI / AI4Bharat) for 9 Indian languages",
    cloud:
      "Inconsistent transliteration, missing scripts, and paid add-on language tiers",
  },
  {
    dimension: "NLE & Producer Exports",
    ugle: "Multi-File Clip Lists -> EDL, Premiere XML (#/? relinked), FCPXML, Producer CSV, 200ms pad MP3/MP4/ZIP",
    cloud:
      "Text or basic SRT export only; manual timeline relinking required",
  },
  {
    dimension: "Machine & IT Deployment",
    ugle: "2 personal machines per licence; native Jamf PKG / Windows MSI; billed via Dodo Payments MoR",
    cloud: "Web browser account seats locked to individual user logins",
  },
];

function PricingComparisonTable() {
  return (
    <section className="mb-14 md:mb-16">
      <div className="text-center mb-8">
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-[#5DA233] font-semibold mb-2">
          Side-by-Side Comparison
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-ugle-slate tracking-tight">
          UGLE.AI v1.0.1 vs. Cloud Metering Tools
        </h2>
      </div>
      <div className="bg-white border border-ugle-light/60 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[680px]">
          <thead>
            <tr className="bg-ugle-slate text-white">
              <th className="py-4 px-5 text-xs font-mono uppercase tracking-wider w-1/4">
                Feature / Dimension
              </th>
              <th className="py-4 px-5 text-xs font-mono uppercase tracking-wider text-[#75C043] w-[37.5%]">
                UGLE.AI v1.0.1 (Local-First Flat Annual)
              </th>
              <th className="py-4 px-5 text-xs font-mono uppercase tracking-wider text-white/75 w-[37.5%]">
                Typical Cloud Metering Tools (Per-Hour / Per-Minute)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ugle-light/50 text-sm">
            {COMPARISON_ROWS.map((row) => (
              <tr
                key={row.dimension}
                className="hover:bg-[#F8FAF9]/70 transition-colors"
              >
                <td className="py-4 px-5 font-semibold text-ugle-slate align-top">
                  {row.dimension}
                </td>
                <td className="py-4 px-5 text-ugle-slate font-medium align-top bg-[#F0F9EA]/40">
                  {row.ugle}
                </td>
                <td className="py-4 px-5 text-ugle-gray align-top">
                  {row.cloud}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Organisation panel ────────────────────────────────────────────────────────
function OrganisationPanel() {
  return (
    <div className="max-w-2xl mx-auto mb-32">
      <div className="bg-white border border-ugle-light/60 rounded-2xl shadow-sm overflow-hidden">
        {/* Header band */}
        <div className="bg-ugle-slate px-8 py-7">
          <div className="font-mono text-xs tracking-[0.14em] uppercase text-[#75C043] mb-2">
            Commercial subscription
          </div>
          <h2 className="text-[26px] font-extrabold text-white tracking-tight leading-tight">
            Companies &amp; organisations using Ugle commercially
          </h2>
        </div>

        {/* Body */}
        <div className="px-8 py-7 space-y-5">
          <p className="text-[15px] text-ugle-gray leading-relaxed">
            For teams of more than 3 seats. Concurrent users cannot exceed the
            number of purchased subscriptions. Billed yearly or monthly.
          </p>

          <div className="space-y-3">
            {[
              "More than 3 seats — scale to your team size",
              "Concurrent users \u2264 purchased subscriptions",
              "Yearly or monthly billing options",
              "Priority support & SLA available",
              "Admin console & centralised licence management",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-[14px] font-medium text-ugle-slate"
              >
                <Check
                  className="size-3.5 shrink-0 mt-0.5 text-[#5DA233]"
                  strokeWidth={2.5}
                />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-ugle-light/60 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-[13px] text-ugle-gray mb-0.5">Pricing</div>
              <div className="text-[32px] font-extrabold text-ugle-slate tracking-tight leading-none">
                On Request
              </div>
              <div className="text-[12px] text-ugle-gray/55 mt-0.5">
                tailored to your team size
              </div>
            </div>
            <Link
              href="/request-demo"
              className="inline-flex items-center gap-2 justify-center px-7 py-3 bg-ugle-slate text-white font-bold text-[14px] rounded-[10px] hover:bg-[#222] transition-colors"
            >
              <Mail className="size-4" />
              Contact for pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Enterprise nudge */}
      <div className="mt-4 text-center text-[13px] text-ugle-gray/70">
        Need an air-gapped or on-premise deployment?{" "}
        <a
          href="mailto:enterprise@ugle.ai"
          className="text-[#5DA233] font-semibold hover:underline"
        >
          enterprise@ugle.ai
        </a>
      </div>
    </div>
  );
}

// ── Non-commercial panel ──────────────────────────────────────────────────────
// function NonCommercialPanel() {
//   return (
//     <div className="max-w-2xl mx-auto mb-32">
//       <div className="bg-white border border-ugle-light/60 rounded-2xl shadow-sm overflow-hidden">
//         <div className="bg-ugle-slate px-8 py-7">
//           <div className="font-mono text-xs tracking-[0.14em] uppercase text-[#75C043] mb-2">
//             Non-commercial licence
//           </div>
//           <h2 className="text-[26px] font-extrabold text-white tracking-tight leading-tight">
//             Using Ugle for personal, non-earning work?
//           </h2>
//         </div>

//         <div className="px-8 py-7 space-y-5">
//           <p className="text-[15px] text-ugle-gray leading-relaxed">
//             Individuals using eligible Ugle products without earning commercial
//             benefits can use Ugle for free. No approval required.
//           </p>

//           <div className="space-y-3">
//             {[
//               "Personal documentary or archival projects",
//               "Academic research (non-institutional)",
//               "Community journalism \u2014 no paid distribution",
//               "Creative hobbyists with no commercial output",
//             ].map((item, i) => (
//               <div
//                 key={i}
//                 className="flex items-start gap-3 text-[14px] font-medium text-ugle-slate"
//               >
//                 <Check
//                   className="size-3.5 shrink-0 mt-0.5 text-[#5DA233]"
//                   strokeWidth={2.5}
//                 />
//                 <span>{item}</span>
//               </div>
//             ))}
//           </div>

//           <div className="border-t border-ugle-light/60 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <div className="text-[13px] text-ugle-gray mb-0.5">Price</div>
//               <div className="text-[32px] font-extrabold text-ugle-slate tracking-tight leading-none">
//                 Free
//               </div>
//               <div className="text-[12px] text-ugle-gray/55 mt-0.5">
//                 no approval required
//               </div>
//             </div>
//             <Link
//               href="/non-commercial"
//               className="inline-flex items-center justify-center px-7 py-3 bg-ugle-slate text-white font-bold text-[14px] rounded-[10px] hover:bg-[#222] transition-colors"
//             >
//               Get free access
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// ── Education panel ───────────────────────────────────────────────────────────
function EducationPanel() {
  return (
    <div className="max-w-2xl mx-auto mb-32">
      <div className="bg-white border border-ugle-light/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-ugle-slate px-8 py-7">
          <div className="font-mono text-xs tracking-[0.14em] uppercase text-[#75C043] mb-2">
            Education licence
          </div>
          <h2 className="text-[26px] font-extrabold text-white tracking-tight leading-tight">
            Students &amp; instructors at accredited institutions
          </h2>
        </div>

        <div className="px-8 py-7 space-y-5">
          <p className="text-[15px] text-ugle-gray leading-relaxed">
            Education licences are free for currently enrolled students and
            teaching staff at accredited academic institutions. Verification and
            approval required.
          </p>

          <div className="space-y-3">
            {[
              "Currently enrolled students",
              "Full-time & part-time instructors / faculty",
              "Journalism schools & media programmes",
              "Accredited universities & colleges",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-[14px] font-medium text-ugle-slate"
              >
                <Check
                  className="size-3.5 shrink-0 mt-0.5 text-[#5DA233]"
                  strokeWidth={2.5}
                />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#F8FAF9] border border-ugle-light/70 rounded-xl px-5 py-4 text-[13px] text-ugle-gray leading-relaxed">
            <span className="font-semibold text-ugle-slate">
              Verification required.
            </span>{" "}
            You&apos;ll need to submit proof of enrollment or employment at an
            accredited institution. Approvals are typically processed within 2
            business days.
          </div>

          <div className="border-t border-ugle-light/60 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-[13px] text-ugle-gray mb-0.5">Price</div>
              <div className="text-[32px] font-extrabold text-ugle-slate tracking-tight leading-none">
                Free
              </div>
              <div className="text-[12px] text-ugle-gray/55 mt-0.5">
                pending verification &amp; approval
              </div>
            </div>
            <Link
              href="/education"
              className="inline-flex items-center justify-center px-7 py-3 bg-ugle-slate text-white font-bold text-[14px] rounded-[10px] hover:bg-[#222] transition-colors"
            >
              Apply for free access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PricingMain({
  priceConfig,
  region,
  checkoutUrl,
}: {
  priceConfig: PriceConfig;
  region: Region;
  checkoutUrl: string | null;
}) {
  const [category, setCategory] = useState<
    "individuals" | "organisation" | "non-commercial" | "education"
  >("individuals");
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const isAnnual = billing === "annual";

  const categories = [
    { id: "organisation", label: "Organisation" },
    { id: "individuals", label: "Individuals" },
    // { id: "non-commercial", label: "Non-commercial" },
    { id: "education", label: "Education" },
  ] as const;

  return (
    <>
      {/* ── Category tabs ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8 flex flex-col items-center"
      >
        {/* Desktop */}
        <div className="hidden sm:inline-flex border border-ugle-light rounded-lg p-1 gap-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`category-tab-${cat.id}`}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-1.5 rounded-lg text-base font-semibold whitespace-nowrap transition-colors duration-200 ${
                category === cat.id
                  ? "border border-ugle-green text-ugle-slate"
                  : "border border-transparent text-ugle-gray hover:text-ugle-slate"
              }`}
            >
              {cat.label}
              {/* {(cat.id === "non-commercial" || cat.id === "education") && (
                <span className="ml-1.5 text-[11px] font-bold text-[#5DA233]">
                  Free
                </span>
              )} */}
            </button>
          ))}
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={`m-${cat.id}`}
              id={`category-tab-mobile-${cat.id}`}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-[13.5px] font-semibold whitespace-nowrap transition-colors duration-200 border ${
                category === cat.id
                  ? "border-ugle-green text-ugle-slate"
                  : "border-ugle-light text-ugle-gray hover:text-ugle-slate"
              }`}
            >
              {cat.label}
              {/* {(cat.id === "non-commercial" || cat.id === "education") && (
                <span className="ml-1.5 text-[11px] font-bold text-[#5DA233]">
                  Free
                </span>
              )} */}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Billing toggle — only for individuals ── */}
      {category === "individuals" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex border border-ugle-light rounded-lg p-1 gap-0.5">
            <button
              id="billing-annual"
              onClick={() => setBilling("annual")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-base font-semibold whitespace-nowrap transition-colors duration-200 ${
                isAnnual
                  ? "border border-ugle-green text-ugle-slate"
                  : "border border-transparent text-ugle-gray hover:text-ugle-slate"
              }`}
            >
              Annual billing
              {/* <span className="text-[11px] font-bold text-[#5DA233]">
                save ~15%
              </span> */}
            </button>
            {/* <button
              id="billing-monthly"
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-lg text-[13.5px] font-semibold whitespace-nowrap transition-colors duration-200 ${
                !isAnnual
                  ? "border border-ugle-green text-ugle-slate"
                  : "border border-transparent text-ugle-gray hover:text-ugle-slate"
              }`}
            >
              Monthly billing
            </button> */}
          </div>
        </motion.div>
      )}

      {/* ── Content area — switches by category ── */}
      <motion.div
        key={category}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {category === "education" ? (
          <EducationPanel />
        ) : category === "organisation" ? (
          <OrganisationPanel />
        ) : (
          <IndividualsPanel
            isAnnual={isAnnual}
            priceConfig={priceConfig}
            region={region}
            checkoutUrl={checkoutUrl}
          />
        )}
      </motion.div>

      <PricingComparisonTable />
    </>
  );
}
