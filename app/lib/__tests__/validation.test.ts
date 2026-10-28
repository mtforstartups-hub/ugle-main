import { describe, it, expect } from "vitest";
import {
  emailField,
  optionalHttpUrl,
  paragraphText,
  singleLineText,
  subjectText,
} from "../validation";

describe("subjectText", () => {
  it("accepts and trims normal values", () => {
    const result = subjectText("Required").safeParse("  Jane  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("Jane");
  });

  it("rejects empty values with the provided message", () => {
    const result = subjectText("First name is required").safeParse("   ");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("First name is required");
    }
  });

  it.each(["Jane\r\nBcc: evil@example.com", "Jane\nDoe", "Jane\tDoe", "Jane\u0000Doe"])(
    "rejects control characters in %j",
    (value) => {
      expect(subjectText("Required").safeParse(value).success).toBe(false);
    },
  );

  it("rejects values over the max length", () => {
    expect(subjectText("Required", 10).safeParse("a".repeat(11)).success).toBe(
      false,
    );
    expect(subjectText("Required", 10).safeParse("a".repeat(10)).success).toBe(
      true,
    );
  });
});

describe("singleLineText", () => {
  it("behaves like subjectText", () => {
    expect(singleLineText("Required", 5).safeParse("+1 555").success).toBe(
      false,
    );
    expect(singleLineText("Required", 10).safeParse("+1 555").success).toBe(
      true,
    );
  });
});

describe("paragraphText", () => {
  it("allows newlines and tabs for textareas", () => {
    expect(paragraphText("Required").safeParse("line 1\nline 2\tend").success).toBe(
      true,
    );
  });

  it("rejects other control characters", () => {
    expect(paragraphText("Required").safeParse("bad\u0000value").success).toBe(
      false,
    );
  });
});

describe("emailField", () => {
  it("accepts valid emails", () => {
    expect(emailField().safeParse("jane@example.com").success).toBe(true);
  });

  it("rejects invalid or oversized emails", () => {
    expect(emailField().safeParse("not-an-email").success).toBe(false);
    expect(emailField().safeParse("a".repeat(250) + "@example.com").success).toBe(
      false,
    );
  });
});

describe("optionalHttpUrl", () => {
  it("accepts empty values", () => {
    expect(optionalHttpUrl("Invalid URL").safeParse("").success).toBe(true);
    expect(optionalHttpUrl("Invalid URL").safeParse(undefined).success).toBe(
      true,
    );
  });

  it("accepts http and https URLs", () => {
    expect(
      optionalHttpUrl("Invalid URL").safeParse("https://example.com/profile")
        .success,
    ).toBe(true);
    expect(
      optionalHttpUrl("Invalid URL").safeParse("http://example.com").success,
    ).toBe(true);
  });

  it("rejects non-http schemes and malformed values", () => {
    expect(
      optionalHttpUrl("Invalid URL").safeParse("javascript:alert(1)").success,
    ).toBe(false);
    expect(
      optionalHttpUrl("Invalid URL").safeParse("ftp://example.com").success,
    ).toBe(false);
    expect(optionalHttpUrl("Invalid URL").safeParse("example.com").success).toBe(
      false,
    );
  });
});
