import { describe, it, expect, vi, beforeEach } from "vitest";
import { newsletterJoin } from "../newsletter";
import { verifyTurnstile } from "@/app/lib/turnstile";

const mockBatchSend = vi.fn().mockResolvedValue({ data: [{}, {}], error: null });
const mockSheetAppend = vi.fn().mockResolvedValue(undefined);

vi.mock("resend", () => ({
  Resend: class {
    batch = {
      send: mockBatchSend,
    };
  },
}));

vi.mock("@/app/lib/sheets", () => ({
  NewsletterSheetService: class {
    append = mockSheetAppend;
  },
}));

vi.mock("@/app/lib/turnstile", () => ({
  verifyTurnstile: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/app/lib/honeypot", () => ({
  validateHoneypot: vi.fn().mockReturnValue({ isValid: true, error: null }),
}));

describe("newsletterJoin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBatchSend.mockResolvedValue({ data: [{}, {}], error: null });
    mockSheetAppend.mockResolvedValue(undefined);
  });

  it("succeeds when both email and sheets succeed", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("ugle-honeypot", ""); // honeypot field

    const result = await newsletterJoin(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(true);
    expect(mockBatchSend).toHaveBeenCalledTimes(1);
    expect(mockSheetAppend).toHaveBeenCalledTimes(1);

    const emailPayload = mockBatchSend.mock.calls[0][0];
    expect(emailPayload[0].to).toEqual(["test@example.com"]);
    expect(emailPayload[1].to).toEqual(["admin@ugle.ai"]);
  });

  it("rejects invalid email without calling Turnstile", async () => {
    const formData = new FormData();
    formData.set("email", "not-an-email");
    formData.set("ugle-honeypot", ""); // honeypot field

    const result = await newsletterJoin(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/invalid/i);
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });

  it("still succeeds if only sheets succeeds (email down)", async () => {
    mockBatchSend.mockRejectedValueOnce(new Error("Resend down"));

    const formData = new FormData();
    formData.set("email", "test2@example.com");
    formData.set("ugle-honeypot", ""); // honeypot field

    const result = await newsletterJoin(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(true);
    expect(mockSheetAppend).toHaveBeenCalledTimes(1);
  });

  it("fails cleanly when both integrations fail", async () => {
    mockBatchSend.mockRejectedValueOnce(new Error("Resend down"));
    mockSheetAppend.mockRejectedValueOnce(new Error("Sheets down"));

    const formData = new FormData();
    formData.set("email", "test3@example.com");
    formData.set("ugle-honeypot", ""); // honeypot field

    const result = await newsletterJoin(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/wrong/i);
  });

  it("rejects submission when Turnstile verification fails (bot detected)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValueOnce(false);

    const formData = new FormData();
    formData.set("email", "bot@example.com");
    formData.set("ugle-honeypot", ""); // honeypot field

    const result = await newsletterJoin(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/verification failed/i);
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });
});
