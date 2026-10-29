import { test, expect } from "@playwright/test";

test.describe("Contact Sales Form (/contact)", () => {
  test("submits contact inquiry successfully", async ({ page }) => {
    await page.goto("/contact");

    // Verify page heading
    await expect(page.getByRole("heading", { name: "Contact Sales" })).toBeVisible();

    const form = page.locator("form").first();

    // Fill form fields
    await form.locator("#firstName").fill("Jane");
    await form.locator("#lastName").fill("Smith");
    await form.locator("#email").fill("delivered@resend.dev");
    await form.locator("#company").fill("Production Co");
    await form.locator("#seats").selectOption("11-50");
    await form.locator("#usecase").fill("Redacting confidential interview transcripts for legal broadcast.");

    // Wait for Turnstile widget to populate token
    await expect(form.locator('input[name="cf-turnstile-response"]')).not.toHaveValue("", {
      timeout: 10_000,
    });

    // Submit form
    await form.getByRole("button", { name: /submit inquiry/i }).click();

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
