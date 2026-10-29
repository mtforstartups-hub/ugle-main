// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import GetAccessForm from "../GetAccessForm";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { mockAction, mockReset, nav } = vi.hoisted(() => ({
  mockAction: vi.fn(),
  mockReset: vi.fn(),
  nav: { platform: null as string | null },
}));

vi.mock("@/app/actions/request-trial", () => ({
  requestTrial: mockAction,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(nav.platform ? `platform=${nav.platform}` : ""),
}));

vi.mock("motion/react", async () => {
  const React = await import("react");

  const MotionDiv = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }
  >(function MotionDiv({ children, initial, animate, transition, ...rest }, ref) {
    void initial;
    void animate;
    void transition;
    return (
      <div ref={ref} {...rest}>
        {children}
      </div>
    );
  });

  return { motion: { div: MotionDiv } };
});

vi.mock("@marsidev/react-turnstile", async () => {
  const React = await import("react");

  const Turnstile = React.forwardRef(function MockTurnstile(
    _props: { siteKey: string; options?: unknown; onError?: () => void; onExpire?: () => void },
    ref: React.Ref<{ reset: () => void }>,
  ) {
    React.useImperativeHandle(ref, () => ({ reset: mockReset }));
    return <input type="hidden" name="cf-turnstile-response" defaultValue="mock-token" />;
  });

  return { Turnstile };
});

let container: HTMLDivElement;
let root: Root;

function getForm(): HTMLFormElement {
  const form = container.querySelector("form");
  if (!form) throw new Error("form not rendered");
  return form;
}

function setValue(name: string, value: string) {
  const input = getForm().querySelector<HTMLInputElement>(`[name="${name}"]`);
  if (!input) throw new Error(`input ${name} not found`);
  input.value = value;
}

async function render() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root.render(<GetAccessForm />);
  });
}

async function submitForm() {
  await act(async () => {
    getForm().requestSubmit();
  });
}

function fillValidForm() {
  setValue("firstName", "Alex");
  setValue("lastName", "Rivera");
  setValue("email", "alex@example.com");
  setValue("phone", "+1 415-555-0134");
  const windows = getForm().querySelector<HTMLInputElement>('input[name="os"][value="Windows"]');
  if (!windows) throw new Error("OS radio missing");
  windows.checked = true;
}

beforeEach(async () => {
  mockAction.mockReset();
  mockReset.mockClear();
  nav.platform = null;
  await render();
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
});

describe("GetAccessForm", () => {
  it("renders all required fields with associated labels", () => {
    for (const name of ["firstName", "lastName", "email", "phone"]) {
      const input = getForm().querySelector(`[name="${name}"]`);
      expect(input).toBeTruthy();
      expect(input?.hasAttribute("required")).toBe(true);
      expect(document.querySelector(`label[for="${input?.id}"]`)).toBeTruthy();
    }

    const radios = getForm().querySelectorAll('input[name="os"]');
    expect(radios).toHaveLength(2);
  });

  it("renders the honeypot field hidden from users and assistive tech", () => {
    const honeypot = getForm().querySelector<HTMLInputElement>(
      'input[name="ugle-honeypot"]',
    );
    expect(honeypot).toBeTruthy();
    expect(honeypot?.closest("[aria-hidden='true']")).toBeTruthy();
    expect(honeypot?.tabIndex).toBe(-1);
  });

  it("renders the Turnstile widget when a site key is configured", () => {
    const token = getForm().querySelector('input[name="cf-turnstile-response"]');
    expect(token).toBeTruthy();
  });

  it("submits the entered values (including a manually selected OS)", async () => {
    mockAction.mockResolvedValueOnce({ success: true, message: "Request submitted" });

    fillValidForm();
    await submitForm();

    expect(mockAction).toHaveBeenCalledTimes(1);
    const formData = mockAction.mock.calls[0][1] as FormData;
    expect(formData.get("firstName")).toBe("Alex");
    expect(formData.get("lastName")).toBe("Rivera");
    expect(formData.get("email")).toBe("alex@example.com");
    expect(formData.get("phone")).toBe("+1 415-555-0134");
    expect(formData.get("os")).toBe("Windows");
    expect(formData.get("cf-turnstile-response")).toBe("mock-token");
  });

  it("pre-selects macOS from ?platform=macos", async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    nav.platform = "macos";
    await render();

    const macos = getForm().querySelector<HTMLInputElement>(
      'input[name="os"][value="macOS"]',
    );
    const windows = getForm().querySelector<HTMLInputElement>(
      'input[name="os"][value="Windows"]',
    );

    expect(macos?.checked).toBe(true);
    expect(windows?.checked).toBe(false);
  });

  it("pre-selects Windows from ?platform=windows", async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    nav.platform = "windows";
    await render();

    const windows = getForm().querySelector<HTMLInputElement>(
      'input[name="os"][value="Windows"]',
    );
    expect(windows?.checked).toBe(true);
  });

  it("shows the success state and removes the form after submission", async () => {
    mockAction.mockResolvedValueOnce({ success: true, message: "Request submitted" });

    fillValidForm();
    await submitForm();

    expect(container.querySelector("form")).toBeNull();
    expect(
      container.querySelector("h2")?.textContent,
    ).toBe("Request Received");
    expect(container.textContent).toMatch(/check your inbox for your trial license key/i);
  });

  it("shows a server error in an alert and does not show success", async () => {
    mockAction.mockResolvedValueOnce({
      success: false,
      message: "A trial has already been requested with this email.",
      error: "A trial has already been requested with this email.",
    });

    fillValidForm();
    await submitForm();

    const alert = container.querySelector("[role='alert']");
    expect(alert?.textContent).toMatch(/already been requested/i);
    expect(container.querySelector("form")).toBeTruthy();
    expect(container.textContent).not.toMatch(/Request Received/);
  });

  it("resets the Turnstile token after a failed submission", async () => {
    mockAction.mockResolvedValueOnce({
      success: false,
      message: "Verification failed. Please try again.",
      error: "Verification failed. Please try again.",
    });

    fillValidForm();
    await submitForm();

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("does not reset the Turnstile token after a successful submission", async () => {
    mockAction.mockResolvedValueOnce({ success: true, message: "Request submitted" });

    fillValidForm();
    await submitForm();

    expect(mockReset).not.toHaveBeenCalled();
  });

  it("disables the submit button and shows a pending label while in flight", async () => {
    let resolveAction!: (value: { success: boolean; message: string }) => void;
    mockAction.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveAction = resolve;
      }),
    );

    fillValidForm();
    await submitForm();

    const button = container.querySelector("button[type='submit']");
    expect(button?.hasAttribute("disabled")).toBe(true);
    expect(button?.textContent).toBe("Submitting…");

    await act(async () => {
      resolveAction({ success: true, message: "Request submitted" });
    });

    expect(container.querySelector("button[type='submit']")).toBeNull();
  });
});
