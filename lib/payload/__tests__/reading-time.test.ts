import { describe, expect, it } from "vitest";

import { estimateReadingTime } from "../reading-time";

describe("estimateReadingTime", () => {
  it("falls back to one minute for missing or non-object content", () => {
    expect(estimateReadingTime(null)).toBe(1);
    expect(estimateReadingTime(undefined)).toBe(1);
    expect(estimateReadingTime("plain string")).toBe(1);
  });

  it("rounds short content up to a single minute", () => {
    expect(estimateReadingTime({ root: { children: [{ text: "hello world" }] } })).toBe(1);
  });

  it("scales with word count at roughly 200 words per minute", () => {
    const content = { text: "word ".repeat(1000) };
    expect(estimateReadingTime(content)).toBe(5);
  });

  it("ignores punctuation and markup characters", () => {
    const content = { text: "<p>Hello, world!</p> ".repeat(500) };
    // ~1500 words after splitting the repeated phrase on punctuation.
    expect(estimateReadingTime(content)).toBeGreaterThan(5);
  });
});
