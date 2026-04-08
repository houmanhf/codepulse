import type { Comment } from "@/types";

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentThread({ comment }: { comment: Comment }) {
  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded p-2 my-1 text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-indigo-400">
          {comment.author.username}
        </span>
        <span className="text-slate-500">{formatTime(comment.created_at)}</span>
      </div>
      <p className="text-slate-300 whitespace-pre-wrap">{comment.body}</p>
    </div>
  );
}