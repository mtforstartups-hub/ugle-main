import { describe, it, expect } from "vitest";
import { validateHoneypot } from "../honeypot";

describe("validateHoneypot", () => {
  it("accepts a missing field", () => {
    expect(validateHoneypot(null).isValid).toBe(true);
    expect(validateHoneypot(undefined).isValid).toBe(true);
  });

  it("accepts the empty value browsers always submit", () => {
    expect(validateHoneypot("").isValid).toBe(true);
    expect(validateHoneypot("   ").isValid).toBe(true);
  });

  it("rejects any filled-in value", () => {
    const result = validateHoneypot("https://spam.example");
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.error).toMatch(/verification failed/i);
    }
  });
});
