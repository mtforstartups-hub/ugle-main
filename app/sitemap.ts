import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/lib/seo";

type RouteEntry = {
  lastModified: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const STATIC_ROUTES: Record<string, RouteEntry> = {
  "": { lastModified: "2026-09-16", changeFrequency: "monthly", priority: 1.0 },
  "/about": { lastModified: "2026-08-24", changeFrequency: "monthly", priority: 0.8 },
  "/how-it-works": { lastModified: "2026-08-24", changeFrequency: "monthly", priority: 0.8 },
  "/pricing": { lastModified: "2026-09-16", changeFrequency: "monthly", priority: 0.8 },
  "/use-cases": { lastModified: "2026-07-16", changeFrequency: "monthly", priority: 0.7 },
  "/education": { lastModified: "2026-08-24", changeFrequency: "monthly", priority: 0.7 },
  "/blog": { lastModified: "2026-09-16", changeFrequency: "weekly", priority: 0.7 },
  "/changelog": { lastModified: "2026-09-16", changeFrequency: "weekly", priority: 0.6 },
  "/download": { lastModified: "2026-08-24", changeFrequency: "monthly", priority: 0.6 },
  "/request-trial": { lastModified: "2026-09-16", changeFrequency: "monthly", priority: 0.6 },
  "/request-demo": { lastModified: "2026-08-24", changeFrequency: "monthly", priority: 0.6 },
  "/contact": { lastModified: "2026-08-24", changeFrequency: "yearly", priority: 0.5 },
  "/security": { lastModified: "2026-08-24", changeFrequency: "yearly", priority: 0.4 },
  "/privacy-policy": { lastModified: "2026-08-24", changeFrequency: "yearly", priority: 0.3 },
  "/terms": { lastModified: "2026-08-24", changeFrequency: "yearly", priority: 0.3 },
  "/eula": { lastModified: "2026-08-24", changeFrequency: "yearly", priority: 0.3 },
  "/notice": { lastModified: "2026-08-24", changeFrequency: "yearly", priority: 0.3 },
};

// Blog post slugs — keep in sync with BLOG_POST_DATA in app/blog/[slug]/page.tsx
const BLOG_ROUTES: Record<string, RouteEntry> = {
  "ugle-product-hunt-launch": { lastModified: "2026-10-30", changeFrequency: "monthly", priority: 0.6 },
  "why-local-first": { lastModified: "2026-07-16", changeFrequency: "monthly", priority: 0.6 },
  "cost-of-scrubbing-timelines": { lastModified: "2026-06-25", changeFrequency: "monthly", priority: 0.6 },
  "what-transcription-accuracy-means": { lastModified: "2026-06-25", changeFrequency: "monthly", priority: 0.6 },
  "languages-supported": { lastModified: "2026-07-16", changeFrequency: "monthly", priority: 0.6 },
  "find-quote-in-video-without-exact-words": { lastModified: "2026-09-28", changeFrequency: "monthly", priority: 0.6 },
  "search-across-multiple-audio-recordings": { lastModified: "2026-09-23", changeFrequency: "monthly", priority: 0.6 },
  "search-podcast-back-catalogue": { lastModified: "2026-09-18", changeFrequency: "monthly", priority: 0.6 },
  "search-journalist-interview-recordings-locally": { lastModified: "2026-09-13", changeFrequency: "monthly", priority: 0.6 },
  "keyword-search-vs-semantic-search-recorded-interviews": { lastModified: "2026-09-08", changeFrequency: "monthly", priority: 0.6 },
  "find-archive-soundbite-news-segment": { lastModified: "2026-09-03", changeFrequency: "monthly", priority: 0.6 },
  "local-vs-cloud-media-search": { lastModified: "2026-08-29", changeFrequency: "monthly", priority: 0.6 },
  "build-searchable-interview-archive": { lastModified: "2026-08-24", changeFrequency: "monthly", priority: 0.6 },
  "verify-quote-against-original-recording": { lastModified: "2026-08-19", changeFrequency: "monthly", priority: 0.6 },
  "transcription-search-quality-recorded-media": { lastModified: "2026-08-14", changeFrequency: "monthly", priority: 0.6 },
  "evaluate-media-search-software": { lastModified: "2026-08-09", changeFrequency: "monthly", priority: 0.6 },
  "retrieved-interview-passage-to-clip": { lastModified: "2026-08-04", changeFrequency: "monthly", priority: 0.6 },
};

// Use-case slugs — keep in sync with generateStaticParams in app/use-cases/[slug]/page.tsx
const USE_CASE_ROUTES: Record<string, RouteEntry> = {
  newsrooms: { lastModified: "2026-07-16", changeFrequency: "monthly", priority: 0.7 },
  podcasts: { lastModified: "2026-07-16", changeFrequency: "monthly", priority: 0.7 },
  journalists: { lastModified: "2026-07-16", changeFrequency: "monthly", priority: 0.7 },
};

function toEntry(path: string, route: RouteEntry): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = Object.entries(STATIC_ROUTES).map(([path, route]) =>
    toEntry(path, route)
  );

  const blogRoutes = Object.entries(BLOG_ROUTES).map(([slug, route]) =>
    toEntry(`/blog/${slug}`, route)
  );

  const useCaseRoutes = Object.entries(USE_CASE_ROUTES).map(([slug, route]) =>
    toEntry(`/use-cases/${slug}`, route)
  );

  return [...staticRoutes, ...blogRoutes, ...useCaseRoutes];
}