import type { Payload } from "payload";

import type { Author, Category, Media, Post } from "@/payload-types";
import { getPayloadClient } from "@/lib/payload/getPayload";

type TrackedCollection =
  | "answers"
  | "authors"
  | "categories"
  | "media"
  | "posts"
  | "users";

interface TrackedDoc {
  collection: TrackedCollection;
  id: number;
}

export interface TestFixtures {
  payload: Payload;
  category: Category;
  author: Author;
  media: Media;
  /** Register a document so it is permanently removed after the test file. */
  track: (collection: TrackedCollection, id: number) => void;
  cleanup: () => Promise<void>;
}

// Smallest valid PNG (1x1). Sharp upscales it into the configured image sizes.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export const uniqueSuffix = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Minimal valid Lexical document accepted by the `richText` fields. */
export function richText(text: string): Post["content"] {
  return {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          version: 1,
          children: [{ type: "text", text, version: 1 }],
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      version: 1,
    },
  } as Post["content"];
}

export async function createFixtures(): Promise<TestFixtures> {
  const payload = await getPayloadClient();
  const suffix = uniqueSuffix();
  const tracked: TrackedDoc[] = [];

  const track = (collection: TrackedCollection, id: number) => {
    tracked.push({ collection, id });
  };

  const category = await payload.create({
    collection: "categories",
    data: {
      name: `Integration ${suffix}`,
      slug: `integration-${suffix}`,
      description: "Created by the integration test suite.",
    },
    overrideAccess: true,
  });
  track("categories", category.id);

  const author = await payload.create({
    collection: "authors",
    data: {
      name: `Integration Author ${suffix}`,
      slug: `integration-author-${suffix}`,
    },
    overrideAccess: true,
  });
  track("authors", author.id);

  const media = await payload.create({
    collection: "media",
    data: { alt: "Integration test image" },
    file: {
      data: PNG_1X1,
      mimetype: "image/png",
      name: `integration-${suffix}.png`,
      size: PNG_1X1.length,
    },
    overrideAccess: true,
  });
  track("media", media.id);

  const cleanup = async () => {
    // Reverse order so dependent documents go before their relations.
    for (const doc of tracked.reverse()) {
      try {
        await payload.delete({
          collection: doc.collection,
          id: doc.id,
          trash: false,
          overrideAccess: true,
        });
      } catch {
        // Best effort: a failed cleanup must not hide the real test result.
      }
    }
  };

  return { payload, category, author, media, track, cleanup };
}
