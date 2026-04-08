import client from "../client";
import MockAdapter from "axios-mock-adapter";
import { createReview, getReviews, createComment, getComments } from "../reviews";

const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
});

const mockReview = {
  id: "r1",
  snippet_id: "s1",
  reviewer_id: "u1",
  reviewer: { id: "u1", username: "alice" },
  status: "approved",
  body: "LGTM",
  created_at: "2024-01-01",
};

const mockComment = {
  id: "c1",
  snippet_id: "s1",
  author_id: "u1",
  author: { id: "u1", username: "alice" },
  review_id: null,
  line_number: 5,
  body: "Nice",
  created_at: "2024-01-01",
};

describe("reviews API", () => {
  it("createReview posts review data", async () => {
    mock.onPost("/snippets/s1/reviews").reply(201, mockReview);

    const result = await createReview("s1", {
      status: "approved",
      body: "LGTM",
    });
    expect(result.status).toBe("approved");
    expect(result.body).toBe("LGTM");
  });

  it("getReviews returns review list", async () => {
    mock.onGet("/snippets/s1/reviews").reply(200, [mockReview]);

    const result = await getReviews("s1");
    expect(result).toHaveLength(1);
    expect(result[0].reviewer.username).toBe("alice");
  });

  it("createComment posts comment data", async () => {
    mock.onPost("/snippets/s1/comments").reply(201, mockComment);

    const result = await createComment("s1", {
      line_number: 5,
      body: "Nice",
    });
    expect(result.line_number).toBe(5);
    expect(result.body).toBe("Nice");
  });

  it("getComments returns comment list", async () => {
    mock.onGet("/snippets/s1/comments").reply(200, [mockComment]);

    const result = await getComments("s1");
    expect(result).toHaveLength(1);
    expect(result[0].author.username).toBe("alice");
  });

  it("createReview throws on 400 (own snippet)", async () => {
    mock.onPost("/snippets/s1/reviews").reply(400, {
      detail: "Cannot review your own snippet",
    });
    await expect(
      createReview("s1", { status: "approved" })
    ).rejects.toThrow();
  });
});