import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import Navbar from "../Navbar";
import type { User, LoginRequest, RegisterRequest } from "@/types";

const mockUser: User = {
  id: "u1",
  email: "alice@test.com",
  username: "alice",
  created_at: "2024-01-01T00:00:00Z",
};

const noop = async () => {};

function renderNavbar(user: User | null) {
  const logout = vi.fn();
  render(
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        login: noop as (data: LoginRequest) => Promise<void>,
        register: noop as (data: RegisterRequest) => Promise<void>,
        logout,
      }}
    >
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </AuthContext.Provider>
  );
  return { logout };
}

describe("Navbar", () => {
  it("shows the brand name", () => {
    renderNavbar(null);
    expect(screen.getByText("CodePulse")).toBeInTheDocument();
  });

  it("shows navigation links when authenticated", () => {
    renderNavbar(mockUser);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("New Snippet")).toBeInTheDocument();
    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  it("hides navigation links when not authenticated", () => {
    renderNavbar(null);
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("New Snippet")).not.toBeInTheDocument();
  });

  it("calls logout when log out button is clicked", async () => {
    const user = userEvent.setup();
    const { logout } = renderNavbar(mockUser);
    await user.click(screen.getByText("Log out"));
    expect(logout).toHaveBeenCalled();
  });
});
