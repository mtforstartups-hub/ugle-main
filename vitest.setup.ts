// vitest.setup.ts
import { beforeEach } from "vitest";
import { resetRateLimits } from "@/app/lib/rate-limit";

process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
process.env.RESEND_API_KEY = "re_test_mock_key_123";
process.env.RESEND_FROM_EMAIL = "test@ugle.ai";
process.env.ADMIN_EMAIL = "admin@ugle.ai";
process.env.GOOGLE_CLIENT_EMAIL = "test@serviceaccount.com";
process.env.GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD\n-----END PRIVATE KEY-----\n";
process.env.GOOGLE_SPREADSHEET_ID = "test_spreadsheet_id_123";

beforeEach(() => {
  resetRateLimits();
});
