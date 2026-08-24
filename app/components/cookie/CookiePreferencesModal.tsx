"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ShieldCheck,
  BarChart3,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCookieConsent } from "@/app/context/CookieConsentContext";

export default function CookiePreferencesModal() {
  const {
    preferences,
    isPreferencesOpen,
    closePreferences,
    savePreferences,
    acceptAll,
    rejectAll,
  } = useCookieConsent();

  // Local draft state for toggles
  const [analytics, setAnalytics] = useState(preferences.analytics);
  const [marketing, setMarketing] = useState(preferences.marketing);
  const [prefs, setPrefs] = useState(preferences.preferences);

  // Accordion expansion states for detailed info
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Synchronize local draft state with context preferences when opened
  useEffect(() => {
    if (isPreferencesOpen) {
      setAnalytics(preferences.analytics);
      setMarketing(preferences.marketing);
      setPrefs(preferences.preferences);
    }
  }, [isPreferencesOpen, preferences]);

  // Handle escape key and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPreferencesOpen) return;
      if (e.key === "Escape") {
        closePreferences();
      }
    };

    if (isPreferencesOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPreferencesOpen, closePreferences]);

  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategory((curr) => (curr === cat ? null : cat));
  };

  const handleSaveCustom = () => {
    savePreferences({
      analytics,
      marketing,
      preferences: prefs,
    });
  };

  return (
    <AnimatePresence>
      {isPreferencesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePreferences}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white text-ugle-slate rounded-2xl border border-gray-200 shadow-2xl z-10 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#75C043]/15 text-[#75C043]">
                  <Sliders className="size-5" />
                </div>
                <div>
                  <h2
                    id="cookie-preferences-title"
                    className="text-lg font-bold tracking-tight text-gray-900"
                  >
                    Cookie & Privacy Preferences
                  </h2>
                  <p className="text-xs text-gray-500 font-mono">
                    GDPR & UK PECR Compliant Consent Manager
                  </p>
                </div>
              </div>
              <button
                onClick={closePreferences}
                aria-label="Close preferences modal"
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Content / Categories */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-white">
              <p className="text-sm text-gray-600 leading-relaxed">
                We use cookies and related technologies to ensure security, improve site performance, and analyze traffic. You can customize your consent preferences for each category below. Strictly necessary cookies cannot be disabled.
              </p>

              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-[#75C043] p-1.5 rounded-md bg-[#75C043]/10">
                      <Lock className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">
                          Strictly Necessary Cookies
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#75C043]/20 text-[#609e37] font-bold">
                          Always Active
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Essential for basic navigation, security, and storing your consent choices.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCategoryExpand("necessary")}
                    aria-label="Toggle details for Strictly Necessary cookies"
                    className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
                  >
                    {expandedCategory === "necessary" ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>
                </div>

                {expandedCategory === "necessary" && (
                  <div className="pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-2 font-mono">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                      <p className="text-gray-800 font-semibold">Purposes & Storage:</p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-600">
                        <li>
                          <code className="text-[#609e37] font-bold">ugle_cookie_consent</code>: Stores your cookie preferences (1 year).
                        </li>
                        <li>
                          <code className="text-[#609e37] font-bold">ugle_region</code>: Remembers pricing currency/region selection.
                        </li>
                        <li>
                          <code className="text-[#609e37] font-bold">cf_turnstile</code>: Cloudflare bot protection and security verification.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Category 2: Analytics & Performance */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600 p-1.5 rounded-md bg-blue-50">
                      <BarChart3 className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">
                          Analytics & Performance
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Helps us measure site traffic and aggregate usage patterns to improve user experience.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analytics}
                        onChange={(e) => setAnalytics(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Toggle Analytics cookies"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#75C043]"></div>
                    </label>

                    <button
                      type="button"
                      onClick={() => toggleCategoryExpand("analytics")}
                      aria-label="Toggle details for Analytics cookies"
                      className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
                    >
                      {expandedCategory === "analytics" ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedCategory === "analytics" && (
                  <div className="pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-2 font-mono">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                      <p className="text-gray-800 font-semibold">Purposes & Storage:</p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-600">
                        <li>
                          <code className="text-blue-600 font-bold">_ga, _gid</code>: Anonymous visitor telemetry via Google Analytics & Google Tag Manager.
                        </li>
                        <li>Consent Mode v2: Analytics tags remain blocked until explicit opt-in.</li>
                        <li>Retention: Up to 13 months.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Category 3: Marketing & Advertising */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-amber-600 p-1.5 rounded-md bg-amber-50">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">
                          Marketing & Advertising
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Used to measure campaign conversions and relevant announcements. Never sells personal data.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketing}
                        onChange={(e) => setMarketing(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Toggle Marketing cookies"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#75C043]"></div>
                    </label>

                    <button
                      type="button"
                      onClick={() => toggleCategoryExpand("marketing")}
                      aria-label="Toggle details for Marketing cookies"
                      className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
                    >
                      {expandedCategory === "marketing" ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedCategory === "marketing" && (
                  <div className="pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-2 font-mono">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                      <p className="text-gray-800 font-semibold">Purposes & Storage:</p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-600">
                        <li>Ad conversion attribution and campaign performance measurement.</li>
                        <li>Retention: Up to 12 months.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Category 4: Functional / Preferences */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-purple-600 p-1.5 rounded-md bg-purple-50">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">
                          Preferences & Functionality
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Enables custom preferences and enhanced interactive site features.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefs}
                        onChange={(e) => setPrefs(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Toggle Preferences cookies"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#75C043]"></div>
                    </label>

                    <button
                      type="button"
                      onClick={() => toggleCategoryExpand("preferences")}
                      aria-label="Toggle details for Preferences cookies"
                      className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
                    >
                      {expandedCategory === "preferences" ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedCategory === "preferences" && (
                  <div className="pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-2 font-mono">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                      <p className="text-gray-800 font-semibold">Purposes & Storage:</p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-600">
                        <li>Remembers localized UI state and user preferences between sessions.</li>
                        <li>Retention: Up to 1 year.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer with Actions (Equal Prominence & Transparency) */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                Read our{" "}
                <Link
                  href="/privacy-policy"
                  onClick={closePreferences}
                  className="text-gray-700 underline font-medium hover:text-[#75C043] transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={rejectAll}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-all cursor-pointer text-center shadow-xs"
                >
                  Reject All
                </button>

                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 hover:text-gray-900 transition-all cursor-pointer text-center"
                >
                  Save Choices
                </button>

                <button
                  type="button"
                  onClick={acceptAll}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider text-white bg-[#75C043] hover:bg-[#68ab3c] shadow-[0_2px_12px_rgba(117,192,67,0.3)] hover:shadow-[0_4px_16px_rgba(117,192,67,0.45)] transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="size-3.5" />
                  Accept All
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
