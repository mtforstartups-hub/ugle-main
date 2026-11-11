import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { User } from "@/payload-types";

const draftState = vi.hoisted(() => ({ enabled: false }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
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

import {
  createFixtures,
  richText,
  uniqueSuffix,
  type TestFixtures,
} from "./helpers";

describe("role restrictions", () => {
  let fixtures: TestFixtures;
  let admin: User;
  let editor: User;
  let otherEditor: User;
  const suffix = uniqueSuffix();

  beforeAll(async () => {
    fixtures = await createFixtures();

    admin = await fixtures.payload.create({
      collection: "users",
      overrideAccess: true,
      data: {
        email: `admin-${suffix}@ugle.test`,
        password: "Integration123!",
        name: "Integration Admin",
        role: "admin",
      },
    });

    editor = await fixtures.payload.create({
      collection: "users",
      overrideAccess: true,
      data: {
        email: `editor-${suffix}@ugle.test`,
        password: "Integration123!",
        name: "Integration Editor",
        role: "editor",
      },
    });

    otherEditor = await fixtures.payload.create({
      collection: "users",
      overrideAccess: true,
      data: {
        email: `other-editor-${suffix}@ugle.test`,
        password: "Integration123!",
        name: "Other Editor",
        role: "editor",
      },
    });
  });

  afterAll(async () => {
    for (const user of [otherEditor, editor, admin]) {
      try {
        await fixtures.payload.delete({
          collection: "users",
          id: user.id,
          overrideAccess: true,
        });
      } catch {
        // best effort
      }
    }
    await fixtures.cleanup();
  });

  it("rejects anonymous content creation", async () => {
    await expect(
      fixtures.payload.create({
        collection: "posts",
        overrideAccess: false,
        draft: true,
        data: {
          title: "Anonymous post",
          excerpt: "Should not be created.",
          heroImage: fixtures.media.id,
          content: richText("Anonymous"),
          category: fixtures.category.id,
          author: fixtures.author.id,
        },
      }),
    ).rejects.toThrow();
  });

  it("lets an editor create content", async () => {
    const post = await fixtures.payload.create({
      collection: "posts",
      overrideAccess: false,
      user: editor,
      draft: true,
      data: {
        title: "Editor post",
        slug: `editor-post-${suffix}`,
        excerpt: "Created by an editor.",
        heroImage: fixtures.media.id,
        content: richText("Editor content"),
        category: fixtures.category.id,
        author: fixtures.author.id,
      },
    });

    fixtures.track("posts", post.id);
    expect(post.id).toBeTypeOf("number");
  });

  it("stops editors from managing users", async () => {
    await expect(
      fixtures.payload.create({
        collection: "users",
        overrideAccess: false,
        user: editor,
        data: {
          email: `intruder-${suffix}@ugle.test`,
          password: "Integration123!",
          name: "Intruder",
          role: "admin",
        },
      }),
    ).rejects.toThrow();

    await expect(
      fixtures.payload.delete({
        collection: "users",
        id: admin.id,
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow();
  });

  it("only lets editors update their own profile", async () => {
    await expect(
      fixtures.payload.update({
        collection: "users",
        id: editor.id,
        overrideAccess: false,
        user: editor,
        data: { name: "Updated Editor" },
      }),
    ).resolves.toMatchObject({ name: "Updated Editor" });

    await expect(
      fixtures.payload.update({
        collection: "users",
        id: otherEditor.id,
        overrideAccess: false,
        user: editor,
        data: { name: "Hijacked" },
      }),
    ).rejects.toThrow();
  });

  it("lets editors trash posts but not delete them permanently", async () => {
    const post = await fixtures.payload.create({
      collection: "posts",
      overrideAccess: true,
      draft: true,
      data: {
        title: "Trash candidate",
        slug: `trash-candidate-${suffix}`,
        excerpt: "Used to check the delete policy.",
        heroImage: fixtures.media.id,
        content: richText("Trash me"),
        category: fixtures.category.id,
        author: fixtures.author.id,
      },
    });
    fixtures.track("posts", post.id);

    await expect(
      fixtures.payload.delete({
        collection: "posts",
        id: post.id,
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow();

    await expect(
      fixtures.payload.update({
        collection: "posts",
        id: post.id,
        overrideAccess: false,
        user: editor,
        data: { deletedAt: new Date().toISOString() },
      }),
    ).resolves.toMatchObject({ id: post.id });

    await expect(
      fixtures.payload.delete({
        collection: "posts",
        id: post.id,
        overrideAccess: false,
        user: admin,
        trash: true,
      }),
    ).resolves.toBeDefined();
  });
});
