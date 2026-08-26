"use client";

import CookieConsentBanner from "./CookieConsentBanner";
import CookiePreferencesModal from "./CookiePreferencesModal";
import CookieSettingsButton from "./CookieSettingsButton";

export default function CookieManager() {
  return (
    <>
      <CookieConsentBanner />
      <CookiePreferencesModal />
      <CookieSettingsButton />
    </>
  );
}
