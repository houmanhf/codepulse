import { renderHook, waitFor } from "@testing-library/react";
import { useSnippets } from "../useSnippets";

vi.mock("@/api/snippets", () => ({
  listSnippets: vi.fn(),
}));

import { listSnippets } from "@/api/snippets";
const mockListSnippets = vi.mocked(listSnippets);

const mockSnippets = [
  {
    id: "s1",
    title: "Test",
    code: "x = 1",
    language: "python",
    description: null,
    status: "pending" as const,
    author: { id: "u1", username: "alice" },
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    review_count: 0,
    comment_count: 0,
  },
];

describe("useSnippets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches snippets on mount", async () => {
    mockListSnippets.mockResolvedValue(mockSnippets);

    const { result } = renderHook(() => useSnippets());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.snippets).toEqual(mockSnippets);
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    mockListSnippets.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSnippets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.snippets).toEqual([]);
  });

  it("provides a refetch function", async () => {
    mockListSnippets.mockResolvedValue(mockSnippets);

    const { result } = renderHook(() => useSnippets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe("function");
  });
});