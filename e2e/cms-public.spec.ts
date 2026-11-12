import { expect, test } from "@playwright/test";

/**
 * Read-only smoke tests for the CMS-backed public site. They only rely on
 * content that is published in the connected database, so they work against a
 * seeded staging database as well as a local dev database.
 */
test.describe("public CMS pages", () => {
  test("blog listing renders posts and loads more", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const cards = page
      .locator('a[href^="/blog/"]')
      .filter({ has: page.locator("h2") });
    await expect(cards.first()).toBeVisible();

    const loadMore = page.getByRole("button", { name: "Load more posts" });
    if ((await loadMore.count()) === 0) {
      test.skip(true, "Not enough published posts to paginate");
      return;
    }

    const before = await cards.count();
    await loadMore.click();
    await expect
      .poll(async () => cards.count(), { timeout: 15_000 })
      .toBeGreaterThan(before);
  });

  test("blog post exposes metadata and BlogPosting JSON-LD", async ({ page }) => {
    await page.goto("/blog");

    const firstPost = page
      .locator('a[href^="/blog/"]')
      .filter({ has: page.locator("h2") })
      .first();
    await expect(firstPost).toBeVisible();

    const href = await firstPost.getAttribute("href");
    expect(href).toMatch(/^\/blog\/.+/);

    await page.goto(href as string);

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    const title = (await heading.textContent())?.trim();
    expect(title?.length).toBeGreaterThan(0);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.{20,}/);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", new RegExp(`${href}/?$`));

    const jsonLd = page.locator('script[type="application/ld+json"]');
    expect(await jsonLd.count()).toBeGreaterThan(0);
    const blocks = await jsonLd.allTextContents();
    expect(blocks.join("\n")).toContain('"@type":"BlogPosting"');
  });

  test("answers index renders cards, chips and FAQ JSON-LD", async ({ page }) => {
    await page.goto("/answers");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const cards = page
      .locator('a[href^="/answers/"]')
      .filter({ has: page.locator("h2") });
    await expect(cards.first()).toBeVisible();

    const jsonLd = page.locator('script[type="application/ld+json"]');
    const blocks = await jsonLd.allTextContents();
    expect(blocks.join("\n")).toContain('"@type":"FAQPage"');

    const categoryChip = page.locator('a[href^="/answers?category="]').first();
    if ((await categoryChip.count()) > 0) {
      const categoryHref = new URL(
        (await categoryChip.getAttribute("href")) as string,
        "http://localhost",
      );
      await categoryChip.click();

      await expect(page).toHaveURL(
        (url) =>
          url.pathname === "/answers" &&
          url.searchParams.get("category") ===
            categoryHref.searchParams.get("category"),
      );
      await expect(
        page.getByRole("heading", { name: "Answers in this category" }),
      ).toBeVisible();
    }
  });

  test("missing CMS pages return 404", async ({ page }) => {
    const post = await page.goto("/blog/this-post-does-not-exist-e2e");
    expect(post?.status()).toBe(404);
    await expect(page.getByText("Page Not Found.")).toBeVisible();

    const answer = await page.goto("/answers/this-answer-does-not-exist-e2e");
    expect(answer?.status()).toBe(404);
  });

  test("sitemap, robots, RSS and llms.txt are served", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("/blog");

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("Disallow: /admin");
    expect(robotsBody).toContain("Sitemap:");

    const rss = await request.get("/blog/rss.xml");
    expect(rss.status()).toBe(200);
    expect(await rss.text()).toContain("<rss");

    const llms = await request.get("/llms.txt");
    expect(llms.status()).toBe(200);
  });
});
