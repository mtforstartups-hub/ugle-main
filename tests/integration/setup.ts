/**
 * Integration test bootstrap.
 *
 * Runs before any test module is imported, so `payload.config.ts` sees the
 * test database and deterministic secrets when it is first evaluated.
 */
(process.env as Record<string, string | undefined>).NODE_ENV = "test";

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://ugle:ugle@localhost:5432/ugle_test";

process.env.PAYLOAD_SECRET ||= "integration-test-secret";
process.env.NEXT_PUBLIC_SERVER_URL ||= "http://localhost:3000";
process.env.PREVIEW_SECRET ||= "integration-preview-secret";
process.env.CRON_SECRET ||= "integration-cron-secret";

// Force the local disk upload adapter. Tests must never write to a real Blob
// store, even when the developer's shell has a token configured.
delete process.env.BLOB_READ_WRITE_TOKEN;
