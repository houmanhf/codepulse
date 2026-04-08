import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NewSnippet from "../NewSnippet";

vi.mock("@/api/snippets", () => ({
  createSnippet: vi.fn(),
}));

import { createSnippet } from "@/api/snippets";
const mockCreateSnippet = vi.mocked(createSnippet);

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderNewSnippet() {
  return render(
    <MemoryRouter>
      <NewSnippet />
    </MemoryRouter>
  );
}

describe("NewSnippet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields", () => {
    renderNewSnippet();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Code")).toBeInTheDocument();
    expect(screen.getByText("Description (optional)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Snippet" })
    ).toBeInTheDocument();
  });

  it("renders language selector with options", () => {
    renderNewSnippet();
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("python")).toBeInTheDocument();
    expect(screen.getByText("javascript")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("has required attributes on title and code fields", () => {
    renderNewSnippet();
    const titleInput = screen.getByPlaceholderText(
      "e.g. Binary search implementation"
    );
    const codeInput = screen.getByPlaceholderText("Paste your code here...");
    expect(titleInput).toBeRequired();
    expect(codeInput).toBeRequired();
  });

  it("submits the form and navigates on success", async () => {
    const user = userEvent.setup();
    mockCreateSnippet.mockResolvedValue({
      id: "snippet-1",
      title: "Test",
      code: "x = 1",
      language: "python",
      description: null,
      status: "pending",
      author: { id: "u1", username: "alice" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      review_count: 0,
      comment_count: 0,
    });
    renderNewSnippet();

    await user.type(screen.getByPlaceholderText("e.g. Binary search implementation"), "My Snippet");
    await user.type(screen.getByPlaceholderText("Paste your code here..."), "x = 1");
    await user.click(screen.getByRole("button", { name: "Create Snippet" }));

    await waitFor(() => {
      expect(mockCreateSnippet).toHaveBeenCalledWith({
        title: "My Snippet",
        code: "x = 1",
        language: "python",
        description: undefined,
      });
      expect(mockNavigate).toHaveBeenCalledWith("/snippets/snippet-1");
    });
  });

  it("cancel button navigates home", async () => {
    const user = userEvent.setup();
    renderNewSnippet();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});