import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import Register from "../Register";
import type { LoginRequest, RegisterRequest } from "@/types";
import { AxiosError } from "axios";

const noop = async () => {};

function renderRegister(
  registerFn = noop as (data: RegisterRequest) => Promise<void>
) {
  return render(
    <AuthContext.Provider
      value={{
        user: null,
        loading: false,
        login: noop as (data: LoginRequest) => Promise<void>,
        register: registerFn,
        logout: () => {},
      }}
    >
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Register", () => {
  it("renders all form fields and submit button", () => {
    renderRegister();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" })
    ).toBeInTheDocument();
  });

  it("shows error when passwords don't match", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(document.querySelector('input[type="email"]')!, "a@b.com");
    await user.type(document.querySelector('input[type="text"]')!, "alice");
    const passwordFields = document.querySelectorAll('input[type="password"]');
    await user.type(passwordFields[0], "password123");
    await user.type(passwordFields[1], "different456");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });
  });

  it("shows error when password is too short", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(document.querySelector('input[type="email"]')!, "a@b.com");
    await user.type(document.querySelector('input[type="text"]')!, "alice");
    const passwordFields = document.querySelectorAll('input[type="password"]');
    await user.type(passwordFields[0], "short");
    await user.type(passwordFields[1], "short");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters")
      ).toBeInTheDocument();
    });
  });

  it("calls register with form values on valid submit", async () => {
    const user = userEvent.setup();
    const registerFn = vi.fn().mockResolvedValue(undefined);
    renderRegister(registerFn);

    await user.type(document.querySelector('input[type="email"]')!, "a@b.com");
    await user.type(document.querySelector('input[type="text"]')!, "alice");
    const passwordFields = document.querySelectorAll('input[type="password"]');
    await user.type(passwordFields[0], "secret123");
    await user.type(passwordFields[1], "secret123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(registerFn).toHaveBeenCalledWith({
        email: "a@b.com",
        username: "alice",
        password: "secret123",
      });
    });
  });

  it("shows API error on failed registration", async () => {
    const user = userEvent.setup();
    const error = new AxiosError("fail", "409", undefined, undefined, {
      status: 409,
      data: { detail: "Email already registered" },
      statusText: "Conflict",
      headers: {},
      config: {} as any,
    });
    const registerFn = vi.fn().mockRejectedValue(error);
    renderRegister(registerFn);

    await user.type(document.querySelector('input[type="email"]')!, "a@b.com");
    await user.type(document.querySelector('input[type="text"]')!, "alice");
    const passwordFields = document.querySelectorAll('input[type="password"]');
    await user.type(passwordFields[0], "secret123");
    await user.type(passwordFields[1], "secret123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(
        screen.getByText("Email already registered")
      ).toBeInTheDocument();
    });
  });

  it("shows generic error for non-axios errors", async () => {
    const user = userEvent.setup();
    const registerFn = vi.fn().mockRejectedValue(new Error("network down"));
    renderRegister(registerFn);

    await user.type(document.querySelector('input[type="email"]')!, "a@b.com");
    await user.type(document.querySelector('input[type="text"]')!, "alice");
    const passwordFields = document.querySelectorAll('input[type="password"]');
    await user.type(passwordFields[0], "secret123");
    await user.type(passwordFields[1], "secret123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  it("has a link to sign in", () => {
    renderRegister();
    const link = screen.getByText("Sign in");
    expect(link).toHaveAttribute("href", "/login");
  });
});