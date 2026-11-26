import { describe, expect, it } from "vitest";

import { sanitizeFilename } from "../filename";

describe("sanitizeFilename", () => {
  it("replaces spaces so blob uploads keep matching their signed token", () => {
    expect(sanitizeFilename("Prod Hun Ugle.png")).toBe("prod-hun-ugle.png");
  });

  it("derives an extension from the MIME type when the name has none", () => {
    expect(sanitizeFilename("Prod Hun Ugle", "image/png")).toBe(
      "prod-hun-ugle.png"
    );
  });

  it("leaves already-safe names untouched", () => {
    expect(sanitizeFilename("ugle-hero_2026.webp")).toBe("ugle-hero_2026.webp");
  });

  it("is idempotent", () => {
    const once = sanitizeFilename("My Photo (1).JPG");
    expect(sanitizeFilename(once)).toBe(once);
  });

  it("lower-cases names and extensions", () => {
    expect(sanitizeFilename("UGLE-Hero.PNG")).toBe("ugle-hero.png");
  });

  it("strips accents and punctuation", () => {
    expect(sanitizeFilename("Café — menu (final).jpeg")).toBe(
      "cafe-menu-final.jpeg"
    );
  });

  it("collapses runs of separators", () => {
    expect(sanitizeFilename("a   ---   b.png")).toBe("a-b.png");
  });

  it("keeps the last extension of a dotted name", () => {
    expect(sanitizeFilename("archive.photo.tar.gz")).toBe(
      "archive.photo.tar.gz"
    );
  });

  it("falls back to a generic name when nothing usable is left", () => {
    expect(sanitizeFilename("日本語.png")).toBe("image.png");
    expect(sanitizeFilename("   ")).toBe("image");
  });

  it("drops directory components", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("C:\\temp\\Photo One.png")).toBe("photo-one.png");
  });

  it("ignores unknown MIME types", () => {
    expect(sanitizeFilename("no-extension", "application/octet-stream")).toBe(
      "no-extension"
    );
  });
});
