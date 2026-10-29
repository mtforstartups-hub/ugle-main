import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { requestEarlyAccess } from "../early-access";
import { verifyTurnstile } from "@/app/lib/turnstile";
import * as envModule from "@/app/lib/env";

const {
  mockBatchSend,
  mockSheetAppend,
  mockGetClientIp,
  mockCheckIpRateLimit,
} = vi.hoisted(() => ({
  mockBatchSend: vi.fn().mockResolvedValue({
    data: { data: [{ id: "email_1" }, { id: "email_2" }] },
    error: null,
  }),
  mockSheetAppend: vi.fn().mockResolvedValue(undefined),
  mockGetClientIp: vi.fn().mockResolvedValue("198.51.100.42"),
  mockCheckIpRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    retryAfterSeconds: 0,
    checked: true,
  }),
}));

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
    emails = vi.fn().mockResolvedValue([]);
  },
}));

vi.mock("@/app/lib/turnstile", () => ({
  verifyTurnstile: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/app/lib/client-ip", () => ({
  getClientIp: mockGetClientIp,
}));

vi.mock("@/app/lib/ip-rate-limit", () => ({
  checkIpRateLimit: mockCheckIpRateLimit,
}));

const initial = { success: false, message: "" };

function validFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("firstName", "David");
  formData.set("lastName", "Miller");
  formData.set("email", "david@creative.studio");
  formData.set("phone", "+1 555-0199");
  formData.set("os", "macOS");
  formData.set("ugle-honeypot", "");
  formData.set("cf-turnstile-response", "test-turnstile-token");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

function submit(formData: FormData) {
  return requestEarlyAccess(initial, formData);
}

