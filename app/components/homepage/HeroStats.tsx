"use client";

import { useState } from "react";

const heroStats = [
  {
    metric: "Indexing Speed",
    value: "22 hrs/hr",
    context:
      "On Apple M4 Pro. 100% local Whisper Large v3 Turbo + Metal GPU BGE-M3.",
  },
  {
    metric: "Search Recall",
    value: "99.4%",
    context:
      "89% Top-1 best-match accuracy in 30ms. Confidence Bubbles & Replace All built in.",
  },
  {
    metric: "NLE Exports",
    value: "EDL / XML",
    context:
      "Native Resolve EDL, Premiere XML, Final Cut FCPXML, and Producer Approval CSV.",
  },
  {
    metric: "Metering",
    value: "0%",
    context:
      "No AI tokens. No per-search fees. No usage-based fees. One annual licence.",
  },
];

export default function HeroStats() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="pt-8 md:pt-12 pb-8 md:pb-0 border-t border-ugle-light/60 grid grid-cols-2 md:grid-cols-4 gap-18 md:gap-0 w-full max-w-4xl mx-auto text-center">
      {heroStats.map((s, idx) => {
        const isOpen = activeIdx === idx;
        return (
          <div
            key={s.metric}
            className="relative flex flex-col items-center cursor-pointer group md:px-6 md:border-r md:border-ugle-light/40 last:border-r-0"
            onMouseEnter={() => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
            onClick={() => setActiveIdx(isOpen ? null : idx)}
          >
            <div className="font-mono text-sm text-ugle-gray/60 uppercase tracking-widest mb-1 transition-colors group-hover:text-ugle-green/70">
              {s.metric}
            </div>
            <div className="font-mono text-3xl md:text-4xl font-bold text-ugle-slate transition-colors group-hover:text-ugle-green">
              {s.value}
            </div>
            <div
              className={`hidden md:block absolute top-full left-0 right-0 z-10 pt-2 pointer-events-none transition-all duration-200 ${
                isOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-1"
              }`}
            >
              <p className="text-xs md:text-sm text-ugle-gray leading-tight font-medium max-w-48 mx-auto">
                {s.context}
              </p>
            </div>
            <div className="md:hidden absolute top-full left-0 right-0 z-10 pt-2 pointer-events-none">
              <p className="text-xs md:text-sm text-ugle-gray leading-tight font-medium max-w-48 mx-auto">
                {s.context}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
