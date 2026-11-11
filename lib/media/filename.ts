/**
 * Media filenames end up in public URLs, object keys and (for Vercel Blob)
 * signed client-upload tokens. Vercel rejects an upload when the pathname in
 * the request no longer matches the signed token, which is what happens with
 * spaces: the SDK encodes them as `+` and the comparison fails with a 400.
 *
 * Normalise names before they reach storage so any file an editor drops in
 * uploads cleanly: `Prod Hun Ugle` -> `prod-hun-ugle.png`.
 */

const MIME_EXTENSIONS: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/tiff": "tif",
  "image/webp": "webp",
};

// Anything outside this set is replaced with a single dash.
const UNSAFE_CHARACTERS = /[^a-z0-9._-]+/g;
const EDGE_SEPARATORS = /^[-._]+|[-._]+$/g;

/**
 * Returns a URL-safe, lower-case filename that keeps the original extension
 * (or derives one from the MIME type when the name has none).
 */
export function sanitizeFilename(
  filename: string,
  mimeType?: null | string
): string {
  // Browsers only send the base name, but strip any path defensively.
  const base = (filename ?? "").replace(/\\/g, "/").split("/").pop() ?? "";

  const dotIndex = base.lastIndexOf(".");
  const hasExtension = dotIndex > 0 && dotIndex < base.length - 1;
  const stem = hasExtension ? base.slice(0, dotIndex) : base;
  const originalExtension = hasExtension ? base.slice(dotIndex + 1) : "";

  const slug = stem
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents: café -> cafe
    .toLowerCase()
    .replace(UNSAFE_CHARACTERS, "-")
    .replace(/-{2,}/g, "-")
    .replace(EDGE_SEPARATORS, "");

  const extension = (originalExtension || MIME_EXTENSIONS[mimeType ?? ""] || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const safeStem = slug || "image";

  return extension ? `${safeStem}.${extension}` : safeStem;
}
