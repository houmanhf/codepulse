import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import type { User, LoginRequest, RegisterRequest } from "@/types";

// We test the routing logic by rendering route content via AuthContext
// rather than importing App (which wraps its own Router + AuthProvider)

import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

const mockUser: User = {
  id: "u1",
  email: "a@b.com",
  username: "alice",
  created_at: "2024-01-01",
};

const noop = async () => {};

function renderWithAuth(
  user: User | null,
  element: React.ReactNode,
  route = "/"
) {
  return render(
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        login: noop as (data: LoginRequest) => Promise<void>,
        register: noop as (data: RegisterRequest) => Promise<void>,
        logout: () => {},
      }}
    >
      <MemoryRouter initialEntries={[route]}>{element}</MemoryRouter>
    </AuthContext.Provider>
  );
}

vi.mock("@/hooks/useSnippets", () => ({
  useSnippets: () => ({
    snippets: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe("App routing", () => {
  it("login page renders for unauthenticated users", () => {
    renderWithAuth(null, <Login />, "/login");
    expect(
      screen.getByRole("button", { name: "Sign in" })
    ).toBeInTheDocument();
  });

  it("protected route redirects unauthenticated users", () => {
    renderWithAuth(
      null,
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>,
      "/"
    );
    expect(screen.queryByText("No snippets yet")).not.toBeInTheDocument();
  });

  it("protected route shows content for authenticated users", async () => {
    renderWithAuth(
      mockUser,
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>,
      "/"
    );

    await waitFor(() => {
      expect(screen.getByText("No snippets yet")).toBeInTheDocument();
    });
  });
});