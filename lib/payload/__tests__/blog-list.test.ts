import { describe, expect, it } from "vitest";

import { mapPostToListItem } from "../blog-list";
import type { Post } from "@/payload-types";

const basePost = {
  id: 1,
  title: "Why local-first",
  slug: "why-local-first",
  excerpt: "A short summary.",
  readingTime: 4,
} as unknown as Post;

describe("mapPostToListItem", () => {
  it("maps populated relations into card data", () => {
    const post = {
      ...basePost,
      heroImage: {
        id: 10,
        url: "https://cdn.example.com/hero.jpg",
        alt: "Hero",
      },
      category: { id: 2, name: "Product" },
    } as unknown as Post;

    expect(mapPostToListItem(post)).toEqual({
      path: "/blog/why-local-first",
      slug: "why-local-first",
      title: "Why local-first",
      desc: "A short summary.",
      meta: "4 min read",
      tag: "Product",
      image: "https://cdn.example.com/hero.jpg",
    });
  });

  it("falls back when relations are raw IDs", () => {
    const post = {
      ...basePost,
      heroImage: 10,
      category: 2,
    } as unknown as Post;

    const item = mapPostToListItem(post);

    expect(item.tag).toBe("Blog");
    expect(item.image).toBe("");
  });

  it("defaults reading time to one minute", () => {
    const post = { ...basePost, readingTime: null } as unknown as Post;
    expect(mapPostToListItem(post).meta).toBe("1 min read");
  });
});
