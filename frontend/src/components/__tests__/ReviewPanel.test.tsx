import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewPanel from "../ReviewPanel";
import type { Review } from "@/types";

const reviews: Review[] = [
  {
    id: "r1",
    reviewer: { id: "u1", username: "alice" },
    status: "approved",
    body: "Looks good!",
    created_at: "2024-06-15T10:00:00Z",
  },
  {
    id: "r2",
    reviewer: { id: "u2", username: "bob" },
    status: "changes_requested",
    body: "Please fix line 5",
    created_at: "2024-06-16T12:00:00Z",
  },
];

describe("ReviewPanel", () => {
  it("renders existing reviews", () => {
    render(<ReviewPanel reviews={reviews} onSubmitReview={vi.fn()} />);
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.getByText("Looks good!")).toBeInTheDocument();
    expect(screen.getByText("Please fix line 5")).toBeInTheDocument();
  });

  it("shows review statuses", () => {
    render(<ReviewPanel reviews={reviews} onSubmitReview={vi.fn()} />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Changes Requested")).toBeInTheDocument();
  });

  it("shows empty state when no reviews", () => {
    render(<ReviewPanel reviews={[]} onSubmitReview={vi.fn()} />);
    expect(screen.getByText("No reviews yet.")).toBeInTheDocument();
  });

  it("renders the submit review form", () => {
    render(<ReviewPanel reviews={[]} onSubmitReview={vi.fn()} />);
    expect(screen.getByText("Submit a review")).toBeInTheDocument();
    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Request Changes")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit Review" })
    ).toBeInTheDocument();
  });

  it("submits a review with approved status", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewPanel reviews={[]} onSubmitReview={onSubmit} />);

    await user.type(
      screen.getByPlaceholderText("Optional review body..."),
      "LGTM"
    );
    await user.click(screen.getByRole("button", { name: "Submit Review" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("approved", "LGTM");
    });
  });

  it("submits a review with changes_requested status", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewPanel reviews={[]} onSubmitReview={onSubmit} />);

    await user.click(screen.getByText("Request Changes"));
    await user.type(
      screen.getByPlaceholderText("Optional review body..."),
      "Fix bugs"
    );
    await user.click(screen.getByRole("button", { name: "Submit Review" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("changes_requested", "Fix bugs");
    });
  });

  it("clears body after successful submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewPanel reviews={[]} onSubmitReview={onSubmit} />);

    const textarea = screen.getByPlaceholderText("Optional review body...");
    await user.type(textarea, "Great work");
    await user.click(screen.getByRole("button", { name: "Submit Review" }));

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });
});