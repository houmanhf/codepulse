import { useState } from "react";
import type { Review } from "@/types";

interface Props {
  reviews: Review[];
  onSubmitReview: (
    status: "approved" | "changes_requested",
    body: string
  ) => Promise<void>;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReviewPanel({ reviews, onSubmitReview }: Props) {
  const [status, setStatus] = useState<"approved" | "changes_requested">(
    "approved"
  );
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitReview(status, body);
      setBody("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-200 mb-3">Reviews</h3>

      {reviews.length === 0 && (
        <p className="text-xs text-slate-500 mb-4">No reviews yet.</p>
      )}

      <div className="space-y-3 mb-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-indigo-400">
                  {review.reviewer.username}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    review.status === "approved"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {review.status === "approved" ? "Approved" : "Changes Requested"}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {formatTime(review.created_at)}
              </span>
            </div>
            {review.body && (
              <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">
                {review.body}
              </p>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 border border-slate-700 rounded-lg p-3"
      >
        <h4 className="text-xs font-medium text-slate-300 mb-2">
          Submit a review
        </h4>
        <div className="flex gap-3 mb-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="review-status"
              checked={status === "approved"}
              onChange={() => setStatus("approved")}
              className="accent-green-500"
            />
            Approve
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="review-status"
              checked={status === "changes_requested"}
              onChange={() => setStatus("changes_requested")}
              className="accent-red-500"
            />
            Request Changes
          </label>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Optional review body..."
          rows={3}
          className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-xs text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500 mb-2"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
