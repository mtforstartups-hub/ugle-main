import { describe, expect, it } from "vitest";

import {
  absoluteUrl,
  canonicalFor,
  pageMetadata,
  serializeJsonLd,
  SITE_URL,
} from "@/app/lib/seo";

describe("seo helpers", () => {
  describe("absoluteUrl", () => {
    it("prefixes site-relative paths", () => {
      expect(absoluteUrl("/blog/hello")).toBe(`${SITE_URL}/blog/hello`);
      expect(absoluteUrl("/")).toBe(SITE_URL);
    });

    it("leaves already-absolute URLs untouched", () => {
      expect(absoluteUrl("https://blob.vercel-storage.com/a.png")).toBe(
        "https://blob.vercel-storage.com/a.png"
      );
      expect(absoluteUrl("http://localhost:3000/api/media/file/a.png")).toBe(
        "http://localhost:3000/api/media/file/a.png"
      );
    });
  });

  describe("canonicalFor", () => {
    it("normalises trailing slashes", () => {
      expect(canonicalFor("/blog/")).toEqual({ canonical: "/blog" });
      expect(canonicalFor("/blog")).toEqual({ canonical: "/blog" });
    });

    it("keeps the root canonical", () => {
      expect(canonicalFor("/")).toEqual({ canonical: "/" });
    });
  });

  describe("pageMetadata", () => {
    it("emits canonical, Open Graph and Twitter metadata", () => {
      const meta = pageMetadata({
        title: "Blog",
        description: "Latest posts",
        path: "/blog",
      });

      expect(meta.title).toBe("Blog");
      expect(meta.description).toBe("Latest posts");
      expect(meta.alternates).toEqual({ canonical: "/blog" });
      expect(meta.openGraph).toMatchObject({
        type: "website",
        siteName: "Ugle",
        url: "/blog",
        title: "Blog",
        description: "Latest posts",
      });
      expect(meta.twitter).toMatchObject({
        card: "summary_large_image",
        title: "Blog",
        description: "Latest posts",
      });
    });

    it("uses article type and the supplied social image", () => {
      const meta = pageMetadata({
        title: "Post",
        description: "A post",
        path: "/blog/post",
        ogType: "article",
        socialImage: {
          url: "https://cdn.example.com/og.jpg",
          alt: "Post cover",
          width: 1200,
          height: 630,
        },
      });

      expect(meta.openGraph).toMatchObject({
        type: "article",
        images: [
          {
            url: "https://cdn.example.com/og.jpg",
            alt: "Post cover",
            width: 1200,
            height: 630,
          },
        ],
      });
      expect(meta.twitter).toMatchObject({
        images: ["https://cdn.example.com/og.jpg"],
      });
    });
  });

  describe("serializeJsonLd", () => {
    it("escapes angle brackets to keep script tags closed", () => {
      const serialized = serializeJsonLd({ value: "</script><script>alert(1)" });
      expect(serialized).not.toContain("</script>");
      expect(serialized).toContain("\\u003c");
    });
  });
});
