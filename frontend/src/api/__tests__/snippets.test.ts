import client from "../client";
import MockAdapter from "axios-mock-adapter";
import {
  listSnippets,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
} from "../snippets";

const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
});

const mockSnippet = {
  id: "s1",
  title: "Test",
  code: "x = 1",
  language: "python",
  description: null,
  status: "pending",
  author: { id: "u1", username: "alice" },
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  review_count: 0,
  comment_count: 0,
};

describe("snippets API", () => {
  it("listSnippets returns array of snippets", async () => {
    mock.onGet("/snippets").reply(200, { snippets: [mockSnippet] });

    const result = await listSnippets();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Test");
  });

  it("getSnippet returns snippet detail", async () => {
    const detail = { ...mockSnippet, reviews: [], comments: [] };
    mock.onGet("/snippets/s1").reply(200, detail);

    const result = await getSnippet("s1");
    expect(result.title).toBe("Test");
    expect(result.reviews).toEqual([]);
  });

  it("createSnippet posts data and returns snippet", async () => {
    mock.onPost("/snippets").reply(201, mockSnippet);

    const result = await createSnippet({
      title: "Test",
      code: "x = 1",
      language: "python",
    });
    expect(result.id).toBe("s1");
  });

  it("updateSnippet puts partial data", async () => {
    const updated = { ...mockSnippet, title: "Updated" };
    mock.onPut("/snippets/s1").reply(200, updated);

    const result = await updateSnippet("s1", { title: "Updated" });
    expect(result.title).toBe("Updated");
  });

  it("deleteSnippet sends DELETE request", async () => {
    mock.onDelete("/snippets/s1").reply(204);

    await deleteSnippet("s1");
    expect(mock.history.delete).toHaveLength(1);
  });

  it("listSnippets throws on server error", async () => {
    mock.onGet("/snippets").reply(500);
    await expect(listSnippets()).rejects.toThrow();
  });

  it("getSnippet throws on 404", async () => {
    mock.onGet("/snippets/nonexistent").reply(404);
    await expect(getSnippet("nonexistent")).rejects.toThrow();
  });
});