"use client";

import { motion, AnimatePresence } from "motion/react";
import { Cookie, ShieldCheck, Sliders, Check, X } from "lucide-react";
import Link from "next/link";
import { useCookieConsent } from "@/app/context/CookieConsentContext";

export default function CookieConsentBanner() {
  const {
    isBannerOpen,
    isPreferencesOpen,
    acceptAll,
    rejectAll,
    openPreferences,
  } = useCookieConsent();

  // If the detailed modal is open, we hide the lower banner to avoid distraction
  const shouldShow = isBannerOpen && !isPreferencesOpen;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="ugle-cookie-banner"
          role="region"
          aria-label="Cookie consent banner"
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 md:left-auto md:right-6 md:max-w-xl z-50 pointer-events-auto"
        >
          <div className="bg-white/95 backdrop-blur-md text-ugle-slate p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#75C043]/15 text-[#75C043] shrink-0 mt-0.5">
                <Cookie className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-gray-900 tracking-tight">
                    We value your privacy
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    <ShieldCheck className="size-3 text-[#75C043]" />
                    GDPR / PECR
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-1.5">
                  We use essential cookies to secure and run our website. With your permission, we also use optional analytics to understand how our site is used and improve your experience. Non-essential cookies are blocked until you choose to accept them.
                </p>
              </div>
            </div>

            {/* Links / Info */}
            <div className="text-xs text-gray-500 font-mono">
              Learn more in our{" "}
              <Link
                href="/privacy-policy"
                className="text-[#75C043] font-semibold hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              or customize your choices below.
            </div>

            {/* Action Buttons: EQUAL PROMINENCE (EU GDPR / UK ICO COMPLIANT) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Reject Non-Essential */}
              <button
                type="button"
                onClick={rejectAll}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 active:scale-[0.98] transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs"
              >
                <X className="size-3.5 text-gray-500" />
                Reject All
              </button>

              {/* Manage Preferences */}
              <button
                type="button"
                onClick={openPreferences}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 hover:text-gray-900 active:scale-[0.98] transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Sliders className="size-3.5 text-[#75C043]" />
                Preferences
              </button>

              {/* Accept All */}
              <button
                type="button"
                onClick={acceptAll}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider text-white bg-[#75C043] hover:bg-[#68ab3c] active:scale-[0.98] shadow-[0_2px_14px_rgba(117,192,67,0.3)] hover:shadow-[0_4px_20px_rgba(117,192,67,0.45)] transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <Check className="size-3.5" />
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
