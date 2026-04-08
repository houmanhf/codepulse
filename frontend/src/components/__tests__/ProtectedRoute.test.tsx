import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedRoute from "../ProtectedRoute";
import type { LoginRequest, RegisterRequest, User } from "@/types";

const mockUser: User = {
  id: "u1",
  email: "a@b.com",
  username: "alice",
  created_at: "2024-01-01T00:00:00Z",
};

const noop = async () => {};

function renderProtectedRoute(user: User | null, loading: boolean) {
  return render(
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: noop as (data: LoginRequest) => Promise<void>,
        register: noop as (data: RegisterRequest) => Promise<void>,
        logout: () => {},
      }}
    >
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Secret Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("ProtectedRoute", () => {
  it("shows loading spinner while checking auth", () => {
    const { container } = renderProtectedRoute(null, true);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("renders children when user is authenticated", () => {
    renderProtectedRoute(mockUser, false);
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Secret Content")).toBeInTheDocument();
  });

  it("redirects to login when user is not authenticated", () => {
    renderProtectedRoute(null, false);
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });
});