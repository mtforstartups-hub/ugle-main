import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@ugle.ai";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Admin123!@#";

const richText = (text: string) => ({
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
});

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/admin(\/)?$/, { timeout: 20_000 });
}

interface ApiResult {
  ok: boolean;
  status: number;
  body: string;
}

/**
 * `page.request` does not forward the httpOnly Payload cookie, so issue API
 * calls from the page itself where the session cookie is available.
 */
async function api(
  page: Page,
  method: "DELETE" | "GET" | "PATCH" | "POST",
  url: string,
  data?: unknown,
): Promise<ApiResult> {
  return page.evaluate(
    async ({ method, url, data }) => {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers:
          data === undefined ? undefined : { "Content-Type": "application/json" },
        body: data === undefined ? undefined : JSON.stringify(data),
      });
      return { ok: res.ok, status: res.status, body: await res.text() };
    },
    { method, url, data },
  );
}

/**
 * Admin workflow tests mutate the connected database. They are opt-in so the
 * default E2E run stays read-only: `E2E_ADMIN=1 bun run test:e2e`.
 */
test.describe("admin content workflow", () => {
  test.skip(
    process.env.E2E_ADMIN !== "1",
    "Set E2E_ADMIN=1 (and E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD) to run admin E2E",
  );

  test("logs in, publishes a draft and cleans it up", async ({ page }) => {
    await login(page);

    // The dashboard is Ugle-branded, not Payload-branded.
    await expect(
      page.getByRole("heading", { name: "Content overview" }),
    ).toBeVisible();
    expect(await page.locator("body").innerText()).not.toContain("Payload");

    const [categoriesRes, authorsRes, mediaRes] = await Promise.all([
      api(page, "GET", "/api/categories?limit=1"),
      api(page, "GET", "/api/authors?limit=1"),
      api(page, "GET", "/api/media?limit=1"),
    ]);
    expect(categoriesRes.ok).toBeTruthy();
    expect(authorsRes.ok).toBeTruthy();
    expect(mediaRes.ok).toBeTruthy();

    const category = JSON.parse(categoriesRes.body).docs[0];
    const author = JSON.parse(authorsRes.body).docs[0];
    const media = JSON.parse(mediaRes.body).docs[0];

    test.skip(
      !category || !author || !media,
      "Needs at least one category, author and media upload in the database",
    );

    const stamp = Date.now();
    const title = `E2E post ${stamp}`;
    const slug = `e2e-post-${stamp}`;

    const createRes = await api(page, "POST", "/api/posts?draft=true", {
      title,
      slug,
      excerpt: "Created by the Playwright admin workflow test.",
      heroImage: media.id,
      category: category.id,
      author: author.id,
      content: richText("Admin workflow body."),
    });
    expect(createRes.ok, createRes.body).toBeTruthy();
    const postId = JSON.parse(createRes.body).doc.id as number;

    try {
      await page.goto(`/admin/collections/posts/${postId}`);
      await expect(
        page.getByRole("heading", { name: title, level: 1 }),
      ).toBeVisible();

      // Preview links go through the draft-mode endpoint.
      await expect(page.getByRole("link", { name: "Preview" })).toHaveAttribute(
        "href",
        /\/api\/preview\?/,
      );

      await page.getByRole("button", { name: /^Publish/ }).click();

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible().catch(() => false)) {
        await dialog.getByRole("button", { name: /^Publish/ }).click();
      }

      await expect(page.getByText("Status: Published")).toBeVisible({
        timeout: 20_000,
      });

      // The published post is publicly readable.
      await page.goto(`/blog/${slug}`);
      await expect(
        page.getByRole("heading", { name: title, level: 1 }),
      ).toBeVisible();

      // Unpublish through the API (same hook path as the admin UI) and the
      // public page must disappear again.
      const unpublishRes = await api(page, "PATCH", `/api/posts/${postId}`, {
        _status: "draft",
      });
      expect(unpublishRes.ok, unpublishRes.body).toBeTruthy();

      const unpublished = await page.goto(`/blog/${slug}`);
      expect(unpublished?.status()).toBe(404);
    } finally {
      await api(page, "DELETE", `/api/posts/${postId}`);
    }
  });
});