describe("requestEarlyAccess", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBatchSend.mockResolvedValue({
      data: { data: [{ id: "email_1" }, { id: "email_2" }] },
      error: null,
    });
    mockSheetAppend.mockResolvedValue(undefined);
    mockGetClientIp.mockResolvedValue("198.51.100.42");
    mockCheckIpRateLimit.mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0,
      checked: true,
    });
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe("fallback path (ugle-api not configured)", () => {
    it("submits a macOS request and dispatches both emails + sheet row", async () => {
      const result = await submit(validFormData());

      expect(result).toEqual({ success: true, message: "Request submitted" });
      expect(mockBatchSend).toHaveBeenCalledTimes(1);
      expect(mockSheetAppend).toHaveBeenCalledTimes(1);
    });

    it("sends a confirmation to the user and a notification to the admin", async () => {
      await submit(validFormData());

      const emailPayload = mockBatchSend.mock.calls[0][0];
      expect(emailPayload).toHaveLength(2);

      // User confirmation
      expect(emailPayload[0].from).toBe("Ugle <test@ugle.ai>");
      expect(emailPayload[0].to).toEqual(["david@creative.studio"]);
      expect(emailPayload[0].subject).toContain("David");
      expect(emailPayload[0].react).toBeTruthy();

      // Admin notification
      expect(emailPayload[1].to).toEqual(["admin@ugle.ai"]);
      expect(emailPayload[1].subject).toBe(
        "New early access request: David Miller (macOS)",
      );
      expect(emailPayload[1].react).toBeTruthy();
    });

    it("supports Windows and records the OS + server timestamp in Sheets", async () => {
      const result = await submit(validFormData({ os: "Windows" }));

      expect(result.success).toBe(true);
      expect(mockSheetAppend).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "David",
          lastName: "Miller",
          email: "david@creative.studio",
          phone: "+1 555-0199",
          os: "Windows",
          submittedAt: expect.any(String),
        }),
      );

      const row = mockSheetAppend.mock.calls[0][0];
      expect(row.submittedAt.length).toBeGreaterThan(0);
    });

    it("trims leading/trailing whitespace from text fields", async () => {
      await submit(validFormData({ firstName: "  David  ", lastName: " Miller " }));

      expect(mockSheetAppend).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: "David", lastName: "Miller" }),
      );
    });

    it("returns error only when both Resend and Sheets fail", async () => {
      mockBatchSend.mockRejectedValueOnce(new Error("Resend down"));
      mockSheetAppend.mockRejectedValueOnce(new Error("Sheets down"));

      const result = await submit(validFormData());

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/wrong/i);
    });
  });

  describe("ugle-api trial endpoint integration", () => {
    beforeEach(() => {
      vi.spyOn(envModule, "trialApiConfig", "get").mockReturnValue({
        success: true,
        data: {
          TRIAL_API_SECRET: "test-trial-secret",
          TRIAL_API_URL: "https://trial-api.internal/v1/trials",
        },
      } as any);
    });

    it("returns 202 ok with 'Check your inbox for your key.'", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 202,
        ok: true,
        json: async () => ({ status: "ok" }),
      });

      const result = await submit(validFormData());

      expect(result).toEqual({
        success: true,
        message: "Check your inbox for your key.",
      });
      expect(global.fetch).toHaveBeenCalledWith(
        "https://trial-api.internal/v1/trials",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-trial-secret",
          },
        }),
      );
    });

    it("normalizes Gmail dots and +tags before calling ugle-api", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 202,
        ok: true,
        json: async () => ({ status: "ok" }),
      });

      await submit(validFormData({ email: "john.doe+trial@gmail.com" }));

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const call = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(call[1]?.body as string);
      expect(body.email).toBe("johndoe@gmail.com");
      expect(body.os).toBe("macos");
    });

    it("returns overwhelmed message on 503 cap_reached", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 503,
        json: async () => ({ error: "cap_reached" }),
      });

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(result.message).toMatch(/overwhelmed/i);
    });

    it("returns 'Check your inbox for your key.' and logs admin alert on trials_disabled", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      global.fetch = vi.fn().mockResolvedValue({
        status: 503,
        json: async () => ({ error: "trials_disabled" }),
      });

      const result = await submit(validFormData());

      expect(result).toEqual({
        success: true,
        message: "Check your inbox for your key.",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("trials_disabled"),
        expect.any(Object),
      );
    });

    it("retries once after 2s on 500 error and returns 'Check your inbox for your key.'", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          status: 500,
          json: async () => ({ error: "server_error" }),
        })
        .mockResolvedValueOnce({
          status: 500,
          json: async () => ({ error: "server_error" }),
        });

      const result = await submit(validFormData());

      expect(result).toEqual({
        success: true,
        message: "Check your inbox for your key.",
      });
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Run `ugle-api trial reissue --email <addr>` first"),
        expect.any(Object),
      );
    });

    it("does not retry 400 or 401 errors", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      global.fetch = vi.fn().mockResolvedValue({
        status: 400,
        json: async () => ({ error: "invalid_request" }),
      });

      const result = await submit(validFormData());

      expect(result).toEqual({
        success: true,
        message: "Check your inbox for your key.",
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Trial API rejected the request:"),
        400,
      );
    });

    it("allows the user to submit the same email multiple times without error", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 202,
        ok: true,
        json: async () => ({ status: "ok" }),
      });

      const first = await submit(validFormData({ email: "user@example.com" }));
      const second = await submit(validFormData({ email: "user@example.com" }));

      expect(first).toEqual({ success: true, message: "Check your inbox for your key." });
      expect(second).toEqual({ success: true, message: "Check your inbox for your key." });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("validation", () => {
    it("rejects an invalid OS selection", async () => {
      const result = await submit(validFormData({ os: "Linux" }));

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/select your primary os/i);
      expect(mockBatchSend).not.toHaveBeenCalled();
      expect(mockSheetAppend).not.toHaveBeenCalled();
    });

    it("rejects a missing phone number", async () => {
      const result = await submit(validFormData({ phone: "" }));

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/contact number is required/i);
    });

    it("rejects a missing first name", async () => {
      const result = await submit(validFormData({ firstName: "   " }));

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/first name is required/i);
    });

    it("rejects control characters in names (email header injection)", async () => {
      const result = await submit(
        validFormData({ firstName: "David\r\nBcc: victim@example.com" }),
      );

      expect(result.success).toBe(false);
      expect(mockBatchSend).not.toHaveBeenCalled();
    });

    it("rejects malformed email addresses", async () => {
      const result = await submit(validFormData({ email: "not-an-email" }));

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/invalid email/i);
    });

    it("validates the form before spending the single-use Turnstile token", async () => {
      const result = await submit(validFormData({ os: "Linux" }));

      expect(result.success).toBe(false);
      expect(verifyTurnstile).not.toHaveBeenCalled();
    });

    it("rejects disposable email addresses without calling ugle-api", async () => {
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;

      const result = await submit(validFormData({ email: "someone@mailinator.com" }));

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/disposable email addresses aren't accepted/i);
      expect(mockBatchSend).not.toHaveBeenCalled();
      expect(mockSheetAppend).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("bot protection", () => {
    it("rejects a filled-in honeypot without calling Turnstile", async () => {
      const result = await submit(
        validFormData({ "ugle-honeypot": "https://spam.example" }),
      );

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/verification failed/i);
      expect(verifyTurnstile).not.toHaveBeenCalled();
      expect(mockBatchSend).not.toHaveBeenCalled();
    });

    it("passes the Turnstile token through to verification", async () => {
      await submit(validFormData());

      expect(verifyTurnstile).toHaveBeenCalledWith("test-turnstile-token");
    });

    it("rejects the submission when Turnstile verification fails", async () => {
      vi.mocked(verifyTurnstile).mockResolvedValueOnce(false);

      const result = await submit(validFormData());

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/verification failed/i);
      expect(mockBatchSend).not.toHaveBeenCalled();
      expect(mockSheetAppend).not.toHaveBeenCalled();
    });
  });

  describe("IP rate limiting", () => {
    it("rejects a request when the IP limit is exceeded", async () => {
      mockCheckIpRateLimit.mockResolvedValueOnce({
        allowed: false,
        retryAfterSeconds: 120,
      });

      const result = await submit(validFormData());

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Too many trial requests from your network/i);
      expect(result.error).toMatch(/2 minutes/);
      expect(mockBatchSend).not.toHaveBeenCalled();
      expect(mockSheetAppend).not.toHaveBeenCalled();
    });

    it("uses singular 'minute' when the retry window is under two minutes", async () => {
      mockCheckIpRateLimit.mockResolvedValueOnce({
        allowed: false,
        retryAfterSeconds: 30,
      });

      const result = await submit(validFormData());

      expect(result.error).toMatch(/1 minute\./);
    });

    it("skips the IP check when no client IP is available", async () => {
      mockGetClientIp.mockResolvedValueOnce(null);

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockCheckIpRateLimit).not.toHaveBeenCalled();
    });
  });

  describe("integration resilience", () => {
    it("still captures the lead in Sheets when Resend rejects", async () => {
      mockBatchSend.mockRejectedValueOnce(new Error("Resend rate limit"));

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockSheetAppend).toHaveBeenCalledTimes(1);
    });

    it("treats a Resend API error response as a failure but still succeeds via Sheets", async () => {
      mockBatchSend.mockResolvedValueOnce({
        data: null,
        error: { name: "validation_error", message: "Invalid from address" },
      });

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockSheetAppend).toHaveBeenCalledTimes(1);
    });

    it("still sends emails when Sheets appending fails", async () => {
      mockSheetAppend.mockRejectedValueOnce(new Error("Sheets down"));

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockBatchSend).toHaveBeenCalledTimes(1);
    });

    it("treats a truncated Resend batch response as an email failure but succeeds if Sheets succeeds", async () => {
      mockBatchSend.mockResolvedValueOnce({
        data: { data: [{ id: "email_1" }] },
        error: null,
      });

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockSheetAppend).toHaveBeenCalledTimes(1);
    });

    it("still appends to Sheets when Resend throws synchronously (regression)", async () => {
      mockBatchSend.mockImplementationOnce(() => {
        throw new Error("synchronous Resend failure");
      });

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockSheetAppend).toHaveBeenCalledTimes(1);
    });
  });
});
