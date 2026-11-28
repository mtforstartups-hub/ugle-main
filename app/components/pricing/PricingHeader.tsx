"use client";
import { motion } from "motion/react";

export default function PricingHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-10 md:mb-12"
    >
      <div className="font-mono text-xs md:text-[13px] tracking-[0.14em] uppercase text-[#5DA233] font-medium mb-3">
        Pricing
      </div>
      <h1 className="text-[36px] md:text-[56px] font-extrabold tracking-[-0.02em] leading-[1.06] text-ugle-slate mb-4 max-w-4xl mx-auto">
        Flat Annual Licensing. 0% Metering. Unlimited Local Hours.
      </h1>
      <p className="text-[18px] md:text-[21px] text-ugle-gray max-w-2xl mx-auto leading-[1.55]">
        Pay once a year and transcribe, index, and search every terabyte on your
        drives without per-minute cloud fees or upload caps.
      </p>
    </motion.div>
  );
}
