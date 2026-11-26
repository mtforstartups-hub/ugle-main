import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  enable: vi.fn(),
  redirect: vi.fn(),
  connection: vi.fn(),
}));

vi.mock("next/headers", () => ({
  draftMode: async () => ({ enable: mocks.enable }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/server", () => ({ connection: mocks.connection }));

import { GET } from "../route";

const SECRET = "preview-route-test-secret";

function previewRequest(params: Record<string, string>) {
  const url = new URL("http://localhost:3000/api/preview");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url);
}

describe("preview route", () => {
  beforeEach(() => {
    process.env.PREVIEW_SECRET = SECRET;
    mocks.enable.mockReset();
    mocks.redirect.mockReset();
    mocks.connection.mockReset();
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    });
  });

  it("rejects an invalid secret", async () => {
    const response = await GET(
      previewRequest({
        collection: "posts",
        slug: "hello",
        path: "/blog/hello",
        secret: "wrong",
      }),
    );

    expect(response.status).toBe(401);
    expect(mocks.enable).not.toHaveBeenCalled();
  });

  it("rejects unknown collections", async () => {
    const response = await GET(
      previewRequest({
        collection: "users",
        slug: "hello",
        path: "/blog/hello",
        secret: SECRET,
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects a path that does not belong to the document", async () => {
    const response = await GET(
      previewRequest({
        collection: "posts",
        slug: "hello",
        path: "https://evil.example/phish",
        secret: SECRET,
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.enable).not.toHaveBeenCalled();
  });

  it("enables draft mode and redirects to the public path", async () => {
    await expect(
      GET(
        previewRequest({
          collection: "answers",
          slug: "is-my-data-private",
          path: "/answers/is-my-data-private",
          secret: SECRET,
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/answers/is-my-data-private");

    expect(mocks.enable).toHaveBeenCalledTimes(1);
    expect(mocks.redirect).toHaveBeenCalledWith("/answers/is-my-data-private");
  });
});
