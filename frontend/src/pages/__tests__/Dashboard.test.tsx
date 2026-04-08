import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../Dashboard";
import type { Snippet } from "@/types";

const snippets: Snippet[] = [
  {
    id: "1",
    title: "Quick Sort",
    code: "def sort(): pass",
    language: "python",
    description: null,
    status: "pending",
    author: { id: "u1", username: "alice" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    review_count: 1,
    comment_count: 0,
  },
  {
    id: "2",
    title: "Binary Search",
    code: "function search() {}",
    language: "javascript",
    description: null,
    status: "approved",
    author: { id: "u2", username: "bob" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    review_count: 2,
    comment_count: 3,
  },
];

vi.mock("@/hooks/useSnippets", () => ({
  useSnippets: vi.fn(),
}));

import { useSnippets } from "@/hooks/useSnippets";
const mockUseSnippets = vi.mocked(useSnippets);

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe("Dashboard", () => {
  it("shows loading state", () => {
    mockUseSnippets.mockReturnValue({
      snippets: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    const { container } = renderDashboard();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders snippet cards when data is loaded", () => {
    mockUseSnippets.mockReturnValue({
      snippets,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderDashboard();
    expect(screen.getByText("Quick Sort")).toBeInTheDocument();
    expect(screen.getByText("Binary Search")).toBeInTheDocument();
  });

  it("shows empty state when no snippets", () => {
    mockUseSnippets.mockReturnValue({
      snippets: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderDashboard();
    expect(screen.getByText("No snippets yet")).toBeInTheDocument();
    expect(screen.getByText("Create your first snippet")).toBeInTheDocument();
  });

  it("filters snippets by search input", async () => {
    const user = userEvent.setup();
    mockUseSnippets.mockReturnValue({
      snippets,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderDashboard();

    await user.type(screen.getByPlaceholderText("Search snippets..."), "Quick");

    expect(screen.getByText("Quick Sort")).toBeInTheDocument();
    expect(screen.queryByText("Binary Search")).not.toBeInTheDocument();
  });

  it("shows error state with retry button", () => {
    const refetch = vi.fn();
    mockUseSnippets.mockReturnValue({
      snippets: [],
      loading: false,
      error: "Failed to load snippets",
      refetch,
    });
    renderDashboard();
    expect(screen.getByText("Failed to load snippets")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("shows 'no match' message when filters exclude everything", async () => {
    const user = userEvent.setup();
    mockUseSnippets.mockReturnValue({
      snippets,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderDashboard();

    await user.type(screen.getByPlaceholderText("Search snippets..."), "zzzzz");

    expect(screen.getByText("No snippets match your filters")).toBeInTheDocument();
  });
});
