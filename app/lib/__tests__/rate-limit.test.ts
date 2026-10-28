import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, resetRateLimits } from "../rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows requests up to the limit", () => {
    const options = { limit: 3, interval: 60_000 };

    expect(rateLimit("email:a@example.com", options).success).toBe(true);
    expect(rateLimit("email:a@example.com", options).success).toBe(true);
    expect(rateLimit("email:a@example.com", options).success).toBe(true);
  });

  it("rejects requests over the limit", () => {
    const options = { limit: 3, interval: 60_000 };
    rateLimit("email:b@example.com", options);
    rateLimit("email:b@example.com", options);
    rateLimit("email:b@example.com", options);

    const blocked = rateLimit("email:b@example.com", options);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("keys are independent", () => {
    const options = { limit: 1, interval: 60_000 };
    expect(rateLimit("email:c@example.com", options).success).toBe(true);
    expect(rateLimit("email:d@example.com", options).success).toBe(true);
  });

  it("does not extend the window on every request", () => {
    const options = { limit: 10, interval: 60_000 };
    const first = rateLimit("email:e@example.com", options);
    const second = rateLimit("email:e@example.com", options);

    expect(second.reset).toBe(first.reset);
  });
});
