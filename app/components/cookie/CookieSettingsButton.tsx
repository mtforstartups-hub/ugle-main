"use client";

import { motion } from "motion/react";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/app/context/CookieConsentContext";

export default function CookieSettingsButton() {
  const { openPreferences, isBannerOpen, isPreferencesOpen } =
    useCookieConsent();

  // Hide the floating button while the banner or modal is active
  if (isBannerOpen || isPreferencesOpen) {
    return null;
  }

  return (
    <motion.button
      type="button"
      onClick={openPreferences}
      aria-label="Manage Cookie Settings"
      title="Manage Cookie Settings"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-6 left-6 z-40 group flex items-center gap-2 px-3 py-2 rounded-full bg-[#1C1C1C]/90 hover:bg-[#252525] text-gray-300 hover:text-white border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all cursor-pointer"
    >
      <div className="p-1 rounded-full bg-[#75C043]/20 text-[#75C043] group-hover:bg-[#75C043]/30 transition-colors">
        <Cookie className="size-3.5" />
      </div>
      <span className="text-[11px] font-mono font-medium pr-1 hidden sm:inline-block">
        Cookie Settings
      </span>
    </motion.button>
  );
}
