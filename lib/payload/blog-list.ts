import type { Post } from "@/payload-types";

export interface BlogListItem {
  path: string;
  slug: string;
  title: string;
  desc: string;
  meta: string;
  tag: string;
  image: string;
}

/** Shape a CMS post into the card data used by the blog listing. */
export function mapPostToListItem(post: Post): BlogListItem {
  const heroMedia =
    post.heroImage && typeof post.heroImage === "object" ? post.heroImage : null;

  return {
    path: `/blog/${post.slug}`,
    slug: post.slug,
    title: post.title,
    desc: post.excerpt,
    meta: `${post.readingTime ?? 1} min read`,
    tag:
      post.category && typeof post.category === "object"
        ? post.category.name
        : "Blog",
    image: heroMedia?.url ?? "",
  };
}
