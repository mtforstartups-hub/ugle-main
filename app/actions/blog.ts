"use server";

import { getPostsPage, DEFAULT_POSTS_PER_PAGE } from "@/lib/payload/queries";
import { mapPostToListItem } from "@/lib/payload/blog-list";

export async function loadMorePosts({
  page,
  category,
}: {
  page: number;
  category?: string;
}) {
  const result = await getPostsPage({
    page,
    limit: DEFAULT_POSTS_PER_PAGE,
    categorySlug: category,
    // Mirrors the page: featured posts live in the band, not the feed.
    excludeFeatured: !category,
  });

  return {
    items: result.docs.map(mapPostToListItem),
    page: result.page ?? page,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
  };
}
