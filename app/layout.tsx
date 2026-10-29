import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import GoogleConsentManager from "./components/cookie/GoogleConsentManager";
import { CookieConsentProvider } from "./context/CookieConsentContext";
import CookieManager from "./components/cookie/CookieManager";
import {
  OG_DEFAULTS,
  OG_IMAGES,
  SITE_URL,
  TWITTER_DEFAULTS,
  serializeJsonLd,
} from "@/app/lib/seo";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sfMono = localFont({
  src: [
    {
      path: "./fonts/sf-mono/sf-mono-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/sf-mono/sf-mono-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/sf-mono/sf-mono-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/sf-mono/sf-mono-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/sf-mono/sf-mono-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mono",
});

const HOME_TITLE = "Ugle | Local-First Media Search";
const HOME_DESCRIPTION =
  "Find the exact moment inside any recording, locally on your machine, with no uploads and no cloud.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: "%s | Ugle",
  },
  description: HOME_DESCRIPTION,
  openGraph: {
    ...OG_DEFAULTS,
    url: "/",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: OG_IMAGES,
  },
  twitter: {
    ...TWITTER_DEFAULTS,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Ugle",
      url: SITE_URL,
      logo: `${SITE_URL}/Ugle%20Logo.png`,
      description:
        "The local-first search application for media professionals.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        email: "support@ugle.ai",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Ugle",
      description: HOME_DESCRIPTION,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "Ugle",
      operatingSystem: "macOS 13.4+, Windows 10+ 64-bit",
      applicationCategory: "MultimediaApplication",
      description: HOME_DESCRIPTION,
      url: SITE_URL,
      image: `${SITE_URL}/ugle-icon.png`,
      featureList: [
        "On-device local transcription",
        "Sub-30ms search across media archives",
        "Zero cloud uploads & 100% private",
        "90+ supported languages",
        "Precision timestamp clip extraction",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${sfMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://challenges.cloudflare.com" />
        <GoogleConsentManager gtmId="GTM-53P7CN9X" />
      </head>
      <body className="min-h-full flex flex-col">
        <CookieConsentProvider>
          <Header />
          {children}
          <Footer />
          <ScrollToTop />
          <CookieManager />
        </CookieConsentProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      </body>
    </html>
  );
}