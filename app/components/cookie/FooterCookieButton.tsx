"use client";

import { useCookieConsent } from "@/app/context/CookieConsentContext";

export default function FooterCookieButton() {
  const { openPreferences } = useCookieConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      className="text-gray-400 hover:text-white transition-colors font-mono text-xs cursor-pointer text-left"
    >
      Cookie Settings
    </button>
  );
}
