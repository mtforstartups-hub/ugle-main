import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstile } from "../turnstile";

describe("verifyTurnstile", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("rejects when Turnstile is configured but no token is provided", async () => {
    // vitest.setup.ts configures a secret key, so verification is enforced.
    const resultNull = await verifyTurnstile(null);
    expect(resultNull).toBe(false);

    const resultEmpty = await verifyTurnstile("");
    expect(resultEmpty).toBe(false);
  });

  it("returns true when Cloudflare confirms valid token", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await verifyTurnstile("valid-test-token");
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("returns false when Cloudflare rejects invalid / bot token", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        "error-codes": ["invalid-input-response"],
      }),
    });

    const result = await verifyTurnstile("invalid-bot-token");
    expect(result).toBe(false);
  });

  it("fails open and returns true when Cloudflare API responds with HTTP 500 error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await verifyTurnstile("token-during-cf-outage");
    expect(result).toBe(true);
  });

  it("fails open and returns true when network request throws an exception", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network connection dropped"));

    const result = await verifyTurnstile("token-during-network-failure");
    expect(result).toBe(true);
  });
});
