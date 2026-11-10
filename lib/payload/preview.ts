export function previewUrl(collection: "posts" | "answers", slug?: string | null) {
  if (!slug) return "/";
  const base = collection === "posts" ? "/blog" : "/answers";
  return `${base}/${slug}`;
}

export function previewSecretUrl(collection: "posts" | "answers", slug?: string | null) {
  const path = previewUrl(collection, slug);
  const secret = process.env.PREVIEW_SECRET || "";
  return `${process.env.NEXT_PUBLIC_SERVER_URL || ""}/api/preview?collection=${collection}&slug=${slug || ""}&secret=${secret}&path=${encodeURIComponent(path)}`;
}
