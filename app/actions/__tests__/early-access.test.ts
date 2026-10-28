import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestEarlyAccess } from "../early-access";
import { verifyTurnstile } from "@/app/lib/turnstile";

const {
  mockBatchSend,
  mockSheetAppend,
  mockSheetEmails,
  mockGetClientIp,
  mockCheckIpRateLimit,
  mockCheckEmailRateLimit,
  mockClaimEmail,
  mockConfirmEmailClaim,
  mockReleaseEmailClaim,
} = vi.hoisted(() => ({
  mockBatchSend: vi.fn().mockResolvedValue({
    data: { data: [{ id: "email_1" }, { id: "email_2" }] },
    error: null,
  }),
  mockSheetAppend: vi.fn().mockResolvedValue(undefined),
  mockSheetEmails: vi.fn().mockResolvedValue([] as string[]),
  mockGetClientIp: vi.fn().mockResolvedValue("198.51.100.42"),
  mockCheckIpRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    retryAfterSeconds: 0,
    checked: true,
  }),
  mockCheckEmailRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    retryAfterSeconds: 0,
    checked: false,
  }),
  mockClaimEmail: vi
    .fn()
    .mockResolvedValue({ durable: false, claimed: false }),
  mockConfirmEmailClaim: vi
    .fn()
    .mockResolvedValue({ durable: true, confirmed: true }),
  mockReleaseEmailClaim: vi.fn().mockResolvedValue(undefined),
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
    emails = mockSheetEmails;
  },
}));

vi.mock("@/app/lib/turnstile", () => ({
  verifyTurnstile: vi.fn().mockResolvedValue(true),
}));

// NOTE: honeypot, validation, disposable-email, email-identity and rate-limit
// are intentionally NOT mocked - these tests exercise the real behaviour.

vi.mock("@/app/lib/client-ip", () => ({
  getClientIp: mockGetClientIp,
}));

