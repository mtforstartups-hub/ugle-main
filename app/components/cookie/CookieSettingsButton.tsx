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
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-6 left-6 z-40 group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 hover:bg-white text-[#75C043] hover:text-[#5fa332] border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all cursor-pointer"
    >
      <Cookie className="size-5 transition-transform duration-200 group-hover:scale-110" />
    </motion.button>
  );
}
