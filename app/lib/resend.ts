import { Resend } from "resend";
import { resendConfig } from "@/app/lib/env";

export function getResendClient(): {
  batch: {
    send: (
      payload: Parameters<Resend["batch"]["send"]>[0],
    ) => ReturnType<Resend["batch"]["send"]>;
  };
} | null {
  if (!resendConfig.success) {
    return null;
  }

  // If a mock test key is supplied (e.g. in CI Playwright E2E runs), simulate
  // successful delivery without calling the external Resend API (which rejects fake keys).
  // In Vitest (process.env.VITEST === "true"), Resend is mocked at module level.
  if (
    (resendConfig.data.RESEND_API_KEY.startsWith("re_test_mock") ||
      resendConfig.data.RESEND_API_KEY.startsWith("re_test_xxx")) &&
    process.env.VITEST !== "true"
  ) {
    return {
      batch: {
        send: async () => ({
          data: {
            data: [{ id: "mock_batch_1" }, { id: "mock_batch_2" }],
          } as never,
          error: null,
        }),
      },
    };
  }

  return new Resend(resendConfig.data.RESEND_API_KEY);
}
