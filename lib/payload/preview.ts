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
  // Build the query with URLSearchParams so the secret survives the round trip.
  // Secrets are often base64, and characters like `+`, `/` and `=` change
  // meaning in a query string (`+` decodes to a space), which made the route
  // reject valid secrets with "Invalid preview secret".
  const query = new URLSearchParams({
    collection,
    slug: slug || "",
    secret: process.env.PREVIEW_SECRET || "",
    path,
  });
  return `/api/preview?${query.toString()}`;
}

export function previewSecretUrl(collection: "posts" | "answers", slug?: string | null) {
  return `${process.env.NEXT_PUBLIC_SERVER_URL || ""}${previewSecretPath(collection, slug)}`;
}
