import { test, expect } from "@playwright/test";

test.describe("Contact Sales Form (/contact)", () => {
  test("submits contact inquiry successfully", async ({ page }) => {
    await page.goto("/contact");

    // Verify page heading
    await expect(page.getByRole("heading", { name: "Contact Sales" })).toBeVisible();

    // Fill form fields
    await page.locator("#firstName").fill("Jane");
    await page.locator("#lastName").fill("Smith");
    await page.locator("#email").fill("delivered@resend.dev");
    await page.locator("#company").fill("Production Co");
    await page.locator("#seats").selectOption("11-50");
    await page.locator("#usecase").fill("Redacting confidential interview transcripts for legal broadcast.");

    // Submit form
    await page.getByRole("button", { name: /submit inquiry/i }).click();

    // Verify submission success state
    await expect(page.getByRole("heading", { name: "Request Received" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText(/sales team will get back to you shortly/i),
    ).toBeVisible();
  });

  test("enforces required fields validation", async ({ page }) => {
    await page.goto("/contact");

    // Submit empty form
    await page.getByRole("button", { name: /submit inquiry/i }).click();

    // Browser validation prevents submission; form should remain visible
    await expect(page.locator("#firstName")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Request Received" })).not.toBeVisible();
  });
});
