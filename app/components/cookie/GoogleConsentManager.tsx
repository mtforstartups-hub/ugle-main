import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import { COOKIE_CONSENT_KEY } from "@/app/lib/cookie-consent";

interface GoogleConsentManagerProps {
  gtmId: string;
}

export default function GoogleConsentManager({
  gtmId,
}: GoogleConsentManagerProps) {
  return (
    <>
      {/* 
        Google Consent Mode v2 Default Initialization Script
        Must execute before GTM container loads to enforce 'Block Trackers First' (EU GDPR / UK PECR).
      */}
      <Script
        id="google-consent-mode-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            var initialPrefs = {
              analytics: false,
              marketing: false,
              preferences: false
            };

            try {
              var match = document.cookie.match(/(?:^|;\\s*)${COOKIE_CONSENT_KEY}=([^;]+)/);
              if (match && match[1]) {
                var parsed = JSON.parse(decodeURIComponent(match[1]));
                if (parsed && parsed.preferences) {
                  initialPrefs = parsed.preferences;
                }
              }
            } catch(e) {}

            gtag('consent', 'default', {
              'analytics_storage': initialPrefs.analytics ? 'granted' : 'denied',
              'ad_storage': initialPrefs.marketing ? 'granted' : 'denied',
              'ad_user_data': initialPrefs.marketing ? 'granted' : 'denied',
              'ad_personalization': initialPrefs.marketing ? 'granted' : 'denied',
              'functionality_storage': initialPrefs.preferences ? 'granted' : 'denied',
              'personalization_storage': initialPrefs.preferences ? 'granted' : 'denied',
              'security_storage': 'granted',
              'wait_for_update': 500
            });
          `,
        }}
      />
      <GoogleTagManager gtmId={gtmId} />
    </>
  );
}
