import { test, expect } from "@playwright/test";
import { getLastSheetRow } from "./helpers/sheets";

test.describe("Newsletter signup (Footer)", () => {
  test("submits successfully end-to-end", async ({ page }) => {
    const testEmail = "delivered@resend.dev";

    await page.goto("/");

    const form = page.locator("footer form");

    // Turnstile is set to the "always passes" test sitekey in .env.test / default mock,
    // so the invisible widget resolves without a real challenge.
    await form.locator('input[name="email"]').fill(testEmail);

    // Wait for Turnstile widget to populate token
    await expect(form.locator('input[name="cf-turnstile-response"]')).not.toHaveValue("", {
      timeout: 10_000,
    });

    await form.locator('button[type="submit"]').click();

    // Wait for success UI
    await expect(page.getByText("Successfully Joined")).toBeVisible({
      timeout: 10_000,
    });

    // When live credentials are provided, verify Google Sheets and Resend
    if (
      process.env.GOOGLE_SPREADSHEET_ID &&
      process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
    ) {
      const row = await getLastSheetRow(
        process.env.GOOGLE_SPREADSHEET_ID,
        "Newsletter",
      );
      expect(row[0]).toBe(testEmail);
    }

    if (
      process.env.RESEND_API_KEY &&
      !process.env.RESEND_API_KEY.startsWith("re_test_mock") &&
      !process.env.RESEND_API_KEY.startsWith("re_test_xxx")
    ) {
      const res = await fetch("https://api.resend.com/emails", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      expect(res.ok).toBe(true);
      const body = (await res.json()) as { data?: { to: string[] }[] };
      expect(Array.isArray(body.data)).toBe(true);
      const sent = body.data?.find((e) => e.to.includes(testEmail));
      expect(sent).toBeTruthy();
    }
  });

  test("rejects a bot submission when the honeypot is filled", async ({
    page,
  }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', "bot@example.com");
    await page
      .locator('input[name="ugle-honeypot"]')
      .fill("spam", { force: true });
    await page.click('button[type="submit"]');

    await expect(page.getByText(/verification failed/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Successfully Joined")).not.toBeVisible();
  });

  test("shows validation error for invalid email", async ({ page }) => {
    await page.goto("/");
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill("not-an-email");
    await page.click('button[type="submit"]');
    await expect(emailInput).toHaveJSProperty("validity.valid", false);
  });
});
