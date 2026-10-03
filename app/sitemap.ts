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
  "why-local-first": { lastModified: "2026-07-16", changeFrequency: "monthly", priority: 0.6 },
  "cost-of-scrubbing-timelines": { lastModified: "2026-06-25", changeFrequency: "monthly", priority: 0.6 },
  "what-transcription-accuracy-means": { lastModified: "2026-06-25", changeFrequency: "monthly", priority: 0.6 },
  "languages-supported": { lastModified: "2026-07-16", changeFrequency: "monthly", priority: 0.6 },
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