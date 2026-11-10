"use server";

import { getPostsPage } from "@/lib/payload/queries";
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
    categorySlug: category,
  });

  return {
    items: result.docs.map(mapPostToListItem),
    page: result.page ?? page,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
  };
}
