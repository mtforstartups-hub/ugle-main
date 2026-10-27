import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestEarlyAccess } from "../early-access";
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
  EarlyAccessSheetService: class {
    append = mockSheetAppend;
  },
}));

vi.mock("@/app/lib/turnstile", () => ({
  verifyTurnstile: vi.fn().mockResolvedValue(true),
}));

describe("requestEarlyAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBatchSend.mockResolvedValue({ data: [{}, {}], error: null });
    mockSheetAppend.mockResolvedValue(undefined);
  });

  const validFormData = (os = "macOS") => {
    const formData = new FormData();
    formData.set("firstName", "David");
    formData.set("lastName", "Miller");
    formData.set("email", "david@creative.studio");
    formData.set("phone", "+1 555-0199");
    formData.set("os", os);
    return formData;
  };

  it("submits trial request for macOS and dispatches emails + sheet row", async () => {
    const formData = validFormData("macOS");
    const result = await requestEarlyAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe("Request submitted");
    expect(mockBatchSend).toHaveBeenCalledTimes(1);
    expect(mockSheetAppend).toHaveBeenCalledTimes(1);

    const emailPayload = mockBatchSend.mock.calls[0][0];
    expect(emailPayload).toHaveLength(2);

    // User email includes OS
    expect(emailPayload[0].to).toEqual(["david@creative.studio"]);
    expect(emailPayload[0].subject).toContain("David");

    // Admin email notes the OS platform
    expect(emailPayload[1].to).toEqual(["admin@ugle.ai"]);
    expect(emailPayload[1].subject).toContain("macOS");

    // Google Sheets
    expect(mockSheetAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "David",
        lastName: "Miller",
        email: "david@creative.studio",
        phone: "+1 555-0199",
        os: "macOS",
      }),
    );
  });

  it("submits trial request for Windows", async () => {
    const formData = validFormData("Windows");
    const result = await requestEarlyAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(true);
    expect(mockSheetAppend).toHaveBeenCalledWith(
      expect.objectContaining({ os: "Windows" }),
    );
  });

  it("rejects invalid OS selection", async () => {
    const formData = validFormData("Linux");
    const result = await requestEarlyAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });

  it("rejects missing phone number", async () => {
    const formData = validFormData();
    formData.set("phone", "");

    const result = await requestEarlyAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });

  it("succeeds if Resend is unavailable but Google Sheets logs row", async () => {
    mockBatchSend.mockRejectedValueOnce(new Error("Resend rate limit"));

    const formData = validFormData();
    const result = await requestEarlyAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(true);
    expect(mockSheetAppend).toHaveBeenCalledTimes(1);
  });

  it("returns error state when both integrations fail", async () => {
    mockBatchSend.mockRejectedValueOnce(new Error("Resend down"));
    mockSheetAppend.mockRejectedValueOnce(new Error("Sheets down"));

    const formData = validFormData();
    const result = await requestEarlyAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/wrong/i);
  });

  it("rejects submission when Turnstile verification fails (bot detected)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValueOnce(false);

    const formData = validFormData();
    const result = await requestEarlyAccess(
      { success: false, message: "" },
      formData,
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/verification failed/i);
    expect(mockBatchSend).not.toHaveBeenCalled();
    expect(mockSheetAppend).not.toHaveBeenCalled();
  });
});
