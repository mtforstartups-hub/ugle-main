import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath }));

import {
  revalidateAnswersPaths,
  revalidateBlogPaths,
  revalidateMediaPaths,
} from "../revalidate";

describe("revalidation helpers", () => {
  beforeEach(() => {
    revalidatePath.mockReset();
  });

  it("revalidates the blog index, the post, sitemap and RSS", async () => {
    await revalidateBlogPaths("hello-world");

    expect(revalidatePath.mock.calls.map(([path]) => path)).toEqual([
      "/blog",
      "/blog/hello-world",
      "/sitemap.xml",
      "/blog/rss.xml",
    ]);
  });

  it("also refreshes the previous slug when it changed", async () => {
    await revalidateBlogPaths("new-slug", "old-slug");

    expect(revalidatePath).toHaveBeenCalledWith("/blog/new-slug");
    expect(revalidatePath).toHaveBeenCalledWith("/blog/old-slug");
  });

  it("does not revalidate the same slug twice", async () => {
    await revalidateBlogPaths("same", "same");

    expect(
      revalidatePath.mock.calls.filter(([path]) => path === "/blog/same")
    ).toHaveLength(1);
  });

  it("revalidates answer paths", async () => {
    await revalidateAnswersPaths("is-my-data-private");

    expect(revalidatePath.mock.calls.map(([path]) => path)).toEqual([
      "/answers",
      "/answers/is-my-data-private",
      "/sitemap.xml",
      "/answers/rss.xml",
    ]);
  });

  it("revalidates both indexes when media changes", () => {
    revalidateMediaPaths();

    expect(revalidatePath.mock.calls.map(([path]) => path)).toEqual([
      "/blog",
      "/answers",
    ]);
  });

  it("swallows the missing static-generation-store error outside a request", async () => {
    revalidatePath.mockImplementation(() => {
      throw new Error("Invariant: static generation store missing in revalidatePath");
    });

    await expect(revalidateBlogPaths("hello")).resolves.toBeUndefined();
  });

  it("rethrows unrelated errors", async () => {
    revalidatePath.mockImplementation(() => {
      throw new Error("boom");
    });

    await expect(revalidateBlogPaths("hello")).rejects.toThrow("boom");
  });
});
