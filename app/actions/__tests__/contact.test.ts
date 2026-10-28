import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitContactInquiry } from "../contact";
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
  ContactFormSheetService: class {
    append = mockSheetAppend;
  },
}));

vi.mock("@/app/lib/turnstile", () => ({
  verifyTurnstile: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/app/lib/honeypot", () => ({
  validateHoneypot: vi.fn().mockReturnValue({ isValid: true, error: null }),
}));

describe("submitContactInquiry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBatchSend.mockResolvedValue({ data: [{}, {}], error: null });
    mockSheetAppend.mockResolvedValue(undefined);
  });

  const validFormData = () => {
    const formData = new FormData();
    formData.set("firstName", "John");
    formData.set("lastName", "Doe");
    formData.set("email", "john.doe@company.com");
    formData.set("company", "Acme Media");
    formData.set("seats", "10-50");
    formData.set("usecase", "Redacting video transcripts");
    formData.set("ugle-honeypot", ""); // honeypot field
    return formData;
  };

  it("submits successfully and dispatches user + admin emails and sheet append", async () => {
    const formData = validFormData();
    const result = await submitContactInquiry(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe("Request submitted");
    expect(mockBatchSend).toHaveBeenCalledTimes(1);
    expect(mockSheetAppend).toHaveBeenCalledTimes(1);

    const emailPayload = mockBatchSend.mock.calls[0][0];
    expect(emailPayload).toHaveLength(2);

    // 1. User confirmation email
    expect(emailPayload[0].to).toEqual(["john.doe@company.com"]);
    expect(emailPayload[0].subject).toContain("John");

    // 2. Admin notification email
    expect(emailPayload[1].to).toEqual(["admin@ugle.ai"]);
    expect(emailPayload[1].subject).toContain("Acme Media");

    // Sheet append check
    expect(mockSheetAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@company.com",
        company: "Acme Media",
        seats: "10-50",
        usecase: "Redacting video transcripts",
      }),
    );
  });

  it("rejects when required fields are missing", async () => {
    const formData = new FormData();
    formData.set("firstName", "");
    formData.set("email", "bad-email");

    const result = await submitContactInquiry(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.message).toBeTruthy();
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });

  it("succeeds if Resend fails but Google Sheets succeeds (fail-open lead capture)", async () => {
    mockBatchSend.mockRejectedValueOnce(new Error("Resend unavailable"));

    const formData = validFormData();
    const result = await submitContactInquiry(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(true);
    expect(mockSheetAppend).toHaveBeenCalledTimes(1);
  });

  it("returns error state when both Resend and Google Sheets fail", async () => {
    mockBatchSend.mockRejectedValueOnce(new Error("Resend down"));
    mockSheetAppend.mockRejectedValueOnce(new Error("Sheets down"));

    const formData = validFormData();
    const result = await submitContactInquiry(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/wrong/i);
  });

  it("rejects submission when Turnstile verification fails (bot detected)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValueOnce(false);

    const formData = validFormData();
    const result = await submitContactInquiry(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/verification failed/i);
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });

  it("rejects header-injection characters in subject fields", async () => {
    const formData = validFormData();
    formData.set("firstName", "John\r\nBcc: evil@example.com");

    const result = await submitContactInquiry(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/invalid characters/i);
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });

  it("rate limits repeated submissions from the same email", async () => {
    for (let i = 0; i < 3; i++) {
      const result = await submitContactInquiry(
        { success: false, message: "" },
        validFormData(),
      );
      expect(result.success).toBe(true);
    }

    const blocked = await submitContactInquiry(
      { success: false, message: "" },
      validFormData(),
    );

    expect(blocked.success).toBe(false);
    expect(blocked.error).toBe("Rate limit exceeded");
    expect(mockBatchSend).toHaveBeenCalledTimes(3);
    expect(mockSheetAppend).toHaveBeenCalledTimes(3);
  });
});
