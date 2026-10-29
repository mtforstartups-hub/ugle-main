import { test, expect } from "@playwright/test";

test.describe("Request Trial / Early Access Form (/request-trial)", () => {
  test("submits early access request with manual OS selection", async ({ page }) => {
    await page.goto("/request-trial");

    // Verify page heading
    await expect(page.getByRole("heading", { name: "Start searching your archive." })).toBeVisible();

    const form = page.locator("form").first();

    const testEmail = `trial_${Date.now()}@resend.dev`;

    // Fill form fields scoped to the trial form
    await form.locator('input[name="firstName"]').fill("Alex");
    await form.locator('input[name="lastName"]').fill("Rivera");
    await form.locator('input[name="email"]').fill(testEmail);
    await form.locator('input[name="phone"]').fill("+1 415-555-0134");
    await form.locator('input[name="os"][value="macOS"]').check();

    // Wait for Turnstile widget to populate token
    await expect(form.locator('input[name="cf-turnstile-response"]')).not.toHaveValue("", {
      timeout: 10_000,
    });

    // Submit form
    await form.getByRole("button", { name: /request access/i }).click();

    // Verify submission success state
    await expect(page.getByRole("heading", { name: "Request Received" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText(/we'll be in touch soon with your early access invitation/i),
    ).toBeVisible();
  });

  test("auto-selects macOS from query parameter ?platform=macos", async ({ page }) => {
    await page.goto("/request-trial?platform=macos");

    const form = page.locator("form").first();
    const macosRadio = form.locator('input[name="os"][value="macOS"]');
    await expect(macosRadio).toBeChecked();
  });

  test("validates required inputs before submission", async ({ page }) => {
    await page.goto("/request-trial");
    const form = page.locator("form").first();

    // Attempt submit with empty fields
    await form.getByRole("button", { name: /request access/i }).click();

    // Form remains unsubmitted
    await expect(form.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Request Received" })).not.toBeVisible();
  });
});
