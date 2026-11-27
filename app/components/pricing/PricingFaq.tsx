"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { absoluteUrl, serializeJsonLd } from "@/app/lib/seo";

const PRICING_FAQS = [
  {
    q: "How much does UGLE.AI cost, and is there a monthly plan or per-minute metering?",
    a: "UGLE.AI costs $225/user/year for an Annual Personal Licence (discounted from the standard $300/yr list price). This licence includes 0% metering — meaning you can index and search unlimited hours of audio and video across terabytes of media drives for a flat annual rate. Every licence covers 2 personal machines per user and includes a 15% loyalty renewal discount for subsequent years. Checkout, tax compliance, and invoicing are processed securely through Dodo Payments as Merchant of Record. Legacy pricing tiers ($199→$169/yr and $25→$20/mo) are retired in v1.0.1.",
  },
  {
    q: "What happens when the 15-day free trial expires?",
    a: "Our trial is completely ungated: it requires no credit card, no user account, and imposes zero file or hour limits during the 15-day evaluation period. After Day 15, UGLE.AI transitions to a read-only state where your existing database and searchable index remain permanently accessible on your workstation — you will never lose access to media you have already indexed. Upgrading to an active annual licence reactivates indexing for new media files and unlocks full timeline export workflows.",
  },
  {
    q: "Are Education and Non-Commercial licences really 100% free?",
    a: "Yes. Students, academic researchers, educators, and non-commercial video creators can apply for a 100% free licence. This provides access to the full v1.0.1 local engine, including offline transcription across 99+ languages, AES-256 local index encryption, and NLE timeline exports.",
  },
  {
    q: "Does UGLE.AI upload my footage or audio to the cloud? How is my index secured?",
    a: "UGLE.AI is 100% local-first. Your raw media files, audio tracks, transcripts, and search indexes never leave your local workstation. The application runs Whisper Large v3 Turbo and BGE-M3 locally on your GPU/CPU, operating with zero cloud uploads and zero telemetry tracking. Indexes are stored using hardware-derived AES-256 encryption.",
  },
  {
    q: "What hardware and operating systems are required, and how fast is indexing?",
    a: "UGLE.AI runs natively on macOS 13.4+ (Apple Silicon & Intel) and Windows 10 64-bit+ via a lightweight ~192 MB native installer. An M4 Pro Mac indexes media at ~22 hours of footage per hour, a Base Mac mini indexes 100 hours in 6–8 hours, and the 1h20m Live Demo finishes in ~4 minutes. Smallest-to-largest auto-queueing makes your first media file searchable in ~30 seconds.",
  },
  {
    q: "How accurate are transcription and search in v1.0.1?",
    a: "v1.0.1 delivers 90–95% transcription accuracy across 99+ languages. Search performance achieves 99.4% relevant recall and an 89% Top-1 best match rate across dialogue and semantic concepts. Hybrid search operates in 30ms by combining Whisper Large v3 Turbo with Metal GPU-accelerated BGE-M3 embeddings running at 60.2 texts/sec, with 4 Suggested Search chips built into the UI.",
  },
  {
    q: "How does the optional Indic-Transcribe Flex pack work?",
    a: "For editors working with South Asian media, UGLE.AI offers an optional 701 MB Indic-Transcribe Flex pack powered by Bodhan AI / AI4Bharat. It provides high-accuracy offline transcription across 9 Indian languages: Bengali, Gujarati, Hindi, Kannada, Malayalam, Marathi, Punjabi, Tamil, and Telugu. The engine automatically keeps English words in Latin script for clean bilingual transcripts and supports cross-script search across all 9 scripts without manual transliteration.",
  },
  {
    q: "Which NLEs and export formats does UGLE.AI support?",
    a: "UGLE.AI allows you to select dialogue clips across multiple media files to create a Multi-File Clip List, which exports directly into DaVinci Resolve (native EDL), Adobe Premiere Pro (XML with automatic #/? special-character path relinking), Final Cut Pro (native FCPXML), Producer Approval CSV sheets, trimmed MP3/MP4/ZIP selects with automatic 200ms breath padding, and SRT, VTT, TXT, and Markdown transcripts.",
  },
  {
    q: "Can I fix transcript errors without re-indexing my drive?",
    a: "Yes. UGLE.AI uses visual Green/Orange/Red Confidence Bubbles in the transcript editor to flag low-certainty words instantly. Pressing Cmd+Enter enables Edit-in-Place, which updates the live local database instantly without requiring drive re-indexing. You can also execute a Replace All command to fix misspelled proper nouns or jargon across all project transcripts in one action.",
  },
  {
    q: "How many computers can I activate on one licence, and how is billing handled?",
    a: "Each Annual Personal Licence permits activation on 2 personal machines owned and operated by the license holder. Billing, global tax compliance (including VAT/GST handling), and automated invoice generation are processed through Dodo Payments, our Merchant of Record.",
  },
  {
    q: "Can studio IT teams deploy UGLE.AI across managed workstations?",
    a: "Yes. UGLE.AI provides enterprise-ready Jamf PKG packages for macOS deployment and Windows MSI installers for Windows environments. Because the application uses hardware-derived AES-256 local index encryption and operates with zero cloud telemetry, it satisfies strict studio IT security requirements.",
  },
  {
    q: "Where can I track v1.0.1 updates and user feedback?",
    a: "You can review release notes, performance logs, and version histories on our official v1.0.1 Changelog (/changelog). To read community reviews, feature requests, and editor feedback, visit UGLE.AI on Product Hunt.",
  },
];

export default function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-6">
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-[#5DA233] font-semibold mb-2">
          FAQ
        </div>
        <h2 className="text-3xl md:text-[36px] font-bold text-ugle-slate tracking-tight">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="bg-white border border-ugle-light/60 rounded-2xl shadow-sm divide-y divide-ugle-light/60 overflow-hidden">
        {PRICING_FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-[#F8FAF9] transition-colors cursor-pointer"
              >
                <h3 className="font-bold text-[15.5px] md:text-[16.5px] text-ugle-slate leading-snug">
                  {item.q}
                </h3>
                <ChevronDown
                  className={`size-4 shrink-0 text-ugle-gray transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#5DA233]" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-0.5 text-[14.5px] md:text-[15px] text-ugle-gray leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `${absoluteUrl("/pricing")}#faq`,
            url: absoluteUrl("/pricing"),
            mainEntity: PRICING_FAQS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />

      <div className="bg-white border border-ugle-light/60 rounded-[14px] p-8.5 mt-10 shadow-sm">
        <h3 className="text-[22px] font-bold text-ugle-slate mb-2">
          Enterprise
        </h3>
        <p className="text-ugle-gray text-[15.5px]">
          Large team or air-gapped deployment? For newsroom-wide or on-premise
          installations, contact us directly. We work with engineering and IT
          teams.{" "}
          <span className="font-mono text-[#5DA233]">enterprise@ugle.ai</span>
        </p>
      </div>
    </motion.div>
  );
}
