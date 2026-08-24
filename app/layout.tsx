import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { GoogleTagManager } from "@next/third-parties/google";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://ugle.ai"),
  title: {
    default: "Ugle | Local-First Media Search",
    template: "%s | Ugle",
  },
  description:
    "Find the exact moment inside any recording, locally on your machine, with no uploads and no cloud.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ugle.ai",
    siteName: "Ugle",
    title: "Ugle | Local-First Media Search",
    description:
      "Find the exact moment inside any recording, locally on your machine, with no uploads and no cloud.",
    images: [
      {
        url: "/ugle-icon.png",
        width: 1200,
        height: 630,
        alt: "Ugle - Local-First Media Search",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ugle | Local-First Media Search",
    description:
      "Find the exact moment inside any recording, locally on your machine, with no uploads and no cloud.",
    images: ["/ugle-icon.png"],
  },
  other: {
    rel: "preconnect",
    url: "https://challenges.cloudflare.com",
  },
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
      <GoogleTagManager gtmId="GTM-53P7CN9X" />
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
