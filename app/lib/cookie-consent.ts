export interface CookieConsentPreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsentRecord {
  preferences: CookieConsentPreferences;
  timestamp: number;
  version: string;
}

export const COOKIE_CONSENT_KEY = "ugle_cookie_consent";
export const COOKIE_CONSENT_VERSION = "1.0";
export const COOKIE_MAX_AGE_DAYS = 365; // 12 months (EU/UK compliant duration)

export const DEFAULT_PREFERENCES: CookieConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

export const ALL_ACCEPTED_PREFERENCES: CookieConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
  preferences: true,
};

export const ALL_REJECTED_PREFERENCES: CookieConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

/**
 * Read the stored cookie consent record from document.cookie or localStorage.
 */
export function getStoredConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;

  try {
    // 1. Try reading from cookie first
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${COOKIE_CONSENT_KEY}=([^;]+)`),
    );

    if (match?.[1]) {
      const decoded = decodeURIComponent(match[1]);
      const parsed: CookieConsentRecord = JSON.parse(decoded);
      if (parsed?.preferences && parsed.version === COOKIE_CONSENT_VERSION) {
        return parsed;
      }
    }

    // 2. Fallback to localStorage
    const local = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (local) {
      const parsed: CookieConsentRecord = JSON.parse(local);
      if (parsed?.preferences && parsed.version === COOKIE_CONSENT_VERSION) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading cookie consent:", err);
  }

  return null;
}

/**
 * Remove non-essential tracking cookies when non-essential cookies are rejected or withdrawn.
 */
export function clearNonEssentialCookies(): void {
  if (typeof document === "undefined") return;

  const cookiesToClear = [
    "_ga",
    "_gid",
    "_gat",
    "_gat_gtag",
    "_gcl_au",
    "_fbp",
    "_hjSessionUser",
    "_hjSession",
    "ajs_anonymous_id",
    "ajs_user_id",
  ];

  const domain = window.location.hostname;
  const rootDomain = domain.includes(".")
    ? "." + domain.split(".").slice(-2).join(".")
    : domain;

  const allCookies = document.cookie.split(";");

  for (const cookie of allCookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

    const isMatch = cookiesToClear.some(
      (prefix) => name === prefix || name.startsWith(prefix + "_"),
    );

    if (isMatch) {
      // Clear cookie across common path and domain combinations
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      document.cookie = `${name}=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      document.cookie = `${name}=; Path=/; Domain=${rootDomain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }
}

/**
 * Updates Google Consent Mode v2 and pushes consent event to dataLayer.
 */
export function updateGoogleConsentMode(prefs: CookieConsentPreferences): void {
  if (typeof window === "undefined") return;

  // Ensure window.dataLayer exists
  const win = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };

  win.dataLayer = win.dataLayer || [];

  if (typeof win.gtag !== "function") {
    win.gtag = function () {
      win.dataLayer?.push(arguments);
    };
  }

  const consentUpdatePayload = {
    analytics_storage: prefs.analytics ? "granted" : "denied",
    ad_storage: prefs.marketing ? "granted" : "denied",
    ad_user_data: prefs.marketing ? "granted" : "denied",
    ad_personalization: prefs.marketing ? "granted" : "denied",
    functionality_storage: prefs.preferences ? "granted" : "denied",
    personalization_storage: prefs.preferences ? "granted" : "denied",
    security_storage: "granted",
  };

  win.gtag("consent", "update", consentUpdatePayload);

  win.dataLayer.push({
    event: "ugle_consent_update",
    consent: {
      necessary: true,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      preferences: prefs.preferences,
      timestamp: Date.now(),
    },
  });

  // If analytics or marketing is rejected, clear any orphaned tracking cookies
  if (!prefs.analytics || !prefs.marketing) {
    clearNonEssentialCookies();
  }
}

/**
 * Persist consent choices to document.cookie, localStorage, and update Google Consent Mode.
 */
export function saveConsent(
  prefs: CookieConsentPreferences,
): CookieConsentRecord {
  const record: CookieConsentRecord = {
    preferences: {
      necessary: true,
      analytics: Boolean(prefs.analytics),
      marketing: Boolean(prefs.marketing),
      preferences: Boolean(prefs.preferences),
    },
    timestamp: Date.now(),
    version: COOKIE_CONSENT_VERSION,
  };

  if (typeof window !== "undefined") {
    try {
      const serialized = JSON.stringify(record);
      const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;

      // Set cookie (Lax, secure in production, explicit duration)
      const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(serialized)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secureFlag}`;

      // Set localStorage
      localStorage.setItem(COOKIE_CONSENT_KEY, serialized);

      // Apply to Google Consent Mode
      updateGoogleConsentMode(record.preferences);

      // Dispatch window event for any subscribers
      window.dispatchEvent(
        new CustomEvent("ugle-cookie-consent-changed", { detail: record }),
      );
    } catch (err) {
      console.error("Error saving cookie consent:", err);
    }
  }

  return record;
}
