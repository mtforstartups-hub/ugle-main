import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { getPayloadClient } from "@/lib/payload/getPayload";
import { uniqueSuffix } from "./helpers";

// Larger than every configured image size so Payload generates all of them
// (upscaling is disabled by default).
const createPng = () =>
  sharp({
    create: {
      width: 1600,
      height: 900,
      channels: 3,
      background: { r: 117, g: 192, b: 67 },
    },
  })
    .png()
    .toBuffer();

/**
 * With `BLOB_READ_WRITE_TOKEN` unset (see tests/integration/setup.ts) Payload
 * uses the local disk adapter. That is the same code path CI and local dev
 * use; the Vercel Blob branch only runs in production.
 */
describe("media uploads", () => {
  let payload: Awaited<ReturnType<typeof getPayloadClient>>;
  let mediaId: number | undefined;

  beforeAll(async () => {
    payload = await getPayloadClient();
  });

  afterAll(async () => {
    if (mediaId) {
      await payload.delete({
        collection: "media",
        id: mediaId,
        trash: false,
        overrideAccess: true,
      });
    }
  });

  it("stores the file, its size and the generated image sizes", async () => {
    const png = await createPng();

    const media = await payload.create({
      collection: "media",
      overrideAccess: true,
      data: { alt: "Upload integration image" },
      file: {
        data: png,
        mimetype: "image/png",
        name: `upload-${uniqueSuffix()}.png`,
        size: png.length,
      },
    });

    mediaId = media.id;

    expect(media.url).toBeTruthy();
    expect(media.filename).toMatch(/\.png$/);
    expect(media.filesize).toBe(png.length);
    expect(media.mimeType).toBe("image/png");

    for (const size of ["thumbnail", "card", "hero", "og"] as const) {
      expect(media.sizes?.[size]?.url).toBeTruthy();
    }

    const storedFile = path.join(process.cwd(), "media", media.filename as string);
    expect(fs.existsSync(storedFile)).toBe(true);
  });

  it("removes the file when the document is deleted", async () => {
    expect(mediaId).toBeTypeOf("number");

    const media = await payload.findByID({
      collection: "media",
      id: mediaId as number,
      overrideAccess: true,
    });
    const storedFile = path.join(process.cwd(), "media", media.filename as string);

    await payload.delete({
      collection: "media",
      id: mediaId as number,
      trash: false,
      overrideAccess: true,
    });
    mediaId = undefined;

    expect(fs.existsSync(storedFile)).toBe(false);
  });
});
