import { render, screen } from "@testing-library/react";
import StatusBadge from "../StatusBadge";
import type { SnippetStatus } from "@/types";

const cases: Array<{ status: SnippetStatus; label: string; colorClass: string }> = [
  { status: "pending", label: "Pending", colorClass: "text-amber-400" },
  { status: "in_review", label: "In Review", colorClass: "text-orange-400" },
  { status: "approved", label: "Approved", colorClass: "text-green-400" },
  { status: "changes_requested", label: "Changes Requested", colorClass: "text-red-400" },
];

describe("StatusBadge", () => {
  it.each(cases)(
    "renders '$label' with correct styling for $status",
    ({ status, label, colorClass }) => {
      render(<StatusBadge status={status} />);
      const badge = screen.getByText(label);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain(colorClass);
    }
  );
});
