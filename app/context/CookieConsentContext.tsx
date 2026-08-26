"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  CookieConsentPreferences,
  CookieConsentRecord,
  DEFAULT_PREFERENCES,
  ALL_ACCEPTED_PREFERENCES,
  ALL_REJECTED_PREFERENCES,
  getStoredConsent,
  saveConsent,
  updateGoogleConsentMode,
} from "@/app/lib/cookie-consent";

interface CookieConsentContextType {
  preferences: CookieConsentPreferences;
  hasResponded: boolean;
  isBannerOpen: boolean;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (customPrefs: Partial<CookieConsentPreferences>) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(
  undefined,
);

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] =
    useState<CookieConsentPreferences>(DEFAULT_PREFERENCES);
  const [hasResponded, setHasResponded] = useState<boolean>(false);
  const [isBannerOpen, setIsBannerOpen] = useState<boolean>(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize consent on mount
  useEffect(() => {
    const existing = getStoredConsent();
    if (existing) {
      setPreferences(existing.preferences);
      setHasResponded(true);
      setIsBannerOpen(false);
      // Ensure Google Consent Mode is updated with stored preferences
      updateGoogleConsentMode(existing.preferences);
    } else {
      // Prior Consent / Zero Load: Non-essential trackers remain denied by default
      setPreferences(DEFAULT_PREFERENCES);
      setHasResponded(false);
      setIsBannerOpen(true);
      updateGoogleConsentMode(DEFAULT_PREFERENCES);
    }
    setIsInitialized(true);

    const handleExternalChange = (e: Event) => {
      const customEvent = e as CustomEvent<CookieConsentRecord>;
      if (customEvent.detail?.preferences) {
        setPreferences(customEvent.detail.preferences);
        setHasResponded(true);
      }
    };

    window.addEventListener(
      "ugle-cookie-consent-changed",
      handleExternalChange,
    );
    return () => {
      window.removeEventListener(
        "ugle-cookie-consent-changed",
        handleExternalChange,
      );
    };
  }, []);

  const acceptAll = useCallback(() => {
    const record = saveConsent(ALL_ACCEPTED_PREFERENCES);
    setPreferences(record.preferences);
    setHasResponded(true);
    setIsBannerOpen(false);
    setIsPreferencesOpen(false);
  }, []);

  const rejectAll = useCallback(() => {
    const record = saveConsent(ALL_REJECTED_PREFERENCES);
    setPreferences(record.preferences);
    setHasResponded(true);
    setIsBannerOpen(false);
    setIsPreferencesOpen(false);
  }, []);

  const handleSavePreferences = useCallback(
    (customPrefs: Partial<CookieConsentPreferences>) => {
      const fullPrefs: CookieConsentPreferences = {
        necessary: true, // always strictly true
        analytics: Boolean(customPrefs.analytics),
        marketing: Boolean(customPrefs.marketing),
        preferences: Boolean(customPrefs.preferences),
      };
      const record = saveConsent(fullPrefs);
      setPreferences(record.preferences);
      setHasResponded(true);
      setIsBannerOpen(false);
      setIsPreferencesOpen(false);
    },
    [],
  );

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      preferences,
      hasResponded,
      isBannerOpen: isInitialized && isBannerOpen,
      isPreferencesOpen,
      acceptAll,
      rejectAll,
      savePreferences: handleSavePreferences,
      openPreferences,
      closePreferences,
    }),
    [
      preferences,
      hasResponded,
      isInitialized,
      isBannerOpen,
      isPreferencesOpen,
      acceptAll,
      rejectAll,
      handleSavePreferences,
      openPreferences,
      closePreferences,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextType {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      "useCookieConsent must be used within a CookieConsentProvider",
    );
  }
  return context;
}