vi.mock("@/app/lib/ip-rate-limit", () => ({
  checkIpRateLimit: mockCheckIpRateLimit,
  checkEmailRateLimit: mockCheckEmailRateLimit,
  claimEmail: mockClaimEmail,
  confirmEmailClaim: mockConfirmEmailClaim,
  releaseEmailClaim: mockReleaseEmailClaim,
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
  beforeEach(() => {
    vi.clearAllMocks();
    mockBatchSend.mockResolvedValue({
      data: { data: [{ id: "email_1" }, { id: "email_2" }] },
      error: null,
    });
    mockSheetAppend.mockResolvedValue(undefined);
    mockSheetEmails.mockResolvedValue([]);
    mockGetClientIp.mockResolvedValue("198.51.100.42");
    mockCheckIpRateLimit.mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0,
      checked: true,
    });
    mockCheckEmailRateLimit.mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0,
      checked: false,
    });
    mockClaimEmail.mockResolvedValue({ durable: false, claimed: false });
    mockConfirmEmailClaim.mockResolvedValue({
      durable: true,
      confirmed: true,
    });
    mockReleaseEmailClaim.mockResolvedValue(undefined);
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
  });

  describe("happy path", () => {
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

    it("rejects disposable email addresses", async () => {
      const result = await submit(validFormData({ email: "someone@mailinator.com" }));

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/disposable email addresses aren't accepted/i);
      expect(mockBatchSend).not.toHaveBeenCalled();
      expect(mockSheetAppend).not.toHaveBeenCalled();
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

  describe("duplicate prevention", () => {
    it("rejects an email that has already requested a trial", async () => {
      mockSheetEmails.mockResolvedValueOnce(["david@creative.studio"]);

      const result = await submit(validFormData());

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/already been requested/i);
      expect(mockBatchSend).not.toHaveBeenCalled();
      expect(mockSheetAppend).not.toHaveBeenCalled();
    });

    it("treats provider aliases as the same inbox", async () => {
      // Gmail ignores dots and +tags: all of these are the same mailbox.
      mockSheetEmails.mockResolvedValueOnce(["John.Doe+trial@gmail.com"]);

      const result = await submit(validFormData({ email: "johndoe@gmail.com" }));

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/already been requested/i);
    });

    it("fails open when the duplicate lookup itself errors", async () => {
      mockSheetEmails.mockRejectedValueOnce(new Error("Sheets read failed"));

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockSheetAppend).toHaveBeenCalledTimes(1);
    });

    it("rejects a duplicate atomically from the durable claim store", async () => {
      mockClaimEmail.mockResolvedValueOnce({ durable: true, claimed: false });

      const result = await submit(validFormData());

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/already been requested/i);
      // No expensive full-column Sheets read is needed.
      expect(mockSheetEmails).not.toHaveBeenCalled();
      expect(mockBatchSend).not.toHaveBeenCalled();
    });

    it("skips the O(n) Sheets scan when the claim store answered", async () => {
      mockClaimEmail.mockResolvedValueOnce({ durable: true, claimed: true });

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockSheetEmails).not.toHaveBeenCalled();
      expect(mockSheetAppend).toHaveBeenCalledTimes(1);
    });

    it("protects duplicates even when Sheets is not the claim authority", async () => {
      // Sheets isn't consulted at all once the durable store answers.
      mockClaimEmail.mockResolvedValueOnce({ durable: true, claimed: false });
      mockSheetEmails.mockRejectedValueOnce(new Error("Sheets down"));

      const result = await submit(validFormData());

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/already been requested/i);
    });

    it("claims provisionally so a crashed request cannot block the inbox for months", async () => {
      mockClaimEmail.mockResolvedValueOnce({ durable: true, claimed: true });

      await submit(validFormData());

      expect(mockClaimEmail).toHaveBeenCalledWith("david@creative.studio", {
        provisional: true,
      });
    });

    it("does not confirm the claim when the email was already taken", async () => {
      mockClaimEmail.mockResolvedValueOnce({ durable: true, claimed: false });

      await submit(validFormData());

      expect(mockConfirmEmailClaim).not.toHaveBeenCalled();
    });
  });

  describe("rate limiting", () => {
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

    it("uses the durable per-email limiter across instances", async () => {
      mockCheckEmailRateLimit.mockResolvedValueOnce({
        allowed: false,
        retryAfterSeconds: 600,
        checked: true,
      });

      const result = await submit(validFormData());

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/wait an hour/i);
      expect(mockClaimEmail).not.toHaveBeenCalled();
    });

    it("limits repeated submissions from aliases of the same inbox", async () => {
      // The duplicate check is mocked to return no rows, so only the per-email
      // limiter can stop the fourth alias.
      for (const alias of ["john+1@gmail.com", "john+2@gmail.com", "john+3@gmail.com"]) {
        const ok = await submit(validFormData({ email: alias }));
        expect(ok.success).toBe(true);
      }

      const blocked = await submit(validFormData({ email: "john+4@gmail.com" }));

      expect(blocked.success).toBe(false);
      expect(blocked.error).toMatch(/wait an hour/i);
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

    it("returns an error only when both integrations fail", async () => {
      mockBatchSend.mockRejectedValueOnce(new Error("Resend down"));
      mockSheetAppend.mockRejectedValueOnce(new Error("Sheets down"));

      const result = await submit(validFormData());

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/wrong/i);
    });

    it("releases the durable claim when nothing captured the lead", async () => {
      mockClaimEmail.mockResolvedValueOnce({ durable: true, claimed: true });
      mockBatchSend.mockRejectedValueOnce(new Error("Resend down"));
      mockSheetAppend.mockRejectedValueOnce(new Error("Sheets down"));

      const result = await submit(validFormData());

      expect(result.success).toBe(false);
      expect(mockReleaseEmailClaim).toHaveBeenCalledWith("david@creative.studio");
      // A released claim must never be promoted.
      expect(mockConfirmEmailClaim).not.toHaveBeenCalled();
    });

    it("keeps the durable claim when the lead was captured", async () => {
      mockClaimEmail.mockResolvedValueOnce({ durable: true, claimed: true });
      mockSheetAppend.mockRejectedValueOnce(new Error("Sheets down"));

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockReleaseEmailClaim).not.toHaveBeenCalled();
    });

    it("confirms the provisional claim once the lead is captured", async () => {
      mockClaimEmail.mockResolvedValueOnce({ durable: true, claimed: true });

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockConfirmEmailClaim).toHaveBeenCalledWith(
        "david@creative.studio",
      );
    });

    it("confirms when only the email was delivered", async () => {
      mockClaimEmail.mockResolvedValueOnce({ durable: true, claimed: true });
      mockSheetAppend.mockRejectedValueOnce(new Error("Sheets down"));

      await submit(validFormData());

      expect(mockConfirmEmailClaim).toHaveBeenCalledTimes(1);
    });

    it("still succeeds when confirmation fails", async () => {
      mockClaimEmail.mockResolvedValueOnce({ durable: true, claimed: true });
      mockConfirmEmailClaim.mockResolvedValueOnce({
        durable: true,
        confirmed: false,
      });

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
    });

    it("does not confirm when the claim store was unavailable", async () => {
      // Fallback path: nothing was reserved, so there is nothing to promote.
      mockClaimEmail.mockResolvedValueOnce({ durable: false, claimed: false });

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockConfirmEmailClaim).not.toHaveBeenCalled();
      expect(mockReleaseEmailClaim).not.toHaveBeenCalled();
    });

    it("treats a truncated Resend batch response as an email failure", async () => {
      // Strict validation should send both, but only one ID returned means one
      // recipient did not get their email.
      mockBatchSend.mockResolvedValueOnce({
        data: { data: [{ id: "email_1" }] },
        error: null,
      });

      const result = await submit(validFormData());

      // Sheets still captured the lead, so the request succeeds...
      expect(result.success).toBe(true);
      expect(mockSheetAppend).toHaveBeenCalledTimes(1);
    });

    it("fails and releases the claim when the batch is truncated and Sheets fails", async () => {
      mockClaimEmail.mockResolvedValueOnce({ durable: true, claimed: true });
      mockBatchSend.mockResolvedValueOnce({
        data: { data: [{ id: "email_1" }] },
        error: null,
      });
      mockSheetAppend.mockRejectedValueOnce(new Error("Sheets down"));

      const result = await submit(validFormData());

      expect(result.success).toBe(false);
      expect(mockReleaseEmailClaim).toHaveBeenCalledTimes(1);
    });

    it("still appends to Sheets when Resend throws synchronously (regression)", async () => {
      // A synchronous throw while building the Resend call must not abort the
      // whole Promise.allSettled block and skip Sheets.
      mockBatchSend.mockImplementationOnce(() => {
        throw new Error("synchronous Resend failure");
      });

      const result = await submit(validFormData());

      expect(result.success).toBe(true);
      expect(mockSheetAppend).toHaveBeenCalledTimes(1);
    });
  });
});
