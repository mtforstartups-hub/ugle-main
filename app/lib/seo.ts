import type { Metadata } from "next";

export const SITE_URL = "https://ugle.ai";

const OG_ICON = {
  url: "/ugle-icon.png",
  width: 800,
  height: 800,
  alt: "Ugle - Local-First Media Search",
};

const OG_IMAGE = {
  url: "/UgleOGImage.png",
  width: 1200,
  height: 630,
  alt: "Ugle - Local-First Media Search",
};

export const OG_IMAGES = [OG_ICON, OG_IMAGE];

export const DEFAULT_SOCIAL_IMAGE = OG_IMAGE;

export const OG_DEFAULTS: NonNullable<Metadata["openGraph"]> = {
  type: "website",
  siteName: "Ugle",
  locale: "en_US",
  images: OG_IMAGES,
};

export const TWITTER_DEFAULTS: NonNullable<Metadata["twitter"]> = {
  card: "summary_large_image",
  images: [OG_IMAGE.url],
};

export function canonicalFor(path: string): { canonical: string } {
  return { canonical: path === "/" ? "/" : path.replace(/\/+$/, "") };
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

type SocialImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  socialImage?: SocialImage;
};

export function pageMetadata({
  title,
  description,
  path,
  ogType = "website",
  socialImage,
}: PageSeoInput): Metadata {
  const image = socialImage ?? DEFAULT_SOCIAL_IMAGE;

  return {
    title,
    description,
    alternates: canonicalFor(path),
    openGraph: {
      ...OG_DEFAULTS,
      type: ogType,
      url: path,
      title,
      description,
      images: socialImage ? [image] : OG_IMAGES,
    },
    twitter: {
      ...TWITTER_DEFAULTS,
      title,
      description,
      images: [image.url],
    },
  };
}