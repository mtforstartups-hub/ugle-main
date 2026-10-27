import { test, expect } from "@playwright/test";

test.describe("Education Application Form (/education)", () => {
  test("submits education application successfully", async ({ page }) => {
    await page.goto("/education");

    // Verify page heading
    await expect(page.getByRole("heading", { name: "Educational Pack" })).toBeVisible();

    // Fill form fields
    await page.locator("#firstName").fill("Elena");
    await page.locator("#lastName").fill("Rostova");
    await page.locator("#email").fill("delivered@resend.dev");
    await page.locator("#institution").fill("Stanford University");
    await page.locator("#role").selectOption("Student");
    await page.locator("#proofUrl").fill("https://stanford.edu/~elena");

    // Submit form
    await page.getByRole("button", { name: /submit application/i }).click();

    // Verify submission success state
    await expect(page.getByRole("heading", { name: "Application Received" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText(/activation details to your academic email address within 2 business days/i),
    ).toBeVisible();
  });

  test("validates required fields before submission", async ({ page }) => {
    await page.goto("/education");

    // Submit empty form
    await page.getByRole("button", { name: /submit application/i }).click();

    // Form remains visible
    await expect(page.locator("#firstName")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Application Received" })).not.toBeVisible();
  });
});
