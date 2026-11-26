import { describe, expect, it } from "vitest";
import type { Media } from "@/payload-types";

import {
  mediaAlt,
  mediaDimensions,
  mediaUrl,
  resolveMedia,
} from "../media";

const media = {
  id: 1,
  alt: "A hero",
  url: "https://cdn.example.com/hero.jpg",
  width: 1600,
  height: 900,
  sizes: {
    thumbnail: {
      url: "https://cdn.example.com/thumb.jpg",
      width: 480,
      height: 270,
    },
    hero: {
      url: "https://cdn.example.com/hero-size.jpg",
      width: 1600,
      height: 900,
    },
  },
} as unknown as Media;

describe("media helpers", () => {
  describe("resolveMedia", () => {
    it("returns populated media", () => {
      expect(resolveMedia(media)).toBe(media);
    });

    it("rejects raw IDs, null and undefined", () => {
      expect(resolveMedia(1)).toBeNull();
      expect(resolveMedia(null)).toBeNull();
      expect(resolveMedia(undefined)).toBeNull();
    });
  });

  describe("mediaUrl", () => {
    it("prefers the requested size", () => {
      expect(mediaUrl(media, "thumbnail")).toBe("https://cdn.example.com/thumb.jpg");
      expect(mediaUrl(media, "hero")).toBe("https://cdn.example.com/hero-size.jpg");
    });

    it("falls back to the original file", () => {
      expect(mediaUrl(media, "og")).toBe("https://cdn.example.com/hero.jpg");
      expect(mediaUrl(media)).toBe("https://cdn.example.com/hero.jpg");
    });

    it("returns null without media", () => {
      expect(mediaUrl(null)).toBeNull();
    });
  });

  describe("mediaAlt", () => {
    it("uses the alt text and falls back when empty", () => {
      expect(mediaAlt(media)).toBe("A hero");
      expect(mediaAlt(media, "Fallback")).toBe("A hero");
      expect(mediaAlt({ ...media, alt: "" } as Media, "Fallback")).toBe("Fallback");
    });
  });

  describe("mediaDimensions", () => {
    it("uses the size dimensions when present", () => {
      expect(mediaDimensions(media, "thumbnail")).toEqual({ width: 480, height: 270 });
    });

    it("falls back to the original dimensions", () => {
      expect(mediaDimensions(media, "og")).toEqual({ width: 1600, height: 900 });
    });

    it("defaults to 16:9 when nothing is known", () => {
      expect(mediaDimensions(null)).toEqual({ width: 1600, height: 900 });
    });
  });
});
