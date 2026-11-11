import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Answer, Post } from "@/payload-types";

const mocks = vi.hoisted(() => ({
  draftMode: vi.fn(),
  find: vi.fn(),
  findGlobal: vi.fn(),
}));

vi.mock("next/headers", () => ({ draftMode: mocks.draftMode }));
vi.mock("../getPayload", () => ({
  getPayloadClient: vi.fn(async () => ({
    find: mocks.find,
    findGlobal: mocks.findGlobal,
  })),
}));

import {
  getAnswerBySlug,
  getAnswersPage,
  getPostBySlug,
  getPostsPage,
  getRelatedPosts,
} from "../queries";

const post = (id: number, overrides: Partial<Post> = {}) =>
  ({ id, slug: `post-${id}`, title: `Post ${id}`, ...overrides }) as unknown as Post;

describe("payload queries", () => {
  beforeEach(() => {
    mocks.draftMode.mockResolvedValue({ isEnabled: false });
    mocks.find.mockReset();
    mocks.findGlobal.mockReset();
    mocks.find.mockResolvedValue({ docs: [], totalPages: 0 });
  });

  describe("getRelatedPosts", () => {
    it("returns nothing when the editor selected no related posts", async () => {
      await expect(getRelatedPosts(post(1, { relatedPosts: [] }))).resolves.toEqual([]);
      expect(mocks.find).not.toHaveBeenCalled();
    });

    it("keeps the editor's order for populated relations", async () => {
      const first = post(2);
      const second = post(3);
      const source = post(1, { relatedPosts: [second, first] });

      await expect(getRelatedPosts(source)).resolves.toEqual([second, first]);
      expect(mocks.find).not.toHaveBeenCalled();
    });

    it("resolves raw IDs and preserves the selected order", async () => {
      mocks.find.mockResolvedValue({ docs: [post(3), post(2)] });
      const source = post(1, { relatedPosts: [2, 3] });

      const result = await getRelatedPosts(source);

      expect(mocks.find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: "posts",
          where: { id: { in: [2, 3] } },
          depth: 1,
          pagination: false,
        })
      );
      expect(result.map((item) => item.id)).toEqual([2, 3]);
    });

    it("drops IDs that no longer resolve", async () => {
      mocks.find.mockResolvedValue({ docs: [post(2)] });
      const source = post(1, { relatedPosts: [2, 999] });

      const result = await getRelatedPosts(source);

      expect(result.map((item) => item.id)).toEqual([2]);
    });

    it("honours the limit", async () => {
      const source = post(1, { relatedPosts: [post(2), post(3), post(4), post(5)] });
      const result = await getRelatedPosts(source, 2);
      expect(result).toHaveLength(2);
    });
  });

  describe("getPostsPage", () => {
    it("filters to published posts for anonymous visitors", async () => {
      await getPostsPage({ page: 2, limit: 5 });

      expect(mocks.find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: "posts",
          where: { _status: { equals: "published" } },
          page: 2,
          limit: 5,
          draft: false,
          overrideAccess: false,
        })
      );
    });

    it("drops the status filter and enables draft access in preview", async () => {
      mocks.draftMode.mockResolvedValue({ isEnabled: true });

      await getPostsPage({});

      expect(mocks.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          draft: true,
          overrideAccess: true,
        })
      );
    });

    it("filters by category slug", async () => {
      await getPostsPage({ categorySlug: "product" });

      expect(mocks.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            _status: { equals: "published" },
            "category.slug": { equals: "product" },
          },
        })
      );
    });
  });

  describe("getPostBySlug", () => {
    it("requires a published post outside preview", async () => {
      mocks.find.mockResolvedValue({ docs: [post(1)] });

      await getPostBySlug("hello");

      expect(mocks.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            slug: { equals: "hello" },
            _status: { equals: "published" },
          },
          depth: 3,
          draft: false,
          overrideAccess: false,
        })
      );
    });

    it("returns null when the slug is not found", async () => {
      mocks.find.mockResolvedValue({ docs: [] });
      await expect(getPostBySlug("missing")).resolves.toBeNull();
    });
  });

  describe("getAnswersPage", () => {
    it("composes answer filters", async () => {
      await getAnswersPage({
        categorySlug: "privacy",
        productArea: "search",
        excludeFeatured: true,
      });

      expect(mocks.find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: "answers",
          sort: "order",
          where: {
            _status: { equals: "published" },
            "category.slug": { equals: "privacy" },
            productArea: { equals: "search" },
            featured: { not_equals: true },
          },
        })
      );
    });
  });

  describe("getAnswerBySlug", () => {
    it("returns the published answer", async () => {
      const answer = { id: 1, slug: "q" } as unknown as Answer;
      mocks.find.mockResolvedValue({ docs: [answer] });

      await expect(getAnswerBySlug("q")).resolves.toBe(answer);
    });
  });
});
