"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PRODUCT_HUNT_REVIEWS } from "@/app/components/ProductHuntProof";

const AUTOPLAY_INTERVAL_MS = 5000;

export default function ReviewCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const total = PRODUCT_HUNT_REVIEWS.length;

  useEffect(() => {
    if (isPaused || shouldReduceMotion) return;

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % total);
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, shouldReduceMotion, activeIdx, total]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % total);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      className="bg-white border border-ugle-light/60 rounded-2xl p-6 md:p-8 shadow-sm h-full flex flex-col justify-between"
    >
      {/* Top bar: label on left, Previous / Next buttons on right */}
      <div className="flex items-center justify-between gap-4 pb-5 mb-5 border-b border-ugle-light/50">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#FF6154]">
            Product Hunt Reviews
          </span>
          <span className="text-xs font-mono text-ugle-gray/60">
            ({activeIdx + 1}/{total})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous review"
            className="w-9 h-9 rounded-lg border border-ugle-light/70 bg-[#F8FAF9] hover:bg-ugle-slate hover:text-white hover:border-ugle-slate text-ugle-slate flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next review"
            className="w-9 h-9 rounded-lg border border-ugle-light/70 bg-[#F8FAF9] hover:bg-ugle-slate hover:text-white hover:border-ugle-slate text-ugle-slate flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carousel body — CSS Grid overlap stack auto-sizes to tallest review, zero layout shift */}
      <div className="flex-1 grid">
        {PRODUCT_HUNT_REVIEWS.map((review, idx) => {
          const isActive = idx === activeIdx;
          return (
            <motion.a
              key={review.name}
              href={review.href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                x: isActive ? 0 : 10,
              }}
              transition={{ duration: 0.2 }}
              className={`col-start-1 row-start-1 flex-1 flex flex-col justify-between group ${
                isActive ? "pointer-events-auto z-10" : "pointer-events-none"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={review.avatar}
                      alt={review.name}
                      width={42}
                      height={42}
                      className="w-10.5 h-10.5 rounded-full object-cover shrink-0"
                    />
                    <div className="font-bold text-base text-ugle-slate group-hover:text-[#5DA233] transition-colors">
                      {review.name}
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-0.5 text-amber-400"
                    aria-label="5 out of 5 stars"
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 text-sm md:text-[15px] text-ugle-gray leading-relaxed">
                  {review.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-ugle-light/40 text-xs font-medium text-[#FF6154] flex items-center justify-between">
                <span>Verified review on Product Hunt &rarr;</span>
                <div className="flex items-center gap-1.5">
                  {PRODUCT_HUNT_REVIEWS.map((r, dotIdx) => (
                    <span
                      key={r.name}
                      className={`h-1.5 rounded-full transition-all ${
                        dotIdx === activeIdx
                          ? "w-4 bg-[#FF6154]"
                          : "w-1.5 bg-ugle-light"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
