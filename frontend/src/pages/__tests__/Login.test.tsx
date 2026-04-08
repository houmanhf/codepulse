import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import Login from "../Login";
import type { LoginRequest, RegisterRequest } from "@/types";
import { AxiosError } from "axios";

const noop = async () => {};

function renderLogin(loginFn = noop as (data: LoginRequest) => Promise<void>) {
  return render(
    <AuthContext.Provider
      value={{
        user: null,
        loading: false,
        login: loginFn,
        register: noop as (data: RegisterRequest) => Promise<void>,
        logout: () => {},
      }}
    >
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

function emailInput() {
  return document.querySelector('input[type="email"]') as HTMLInputElement;
}

function passwordInput() {
  return document.querySelector('input[type="password"]') as HTMLInputElement;
}

describe("Login", () => {
  it("renders email and password fields", () => {
    renderLogin();
    expect(emailInput()).toBeInTheDocument();
    expect(passwordInput()).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("calls login with form values on submit", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    renderLogin(login);

    await user.type(emailInput(), "test@example.com");
    await user.type(passwordInput(), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "secret123",
      });
    });
  });

  it("shows error message on failed login", async () => {
    const user = userEvent.setup();
    const error = new AxiosError("fail", "400", undefined, undefined, {
      status: 400,
      data: { detail: "Invalid credentials" },
      statusText: "Bad Request",
      headers: {},
      config: {} as any,
    });
    const login = vi.fn().mockRejectedValue(error);
    renderLogin(login);

    await user.type(emailInput(), "bad@example.com");
    await user.type(passwordInput(), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("shows generic error for non-axios errors", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new Error("network down"));
    renderLogin(login);

    await user.type(emailInput(), "a@b.com");
    await user.type(passwordInput(), "x");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });
});