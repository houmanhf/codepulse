import { Link } from "react-router-dom";
import type { Snippet } from "@/types";
import StatusBadge from "./StatusBadge";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SnippetCard({ snippet }: { snippet: Snippet }) {
  return (
    <Link
      to={`/snippets/${snippet.id}`}
      className="block bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-slate-100 truncate">
          {snippet.title}
        </h3>
        <StatusBadge status={snippet.status} />
      </div>

      {snippet.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
          {snippet.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">
            {snippet.language}
          </span>
          <span>{snippet.author.username}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{snippet.review_count} reviews</span>
          <span>{snippet.comment_count} comments</span>
          <span>{timeAgo(snippet.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
