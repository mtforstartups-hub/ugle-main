import { draftMode } from "next/headers";
import type { Where } from "payload";
import { cache } from "react";

import type { Answer, BlogSetting, Media, Post } from "@/payload-types";
import { getPayloadClient } from "./getPayload";

async function isDraftMode(): Promise<boolean> {
  const dm = await draftMode();
  return Boolean(dm.isEnabled);
}

export const DEFAULT_POSTS_PER_PAGE = 5;
export const DEFAULT_ANSWERS_PER_PAGE = 10;

// `cache` dedupes within a single request: pages call these from both
// `generateMetadata` and the page component, which would otherwise hit the
// database twice for the same document.
export const getBlogSettings = cache(async (): Promise<BlogSetting | null> => {
  const payload = await getPayloadClient();
  try {
    return await payload.findGlobal({ slug: "blog-settings", depth: 1 });
  } catch {
    return null;
  }
});

export const getAnswersSettings = cache(async () => {
  const payload = await getPayloadClient();
  try {
    return await payload.findGlobal({ slug: "answers-settings", depth: 1 });
  } catch {
    return null;
  }
});

export async function getPostsPage({
  page = 1,
  limit = DEFAULT_POSTS_PER_PAGE,
  categorySlug,
}: {
  page?: number;
  limit?: number;
  categorySlug?: string;
}) {
  const payload = await getPayloadClient();
  const draft = await isDraftMode();

  const where: Where = {};
  if (!draft) where._status = { equals: "published" };
  if (categorySlug) where["category.slug"] = { equals: categorySlug };

  return payload.find({
    collection: "posts",
    where,
    sort: "-publishedAt",
    limit,
    page,
    depth: 2,
    draft,
    overrideAccess: draft,
  });
}

export async function getAllPostSlugs() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: { _status: { equals: "published" } },
    limit: 1000,
    depth: 0,
    pagination: false,
  });
  return result.docs.map((post) => post.slug).filter(Boolean) as string[];
}

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const payload = await getPayloadClient();
  const draft = await isDraftMode();

  const result = await payload.find({
    collection: "posts",
    where: draft
      ? { slug: { equals: slug } }
      : { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
    depth: 3,
    draft,
    overrideAccess: draft,
  });

  return (result.docs[0] as Post | undefined) ?? null;
});

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const selected = Array.isArray(post.relatedPosts) ? post.relatedPosts.slice(0, limit) : [];

  // Related posts are editor-curated. If nothing was selected there is no
  // section to render; never fall back to automatic suggestions.
  if (selected.length === 0) return [];

  const populated = selected.filter((item): item is Post => typeof item === "object");
  if (populated.length === selected.length) return populated;

  // Older rows (or shallow queries) can still hold raw IDs. Resolve those and
  // keep the order the editor picked.
  const ids = selected.filter((item): item is number => typeof item === "number");
  if (ids.length === 0) return populated;

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: { id: { in: ids } },
    limit: ids.length,
    depth: 1,
    pagination: false,
  });

  const byId = new Map(result.docs.map((doc) => [doc.id, doc]));
  return selected
    .map((item) => (typeof item === "object" ? item : byId.get(item)))
    .filter((item): item is Post => Boolean(item));
}

export async function getAnswersPage({
  page = 1,
  limit = DEFAULT_ANSWERS_PER_PAGE,
  categorySlug,
  productArea,
  excludeFeatured,
}: {
  page?: number;
  limit?: number;
  categorySlug?: string;
  productArea?: string;
  excludeFeatured?: boolean;
}) {
  const payload = await getPayloadClient();
  const draft = await isDraftMode();

  const where: Where = {};
  if (!draft) where._status = { equals: "published" };
  if (categorySlug) where["category.slug"] = { equals: categorySlug };
  if (productArea) where.productArea = { equals: productArea };
  if (excludeFeatured) where.featured = { not_equals: true };

  return payload.find({
    collection: "answers",
    where,
    sort: "order",
    limit,
    page,
    depth: 2,
    draft,
    overrideAccess: draft,
  });
}

export async function getFeaturedAnswers(limit = 4) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "answers",
    where: { _status: { equals: "published" }, featured: { equals: true } },
    sort: "order",
    limit,
    depth: 1,
  });
  return result.docs as Answer[];
}

export async function getAnswerCategories() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "categories",
    where: { usedFor: { in: ["answers"] } },
    sort: "name",
    limit: 100,
    depth: 0,
  });
  return result.docs;
}

export async function getRelatedPostsForAnswer(answer: Answer, limit = 3) {
  const manual = Array.isArray(answer.relatedPosts)
    ? answer.relatedPosts.filter((item): item is Post => typeof item === "object")
    : [];

  if (manual.length >= limit) return manual.slice(0, limit);

  const payload = await getPayloadClient();
  const categoryId =
    answer.category && typeof answer.category === "object" ? answer.category.id : answer.category;

  const result = await payload.find({
    collection: "posts",
    where: {
      _status: { equals: "published" },
      ...(categoryId ? { category: { equals: categoryId } } : {}),
    },
    sort: "-publishedAt",
    limit: limit - manual.length,
    depth: 1,
  });

  return [...manual, ...result.docs].slice(0, limit);
}

export async function getAllAnswerSlugs() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "answers",
    where: { _status: { equals: "published" } },
    limit: 1000,
    depth: 0,
    pagination: false,
  });
  return result.docs.map((answer) => answer.slug).filter(Boolean) as string[];
}

export const getAnswerBySlug = cache(async (slug: string): Promise<Answer | null> => {
  const payload = await getPayloadClient();
  const draft = await isDraftMode();

  const result = await payload.find({
    collection: "answers",
    where: draft
      ? { slug: { equals: slug } }
      : { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
    depth: 3,
    draft,
    overrideAccess: draft,
  });

  return (result.docs[0] as Answer | undefined) ?? null;
});

export async function getRelatedAnswers(answer: Answer, limit = 3) {
  const payload = await getPayloadClient();
  const manual = Array.isArray(answer.relatedAnswers)
    ? answer.relatedAnswers.filter((item): item is Answer => typeof item === "object")
    : [];

  if (manual.length >= limit) return manual.slice(0, limit);

  const excludeIds = [answer.id, ...manual.map((item) => item.id)];
  const remaining = limit - manual.length;

  const categoryId =
    answer.category && typeof answer.category === "object" ? answer.category.id : answer.category;

  // Same fallback as getRelatedPosts: prefer the category, then fill with
  // recent published answers so new entries always surface related content.
  const sameCategory = categoryId
    ? await payload.find({
        collection: "answers",
        where: {
          _status: { equals: "published" },
          id: { not_in: excludeIds },
          category: { equals: categoryId },
        },
        sort: "order",
        limit: remaining,
        depth: 1,
      })
    : null;

  const collected = sameCategory?.docs ?? [];

  if (collected.length < remaining) {
    const fallback = await payload.find({
      collection: "answers",
      where: {
        _status: { equals: "published" },
        id: { not_in: [...excludeIds, ...collected.map((item) => item.id)] },
      },
      sort: "order",
      limit: remaining - collected.length,
      depth: 1,
    });
    collected.push(...fallback.docs);
  }

  return [...manual, ...collected].slice(0, limit);
}

export function mediaFrom(value: Media | number | null | undefined): Media | null {
  return value && typeof value === "object" ? value : null;
}
