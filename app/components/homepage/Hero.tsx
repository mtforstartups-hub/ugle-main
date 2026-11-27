"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";

export default function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10 text-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-8"
      >
        <div className="space-y-6 flex flex-col items-center">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-ugle-light/70 text-xs sm:text-sm font-mono text-ugle-gray shadow-xs"
          >
            v1.0.1 Native Desktop App &bull; macOS 13.4+ &amp; Windows 10
            64-bit+ &bull; Zero Cloud Uploads
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight leading-[1.08] text-ugle-slate max-w-5xl"
          >
            Search Terabytes of Raw Footage in 30ms — 100% Offline.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-ugle-gray leading-relaxed max-w-3xl font-medium"
          >
            UGLE.AI turns your local media drives into an AES-256 encrypted,
            searchable video and audio library. Index at ~22 hrs/hr on an M4 Pro
            Mac with 99.4% relevant recall, cut Multi-File Clip Lists, and
            export straight to DaVinci Resolve, Premiere Pro, and Final Cut Pro
            — with zero cloud uploads and 0% metering.
          </motion.p>
        </div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 items-center w-full justify-center"
        >
          <Link
            href="/download"
            className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl text-base md:text-lg text-center flex items-center justify-center w-full sm:w-auto"
          >
            Download Free 15-Day Trial (~192 MB)
          </Link>
          <Link
            href="/pricing"
            className="bg-white hover:bg-gray-50 border-2 border-ugle-light/60 transition-colors text-ugle-slate font-bold py-4 px-8 rounded-xl text-base md:text-lg text-center flex items-center justify-center w-full sm:w-auto hover:border-black/10"
          >
            See Flat Annual Pricing ($225/yr)
          </Link>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-xs sm:text-sm text-ugle-gray/80 max-w-2xl leading-relaxed"
        >
          Ungated 15-day free trial. No credit card. No account required. No
          file or hour limits. Keep your read-only searchable index after Day
          15.
        </motion.p>
      </motion.div>
    </section>
  );
}
