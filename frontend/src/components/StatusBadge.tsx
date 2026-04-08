import type { SnippetStatus } from "@/types";

const styles: Record<SnippetStatus, string> = {
  pending: "bg-amber-500/20 text-amber-400",
  in_review: "bg-orange-500/20 text-orange-400",
  approved: "bg-green-500/20 text-green-400",
  changes_requested: "bg-red-500/20 text-red-400",
};

const labels: Record<SnippetStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  changes_requested: "Changes Requested",
};

export default function StatusBadge({ status }: { status: SnippetStatus }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
