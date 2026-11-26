import path from "path";
import { defineConfig } from "vitest/config";

/**
 * Database-backed Payload tests. Kept out of the default `vitest.config.ts`
 * run so `bun run test` stays hermetic and CI-friendly without Postgres.
 *
 * Run with `bun run test:integration` (creates the database first).
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["./tests/integration/setup.ts"],
    // Payload owns one schema; parallel files would fight over shared tables.
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@payload-config": path.resolve(__dirname, "./payload.config.ts"),
      "server-only": path.resolve(
        __dirname,
        "./app/lib/__tests__/mocks/server-only.ts",
      ),
    },
  },
});
