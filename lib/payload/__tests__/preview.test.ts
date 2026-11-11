import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  previewSecretPath,
  previewSecretUrl,
  previewUrl,
} from "../preview";

describe("preview helpers", () => {
  const originalSecret = process.env.PREVIEW_SECRET;
  const originalServer = process.env.NEXT_PUBLIC_SERVER_URL;

  beforeEach(() => {
    process.env.PREVIEW_SECRET = "test-preview-secret";
    process.env.NEXT_PUBLIC_SERVER_URL = "https://ugle.ai";
  });

  afterEach(() => {
    process.env.PREVIEW_SECRET = originalSecret;
    process.env.NEXT_PUBLIC_SERVER_URL = originalServer;
  });

  describe("previewUrl", () => {
    it("builds public paths per collection", () => {
      expect(previewUrl("posts", "hello-world")).toBe("/blog/hello-world");
      expect(previewUrl("answers", "does-ugle-upload-audio")).toBe(
        "/answers/does-ugle-upload-audio"
      );
    });

    it("falls back to the home page without a slug", () => {
      expect(previewUrl("posts")).toBe("/");
      expect(previewUrl("answers", null)).toBe("/");
    });
  });

  describe("previewSecretPath", () => {
    it("encodes the collection, slug, secret and redirect path", () => {
      const path = previewSecretPath("posts", "hello world");

      expect(path.startsWith("/api/preview?")).toBe(true);

      const params = new URLSearchParams(path.split("?")[1]);
      expect(params.get("collection")).toBe("posts");
      expect(params.get("slug")).toBe("hello world");
      expect(params.get("secret")).toBe("test-preview-secret");
      expect(params.get("path")).toBe("/blog/hello world");
    });

    it("keeps the route relative so preview works on any deployment origin", () => {
      expect(previewSecretPath("answers", "q")).not.toContain("https://");
    });
  });

  describe("previewSecretUrl", () => {
    it("prefixes the configured server URL", () => {
      expect(previewSecretUrl("posts", "hello-world")).toBe(
        "https://ugle.ai/api/preview?collection=posts&slug=hello-world&secret=test-preview-secret&path=%2Fblog%2Fhello-world"
      );
    });
  });
});
