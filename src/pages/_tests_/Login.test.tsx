// src/pages/_tests_/Login.test.tsx
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import Login from "@/pages/Login";

//mock toasts
vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: { success: vi.fn(), error: vi.fn(), promise: vi.fn(), dismiss: vi.fn() },
}));
import { toast } from "sonner";

//mock navigate
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return { ...actual, useNavigate: () => navigateMock };
});

const renderLogin = () => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  const submitBtn = screen
    .getAllByRole("button", { name: /login/i })
    .find((btn) => !!btn.closest("form")) as HTMLButtonElement | undefined;

  if (!submitBtn) throw new Error("Could not find login submit button inside a form");

  const formEl = submitBtn.closest("form") as HTMLFormElement;
  const form = within(formEl);
  return { formEl, form, submitBtn };
};

beforeEach(() => {
  localStorage.clear();
  navigateMock.mockClear();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("Login page", () => {
  // TC1: UI rendering
  it("UI renders inputs and Login button (no navigation)", () => {
    const { form, submitBtn } = renderLogin();
    expect(form.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(form.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  // TC2: Form validation (empty fields)
  it("form validation blocks submit and shows toast when fields are empty (no navigation)", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch");
    const { formEl, submitBtn } = renderLogin();

    formEl.noValidate = true;

    await user.click(submitBtn);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect((toast as any).error).toHaveBeenCalledWith(
      expect.stringMatching(/please enter username and password/i)
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });

  // TC3: Button click + navigation (success)
  it("successful login stores token, shows success toast, and navigates to /dashboard", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ token: "abc123", username: "jey" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const user = userEvent.setup();
    const { form, submitBtn } = renderLogin();

    await user.type(form.getByPlaceholderText(/username/i), "jey");
    await user.type(form.getByPlaceholderText(/password/i), "pw");
    await user.click(submitBtn);

    expect(localStorage.getItem("token")).toBe("abc123");
    expect(localStorage.getItem("username")).toBe("jey");
    expect((toast as any).success).toHaveBeenCalledWith(
      expect.stringMatching(/logged in successfully/i)
    );
    expect(navigateMock).toHaveBeenCalledWith("/dashboard");
  });
});
