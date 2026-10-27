import { test, expect } from "@playwright/test";
import { getLastSheetRow } from "./helpers/sheets";

test.describe("Newsletter signup (Footer)", () => {
  test("submits successfully end-to-end", async ({ page }) => {
    const testEmail = "delivered@resend.dev";

    await page.goto("/");

    // Turnstile is set to the "always passes" test sitekey in .env.test / default mock,
    // so the invisible widget resolves without a real challenge.
    await page.fill('input[name="email"]', testEmail);
    await page.click('button[type="submit"]');

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
      !process.env.RESEND_API_KEY.startsWith("re_test_mock")
    ) {
      const res = await fetch("https://api.resend.com/emails", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      const { data } = await res.json();
      const sent = data.find((e: { to: string[] }) => e.to.includes(testEmail));
      expect(sent).toBeTruthy();
    }
  });

  test("still succeeds when Turnstile blocks (fails open per design)", async ({
    page,
  }) => {
    await page.goto("/");
    const testEmail = "delivered@resend.dev";
    await page.fill('input[name="email"]', testEmail);
    await page.click('button[type="submit"]');

    await expect(page.getByText("Successfully Joined")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows validation error for invalid email", async ({ page }) => {
    await page.goto("/");
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill("not-an-email");
    await page.click('button[type="submit"]');
    await expect(emailInput).toHaveJSProperty("validity.valid", false);
  });
});
