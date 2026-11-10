export function previewUrl(collection: "posts" | "answers", slug?: string | null) {
  if (!slug) return "/";
  const base = collection === "posts" ? "/blog" : "/answers";
  return `${base}/${slug}`;
}

/**
 * Relative preview route that enables Next.js draft mode and then redirects to
 * the public path. Relative (not absolute) so the admin always previews itself,
 * including on Vercel preview deployments where the origin differs from
 * `NEXT_PUBLIC_SERVER_URL`.
 */
export function previewSecretPath(collection: "posts" | "answers", slug?: string | null) {
  const path = previewUrl(collection, slug);
  const secret = process.env.PREVIEW_SECRET || "";
  return `/api/preview?collection=${collection}&slug=${slug || ""}&secret=${secret}&path=${encodeURIComponent(path)}`;
}

export function previewSecretUrl(collection: "posts" | "answers", slug?: string | null) {
  return `${process.env.NEXT_PUBLIC_SERVER_URL || ""}${previewSecretPath(collection, slug)}`;
}
