import { render, screen } from "@testing-library/react";
import CommentThread from "../CommentThread";
import type { Comment } from "@/types";

const comment: Comment = {
  id: "c1",
  author: { id: "u1", username: "alice" },
  line_number: 5,
  body: "Consider using a guard clause here",
  created_at: "2024-06-15T10:30:00Z",
};

describe("CommentThread", () => {
  it("renders the author username", () => {
    render(<CommentThread comment={comment} />);
    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  it("renders the comment body", () => {
    render(<CommentThread comment={comment} />);
    expect(
      screen.getByText("Consider using a guard clause here")
    ).toBeInTheDocument();
  });

  it("renders the formatted date", () => {
    render(<CommentThread comment={comment} />);
    const dateText = screen.getByText(/Jun/);
    expect(dateText).toBeInTheDocument();
  });

  it("renders multiline comment body", () => {
    const multiline: Comment = {
      ...comment,
      body: "Line 1\nLine 2\nLine 3",
    };
    render(<CommentThread comment={multiline} />);
    const bodyEl = screen.getByText((_content, element) => {
      return element?.tagName === "P" && element.textContent === "Line 1\nLine 2\nLine 3";
    });
    expect(bodyEl).toBeInTheDocument();
  });
});