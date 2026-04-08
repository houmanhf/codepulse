import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useAuth } from "../useAuth";
import { AuthContext } from "@/context/AuthContext";
import type { LoginRequest, RegisterRequest } from "@/types";

describe("useAuth", () => {
  it("returns context values when used inside AuthProvider", () => {
    const value = {
      user: { id: "1", email: "a@b.com", username: "alice", created_at: "" },
      loading: false,
      login: async (_d: LoginRequest) => {},
      register: async (_d: RegisterRequest) => {},
      logout: () => {},
    };

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(AuthContext.Provider, { value }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user?.username).toBe("alice");
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
  });

  it("throws when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within AuthProvider");
  });
});
