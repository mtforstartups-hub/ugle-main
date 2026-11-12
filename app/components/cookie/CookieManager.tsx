"use client";

import CookieConsentBanner from "./CookieConsentBanner";
import CookiePreferencesModal from "./CookiePreferencesModal";
import CookieSettingsButton from "./CookieSettingsButton";

export default function CookieManager() {
  return (
    // `data-cookie-ui` lets non-public views (e.g. the Payload live-preview
    // iframe) hide every cookie-consent surface with a single CSS rule.
    <div data-cookie-ui="" style={{ display: "contents" }}>
      <CookieConsentBanner />
      <CookiePreferencesModal />
      <CookieSettingsButton />
    </div>
  );
}
