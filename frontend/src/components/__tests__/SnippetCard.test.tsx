import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SnippetCard from "../SnippetCard";
import type { Snippet } from "@/types";

const snippet: Snippet = {
  id: "abc-123",
  title: "Fibonacci Generator",
  code: "def fib(n): pass",
  language: "python",
  description: "A simple fibonacci implementation",
  status: "approved",
  author: { id: "u1", username: "alice" },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  review_count: 3,
  comment_count: 5,
};

function renderCard(overrides: Partial<Snippet> = {}) {
  return render(
    <MemoryRouter>
      <SnippetCard snippet={{ ...snippet, ...overrides }} />
    </MemoryRouter>
  );
}

describe("SnippetCard", () => {
  it("renders title, language, author, and status", () => {
    renderCard();
    expect(screen.getByText("Fibonacci Generator")).toBeInTheDocument();
    expect(screen.getByText("python")).toBeInTheDocument();
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("shows review and comment counts", () => {
    renderCard();
    expect(screen.getByText("3 reviews")).toBeInTheDocument();
    expect(screen.getByText("5 comments")).toBeInTheDocument();
  });

  it("links to the correct detail page", () => {
    renderCard();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/snippets/abc-123");
  });

  it("renders description when present", () => {
    renderCard();
    expect(screen.getByText("A simple fibonacci implementation")).toBeInTheDocument();
  });

  it("omits description when null", () => {
    renderCard({ description: null });
    expect(screen.queryByText("A simple fibonacci implementation")).not.toBeInTheDocument();
  });
});
