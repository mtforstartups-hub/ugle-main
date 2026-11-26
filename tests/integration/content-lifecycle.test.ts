import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * These tests drive the real Payload Local API against the test Postgres.
 * `next/cache` and `next/headers` are mocked so Payload hooks and the query
 * helpers can run outside a Next.js request.
 */
const revalidatePath = vi.hoisted(() => vi.fn());
const draftState = vi.hoisted(() => ({ enabled: false }));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/headers", () => ({
  draftMode: async () => ({
    isEnabled: draftState.enabled,
    enable: () => {
      draftState.enabled = true;
    },
    disable: () => {
      draftState.enabled = false;
    },
  }),
}));

import { getAnswerBySlug, getPostBySlug, getPostsPage } from "@/lib/payload/queries";
import {
  createFixtures,
  richText,
  uniqueSuffix,
  type TestFixtures,
} from "./helpers";

describe("content lifecycle", () => {
  let fixtures: TestFixtures;

  beforeAll(async () => {
    fixtures = await createFixtures();
  });

  afterAll(async () => {
    await fixtures.cleanup();
  });

  beforeEach(() => {
    draftState.enabled = false;
  });

  describe("posts", () => {
    const slug = `lifecycle-post-${uniqueSuffix()}`;
    let postId: number;

    it("creates a draft that public queries cannot see", async () => {
      const post = await fixtures.payload.create({
        collection: "posts",
        draft: true,
        overrideAccess: true,
        data: {
          title: "Integration Draft",
          slug,
          excerpt: "A draft used by the integration tests.",
          heroImage: fixtures.media.id,
          content: richText("Draft body"),
          category: fixtures.category.id,
          author: fixtures.author.id,
        },
      });

      postId = post.id;
      fixtures.track("posts", post.id);

      expect(post._status).toBe("draft");
      await expect(getPostBySlug(slug)).resolves.toBeNull();

      const page = await getPostsPage({ limit: 100 });
      expect(page.docs.map((doc) => doc.slug)).not.toContain(slug);
    });

    it("exposes the draft in preview mode only", async () => {
      draftState.enabled = true;

      const preview = await getPostBySlug(slug);

      expect(preview?.id).toBe(postId);
    });

    it("publishes and revalidates the public blog paths", async () => {
      revalidatePath.mockClear();

      await fixtures.payload.update({
        collection: "posts",
        id: postId,
        draft: false,
        overrideAccess: true,
        data: { _status: "published" },
      });

      const post = await getPostBySlug(slug);
      expect(post?.id).toBe(postId);
      expect(post?._status).toBe("published");

      const paths = revalidatePath.mock.calls.map(([path]) => path);
      expect(paths).toContain("/blog");
      expect(paths).toContain(`/blog/${slug}`);
      expect(paths).toContain("/sitemap.xml");
    });

    it("rejects a second document with the same slug", async () => {
      await expect(
        fixtures.payload.create({
          collection: "posts",
          draft: true,
          overrideAccess: true,
          data: {
            title: "Duplicate Slug",
            slug,
            excerpt: "Should never be persisted.",
            heroImage: fixtures.media.id,
            content: richText("Duplicate"),
            category: fixtures.category.id,
            author: fixtures.author.id,
          },
        }),
      ).rejects.toThrow(/slug/i);
    });

    it("removes an unpublished post from public queries", async () => {
      await fixtures.payload.update({
        collection: "posts",
        id: postId,
        draft: false,
        overrideAccess: true,
        data: { _status: "draft" },
      });

      await expect(getPostBySlug(slug)).resolves.toBeNull();

      const page = await getPostsPage({ limit: 100 });
      expect(page.docs.map((doc) => doc.slug)).not.toContain(slug);

      draftState.enabled = true;
      await expect(getPostBySlug(slug)).resolves.toMatchObject({ id: postId });
    });

    it("permanently deletes the post", async () => {
      await fixtures.payload.delete({
        collection: "posts",
        id: postId,
        trash: false,
        overrideAccess: true,
      });

      await expect(getPostBySlug(slug)).resolves.toBeNull();
    });
  });

  describe("answers", () => {
    const slug = `lifecycle-answer-${uniqueSuffix()}`;
    let answerId: number;

    it("keeps a draft answer out of public queries", async () => {
      const answer = await fixtures.payload.create({
        collection: "answers",
        draft: true,
        overrideAccess: true,
        data: {
          question: "Is this answer a draft?",
          slug,
          shortAnswer: "Yes, until it is published.",
          answer: richText("Draft answer body"),
          category: fixtures.category.id,
          publishedAt: new Date().toISOString(),
        },
      });

      answerId = answer.id;
      fixtures.track("answers", answer.id);

      await expect(getAnswerBySlug(slug)).resolves.toBeNull();
    });

    it("returns the answer after publishing", async () => {
      await fixtures.payload.update({
        collection: "answers",
        id: answerId,
        draft: false,
        overrideAccess: true,
        data: { _status: "published" },
      });

      await expect(getAnswerBySlug(slug)).resolves.toMatchObject({ id: answerId });
    });

    it("hides the answer after unpublishing", async () => {
      await fixtures.payload.update({
        collection: "answers",
        id: answerId,
        draft: false,
        overrideAccess: true,
        data: { _status: "draft" },
      });

      await expect(getAnswerBySlug(slug)).resolves.toBeNull();
    });
  });
});
