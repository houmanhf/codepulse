import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, AuthContext } from "../AuthContext";
import { useContext } from "react";

vi.mock("@/api/auth", () => ({
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
}));

import * as authApi from "@/api/auth";
const mockGetMe = vi.mocked(authApi.getMe);

function TestConsumer() {
  const ctx = useContext(AuthContext);
  if (!ctx) return <div>No context</div>;
  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="user">{ctx.user?.username ?? "none"}</span>
      <button onClick={ctx.logout}>Logout</button>
      <button
        onClick={() => ctx.login({ email: "a@b.com", password: "pass" })}
      >
        Login
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("starts with no user and loading=true, then resolves", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("loads user from token on mount", async () => {
    localStorage.setItem("token", "existing-token");
    mockGetMe.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      username: "alice",
      created_at: "2024-01-01",
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("alice");
    });
  });

  it("clears token on mount if getMe fails", async () => {
    localStorage.setItem("token", "bad-token");
    mockGetMe.mockRejectedValue(new Error("Invalid"));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("logout clears user and token", async () => {
    localStorage.setItem("token", "token");
    mockGetMe.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      username: "alice",
      created_at: "2024-01-01",
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("alice");
    });

    act(() => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(localStorage.getItem("token")).toBeNull();
  });
});