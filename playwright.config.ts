import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import fs from "node:fs";

// Load test environment variables (.env.test) for E2E runs
(process.env as Record<string, string | undefined>).NODE_ENV ||= "test";
loadEnvConfig(process.cwd(), false);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html"], ["github"]] : "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: process.env.PLAYWRIGHT_TEST_BASE_URL
    ? undefined
    : {
        command:
          process.env.CI || fs.existsSync(".next")
            ? "bun run start"
            : "bun run build && bun run start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          NODE_ENV: "production",
        },
      },
});
