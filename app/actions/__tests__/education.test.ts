import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyForEducationAccess } from "../education";
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
  EducationSheetService: class {
    append = mockSheetAppend;
  },
}));

vi.mock("@/app/lib/turnstile", () => ({
  verifyTurnstile: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/app/lib/honeypot", () => ({
  validateHoneypot: vi.fn().mockReturnValue({ isValid: true, error: null }),
}));

describe("applyForEducationAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBatchSend.mockResolvedValue({ data: [{}, {}], error: null });
    mockSheetAppend.mockResolvedValue(undefined);
  });

  const validFormData = () => {
    const formData = new FormData();
    formData.set("firstName", "Elena");
    formData.set("lastName", "Rostova");
    formData.set("email", "elena@university.edu");
    formData.set("institution", "Stanford University");
    formData.set("role", "Student");
    formData.set("proofUrl", "https://stanford.edu/students/elena");
    formData.set("ugle-honeypot", ""); // honeypot field
    return formData;
  };

  it("submits application and dispatches confirmation + admin alert + sheet record", async () => {
    const formData = validFormData();
    const result = await applyForEducationAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe("Application submitted");
    expect(mockBatchSend).toHaveBeenCalledTimes(1);
    expect(mockSheetAppend).toHaveBeenCalledTimes(1);

    const emailPayload = mockBatchSend.mock.calls[0][0];
    expect(emailPayload).toHaveLength(2);

    // User email
    expect(emailPayload[0].to).toEqual(["elena@university.edu"]);
    expect(emailPayload[0].subject).toContain("Elena");

    // Admin email
    expect(emailPayload[1].to).toEqual(["admin@ugle.ai"]);
    expect(emailPayload[1].subject).toContain("Stanford University");

    // Google Sheets
    expect(mockSheetAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Elena",
        lastName: "Rostova",
        email: "elena@university.edu",
        institution: "Stanford University",
        role: "Student",
        proofUrl: "https://stanford.edu/students/elena",
      }),
    );
  });

  it("rejects when required role or institution is missing", async () => {
    const formData = new FormData();
    formData.set("firstName", "Elena");
    formData.set("email", "elena@university.edu");
    // missing institution and role

    const result = await applyForEducationAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });

  it("succeeds if email service is down but sheets records lead", async () => {
    mockBatchSend.mockRejectedValueOnce(new Error("Network timeout"));

    const formData = validFormData();
    const result = await applyForEducationAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(true);
    expect(mockSheetAppend).toHaveBeenCalledTimes(1);
  });

  it("returns error message when both integrations fail", async () => {
    mockBatchSend.mockRejectedValueOnce(new Error("Resend error"));
    mockSheetAppend.mockRejectedValueOnce(new Error("Sheets error"));

    const formData = validFormData();
    const result = await applyForEducationAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/wrong/i);
  });

  it("rejects submission when Turnstile verification fails (bot detected)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValueOnce(false);

    const formData = validFormData();
    const result = await applyForEducationAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/verification failed/i);
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });
});
