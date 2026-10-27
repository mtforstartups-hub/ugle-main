import { test, expect } from "@playwright/test";

test.describe("Demo Request Form (/request-demo)", () => {
  test("submits organisation demo request successfully", async ({ page }) => {
    await page.goto("/request-demo");

    // Verify page heading
    await expect(page.getByRole("heading", { name: "Ugle for Organisations" })).toBeVisible();

    const form = page.locator("form").first();

    // Fill form fields scoped to the demo form
    await form.locator('input[name="firstName"]').fill("Carlos");
    await form.locator('input[name="lastName"]').fill("Gomez");
    await form.locator('input[name="email"]').fill("delivered@resend.dev");
    await form.locator('input[name="company"]').fill("NewsGroup International");
    await form.locator('select[name="teamSize"]').selectOption("6-20 editors");
    await form.locator('textarea[name="currentSearch"]').fill("Keyword searching through local storage drives and Premiere projects.");

    // Submit form
    await form.getByRole("button", { name: /submit organisation request/i }).click();

    // Verify submission success state
    await expect(page.getByRole("heading", { name: "Request Received" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText(/our enterprise team will be in touch shortly/i),
    ).toBeVisible();
  });

  test("validates required inputs before submission", async ({ page }) => {
    await page.goto("/request-demo");
    const form = page.locator("form").first();

    // Attempt to submit empty form
    await form.getByRole("button", { name: /submit organisation request/i }).click();

    // Form remains unsubmitted
    await expect(form.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Request Received" })).not.toBeVisible();
  });
});
