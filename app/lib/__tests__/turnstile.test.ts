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

  it("fails open and returns true when token is null or empty", async () => {
    const resultNull = await verifyTurnstile(null);
    expect(resultNull).toBe(true);

    const resultEmpty = await verifyTurnstile("");
    expect(resultEmpty).toBe(true);
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
