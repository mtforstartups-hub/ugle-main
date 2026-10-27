import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestDemo } from "../demo";
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
  DemoSheetService: class {
    append = mockSheetAppend;
  },
}));

vi.mock("@/app/lib/turnstile", () => ({
  verifyTurnstile: vi.fn().mockResolvedValue(true),
}));

describe("requestDemo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBatchSend.mockResolvedValue({ data: [{}, {}], error: null });
    mockSheetAppend.mockResolvedValue(undefined);
  });

  const validFormData = () => {
    const formData = new FormData();
    formData.set("firstName", "Alice");
    formData.set("lastName", "Smith");
    formData.set("email", "alice@broadcast.com");
    formData.set("company", "Broadcast News");
    formData.set("teamSize", "50-100");
    formData.set("currentSearch", "Manual review of daily audio/video footage");
    return formData;
  };

  it("submits demo request and dispatches user confirmation + admin alert + sheet row", async () => {
    const formData = validFormData();
    const result = await requestDemo(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe("Request submitted");
    expect(mockBatchSend).toHaveBeenCalledTimes(1);
    expect(mockSheetAppend).toHaveBeenCalledTimes(1);

    const emailPayload = mockBatchSend.mock.calls[0][0];
    expect(emailPayload).toHaveLength(2);

    // User email
    expect(emailPayload[0].to).toEqual(["alice@broadcast.com"]);
    expect(emailPayload[0].subject).toContain("Alice");

    // Admin email
    expect(emailPayload[1].to).toEqual(["admin@ugle.ai"]);
    expect(emailPayload[1].subject).toContain("Broadcast News");

    // Google Sheets row
    expect(mockSheetAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@broadcast.com",
        company: "Broadcast News",
        teamSize: "50-100",
        currentSearch: "Manual review of daily audio/video footage",
      }),
    );
  });

  it("fails validation when company or teamSize is missing", async () => {
    const formData = new FormData();
    formData.set("firstName", "Alice");
    formData.set("email", "alice@broadcast.com");

    const result = await requestDemo(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });

  it("handles Resend downtime gracefully if Google Sheets captures lead", async () => {
    mockBatchSend.mockRejectedValueOnce(new Error("Resend timeout"));

    const formData = validFormData();
    const result = await requestDemo(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(true);
    expect(mockSheetAppend).toHaveBeenCalledTimes(1);
  });

  it("reports error when both integrations fail", async () => {
    mockBatchSend.mockRejectedValueOnce(new Error("Resend down"));
    mockSheetAppend.mockRejectedValueOnce(new Error("Sheets down"));

    const formData = validFormData();
    const result = await requestDemo(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/wrong/i);
  });

  it("rejects submission when Turnstile verification fails (bot detected)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValueOnce(false);

    const formData = validFormData();
    const result = await requestDemo(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/verification failed/i);
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });
});
