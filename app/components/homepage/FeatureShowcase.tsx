"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, Cpu, Globe, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const FEATURE_ITEMS = [
  {
    icon: Cpu,
    eyebrow: "Local AI Engine",
    title: "Hybrid Local AI Built for Real Edit Bays",
    image: "/images/feature/hybrid-local-ai.png",
    imageAlt: "Hybrid Local AI Built for Real Edit Bays",
    description:
      "Combine exact keyword matches with semantic meaning in 30ms using Whisper Large v3 Turbo and Metal GPU BGE-M3 (60.2 texts/s). Smallest-to-largest auto-queuing makes your first file searchable in ~30s so you start pulling selects immediately.",
    bullets: [
      "99.4% relevant recall and 89% Top-1 best match",
      "4 Suggested Search chips to jumpstart discovery",
      "Green/Orange/Red Confidence Bubbles to spot low-certainty words at a glance",
      "Cmd+Enter Edit-in-Place with live DB update and Replace All across transcripts",
    ],
  },
  {
    icon: Globe,
    eyebrow: "Global & Indic",
    title: "99+ Languages + Cross-Script Indic Search",
    image: "/images/feature/languages-supported.png",
    imageAlt: "99+ Languages and Cross-Script Indic Search",
    description:
      "Achieve 90–95% transcription accuracy across 99+ languages completely offline. Working with Indian-language or code-switched interviews? Add the optional 701 MB Indic-Transcribe Flex pack powered by Bodhan AI / AI4Bharat.",
    bullets: [
      "Supports Bengali, Gujarati, Hindi, Kannada, Malayalam, Marathi, Punjabi, Tamil, and Telugu",
      "Keeps English words in Latin script for clean bilingual transcripts",
      "Cross-script search across all 9 scripts without manual transliteration",
    ],
  },
  {
    icon: ShieldCheck,
    eyebrow: "Security & IT",
    title: "Zero-Cloud Security & Studio IT Deployment",
    image: "/images/feature/local-vs-cloud-media-search.png",
    imageAlt: "Zero-Cloud Security and Studio IT Deployment",
    description:
      "Unreleased cuts, NDA interviews, and client dailies never leave your workstation. UGLE.AI stores its entire index locally with AES-256 hardware-derived encryption and zero telemetry.",
    bullets: [
      "Zero cloud uploads, zero usage tracking, zero per-minute metering",
      "Native ~192 MB installer for macOS 13.4+ and Windows 10 64-bit+",
      "Enterprise deployment via Jamf PKG and Windows MSI",
    ],
    hasSecurityLinks: true,
  },
];

const AUTOPLAY_INTERVAL_MS = 5000;

export default function FeatureShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isPaused || shouldReduceMotion) return;

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % FEATURE_ITEMS.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, shouldReduceMotion, activeIdx]);

  return (
    <section className="w-full bg-white border-t border-ugle-light/60 py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="font-mono text-xs tracking-[0.14em] uppercase text-[#5DA233] font-semibold mb-3">
            Local-First Architecture
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-ugle-slate tracking-tight mb-4">
            Built for Real Edit Bays. Private by Design.
          </h2>
          <p className="text-base md:text-lg text-ugle-gray leading-relaxed">
            Hybrid local AI, 99+ languages, and zero-cloud studio security —
            running directly on your machine.
          </p>
        </div>

        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left: Accordion list with title + description */}
          <div className="lg:col-span-6 space-y-3">
            {FEATURE_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isOpen = activeIdx === idx;
              return (
                <div
                  key={item.title}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "bg-white border-[#75C043] shadow-md"
                      : "bg-white/70 border-ugle-light/60 hover:border-ugle-light"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setActiveIdx(idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isOpen
                            ? "bg-[#F0F9EA] border border-[#75C043]/40 text-[#5DA233]"
                            : "bg-[#F8FAF9] border border-ugle-light/60 text-ugle-gray"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg md:text-xl font-extrabold text-ugle-slate tracking-tight">
                        {item.title}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`size-5 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#5DA233]" : "text-ugle-gray"
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-0.5 pl-19">
                          <p className="text-sm md:text-[15px] text-ugle-gray leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right: Image + pointed list stacked in same grid cell (auto-sizes to tallest item, zero layout shift) */}
          <div className="lg:col-span-6">
            <div className="bg-ugle-slate text-white rounded-2xl p-6 md:p-8 shadow-lg grid">
              {FEATURE_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeIdx === idx;
                return (
                  <motion.div
                    key={item.title}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      y: isActive ? 0 : 8,
                    }}
                    transition={{ duration: 0.22 }}
                    aria-hidden={!isActive}
                    className={`col-start-1 row-start-1 flex flex-col justify-between ${
                      isActive
                        ? "pointer-events-auto z-10"
                        : "pointer-events-none"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#75C043]/15 border border-[#75C043]/30 flex items-center justify-center text-[#75C043]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-xs tracking-[0.14em] uppercase text-[#75C043] font-semibold">
                          {item.eyebrow}
                        </span>
                      </div>

                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/20 mb-5">
                        <Image
                          src={item.image}
                          alt={item.imageAlt}
                          fill
                          sizes="(min-width: 1024px) 560px, 100vw"
                          className="object-cover"
                        />
                      </div>

                      <ul className="space-y-3">
                        {item.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-3 text-sm text-white/90 leading-relaxed"
                          >
                            <Check
                              className="size-4 shrink-0 mt-0.5 text-[#75C043]"
                              strokeWidth={2.5}
                            />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {item.hasSecurityLinks && (
                      <div className="mt-5 pt-4 border-t border-white/10 text-xs text-white/70">
                        Review full specifications on the{" "}
                        <Link
                          href="/security"
                          tabIndex={isActive ? 0 : -1}
                          className="text-[#75C043] font-semibold hover:underline"
                        >
                          Security Architecture
                        </Link>{" "}
                        page and inspect changes in the{" "}
                        <Link
                          href="/changelog"
                          tabIndex={isActive ? 0 : -1}
                          className="text-[#75C043] font-semibold hover:underline"
                        >
                          v1.0.1 Changelog
                        </Link>
                        .
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
