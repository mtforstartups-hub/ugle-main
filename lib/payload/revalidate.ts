import { revalidatePath } from "next/cache";

/**
 * `revalidatePath` can only run inside a Next.js request/render context.
 * Payload hooks also run from scripts and jobs (migrations, seeds, CLI work),
 * where the static-generation store does not exist. Swallow that specific
 * failure so content operations never break outside of a request.
 */
function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("static generation store missing")
    ) {
      return;
    }
    throw error;
  }
}

export async function revalidateBlogPaths(slug?: string | null, previousSlug?: string | null) {
  safeRevalidate("/blog");
  if (slug) safeRevalidate(`/blog/${slug}`);
  if (previousSlug && previousSlug !== slug) safeRevalidate(`/blog/${previousSlug}`);
  safeRevalidate("/sitemap.xml");
  safeRevalidate("/blog/rss.xml");
}

export async function revalidateAnswersPaths(slug?: string | null, previousSlug?: string | null) {
  safeRevalidate("/answers");
  if (slug) safeRevalidate(`/answers/${slug}`);
  if (previousSlug && previousSlug !== slug) safeRevalidate(`/answers/${previousSlug}`);
  safeRevalidate("/sitemap.xml");
  safeRevalidate("/answers/rss.xml");
}

/**
 * Media changes (new crop, focal point, alt text) can alter every page that
 * renders the image. Revalidating both indexes is cheap for a site this size
 * and guarantees the change is picked up without republishing documents.
 */
export function revalidateMediaPaths() {
  safeRevalidate("/blog");
  safeRevalidate("/answers");
}
