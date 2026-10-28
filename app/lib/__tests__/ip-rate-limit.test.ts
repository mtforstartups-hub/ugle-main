import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const WORKER_URL = "https://limiter.example.workers.dev";

async function loadModule() {
  return import("../ip-rate-limit");
}

function mockFetch(response: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.stubEnv("RATE_LIMIT_WORKER_URL", WORKER_URL);
  vi.stubEnv("RATE_LIMIT_WORKER_SECRET", "test-secret");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("ip-rate-limit", () => {
  describe("when the worker is not configured", () => {
    it("fails open without making a request", async () => {
      vi.stubEnv("RATE_LIMIT_WORKER_URL", "");
      const fetchMock = mockFetch({ ok: true, json: async () => ({}) });
      const { checkIpRateLimit, claimEmail } = await loadModule();

      const limit = await checkIpRateLimit("203.0.113.9");
      const claim = await claimEmail("a@example.com");

      expect(limit).toEqual({
        allowed: true,
        retryAfterSeconds: 0,
        checked: false,
      });
      expect(claim).toEqual({ durable: false, claimed: false });
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("checkIpRateLimit", () => {
    it("posts the IP with the bearer secret and parses the decision", async () => {
      const fetchMock = mockFetch({
        ok: true,
        json: async () => ({ allowed: false, retryAfter: 90.4 }),
      });
      const { checkIpRateLimit } = await loadModule();

      const result = await checkIpRateLimit("203.0.113.9");

      expect(result).toEqual({
        allowed: false,
        retryAfterSeconds: 90.4,
        checked: true,
      });

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${WORKER_URL}/check`);
      expect(init.headers.authorization).toBe("Bearer test-secret");
      expect(JSON.parse(init.body)).toEqual({
        key: "203.0.113.9",
        namespace: "ip",
      });
    });

    it("fails open on a non-2xx response", async () => {
      mockFetch({ ok: false, status: 500 });
      const { checkIpRateLimit } = await loadModule();

      const result = await checkIpRateLimit("203.0.113.9");

      expect(result.allowed).toBe(true);
      expect(result.checked).toBe(false);
    });

    it("fails open on a network error", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
      const { checkIpRateLimit } = await loadModule();

      const result = await checkIpRateLimit("203.0.113.9");

      expect(result.allowed).toBe(true);
      expect(result.checked).toBe(false);
    });

    it("fails open on an unparseable body", async () => {
      mockFetch({ ok: true, json: async () => null });
      const { checkIpRateLimit } = await loadModule();

      expect((await checkIpRateLimit("203.0.113.9")).checked).toBe(false);
    });
  });

  describe("checkEmailRateLimit", () => {
    it("uses the email namespace and the configured 3/hour limit", async () => {
      const fetchMock = mockFetch({
        ok: true,
        json: async () => ({ allowed: true, retryAfter: 0 }),
      });
      const { checkEmailRateLimit } = await loadModule();

      const result = await checkEmailRateLimit("johndoe@gmail.com");

      expect(result).toEqual({
        allowed: true,
        retryAfterSeconds: 0,
        checked: true,
      });

      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
        key: "johndoe@gmail.com",
        namespace: "email",
        hourlyLimit: 3,
        dailyLimit: 6,
      });
    });
  });

  describe("claimEmail", () => {
    it("reports a successful reservation", async () => {
      const fetchMock = mockFetch({
        ok: true,
        json: async () => ({ claimed: true }),
      });
      const { claimEmail } = await loadModule();

      const result = await claimEmail("johndoe@gmail.com");

      expect(result).toEqual({ durable: true, claimed: true });
      expect(fetchMock.mock.calls[0][0]).toBe(`${WORKER_URL}/claim`);
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
        key: "johndoe@gmail.com",
        namespace: "email",
      });
    });

    it("reports an existing reservation as durable and not claimed", async () => {
      mockFetch({ ok: true, json: async () => ({ claimed: false }) });
      const { claimEmail } = await loadModule();

      expect(await claimEmail("johndoe@gmail.com")).toEqual({
        durable: true,
        claimed: false,
      });
    });

    it("falls back when the worker has not been redeployed (404)", async () => {
      mockFetch({ ok: false, status: 404 });
      const { claimEmail } = await loadModule();

      expect(await claimEmail("johndoe@gmail.com")).toEqual({
        durable: false,
        claimed: false,
      });
    });

    it("falls back on an unexpected response shape", async () => {
      mockFetch({ ok: true, json: async () => ({ ok: true }) });
      const { claimEmail } = await loadModule();

      expect(await claimEmail("johndoe@gmail.com")).toEqual({
        durable: false,
        claimed: false,
      });
    });
  });

  describe("releaseEmailClaim", () => {
    it("posts a release for the normalized email", async () => {
      const fetchMock = mockFetch({ ok: true, json: async () => ({}) });
      const { releaseEmailClaim } = await loadModule();

      await releaseEmailClaim("johndoe@gmail.com");

      expect(fetchMock.mock.calls[0][0]).toBe(`${WORKER_URL}/release`);
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
        key: "johndoe@gmail.com",
        namespace: "email",
      });
    });
  });
});
