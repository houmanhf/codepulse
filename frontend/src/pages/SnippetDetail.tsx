import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSnippet, deleteSnippet } from "@/api/snippets";
import { createReview } from "@/api/reviews";
import { createComment } from "@/api/reviews";
import { useAuth } from "@/hooks/useAuth";
import type { SnippetDetail as SnippetDetailType } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import CodeViewer from "@/components/CodeViewer";
import ReviewPanel from "@/components/ReviewPanel";

export default function SnippetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [snippet, setSnippet] = useState<SnippetDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getSnippet(id);
      setSnippet(data);
      setError(null);
    } catch {
      setError("Failed to load snippet");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDelete = async () => {
    if (!id || !confirm("Delete this snippet?")) return;
    setDeleting(true);
    try {
      await deleteSnippet(id);
      navigate("/");
    } catch {
      setDeleting(false);
    }
  };

  const handleAddComment = async (lineNumber: number, body: string) => {
    if (!id) return;
    await createComment(id, { line_number: lineNumber, body });
    await fetch();
  };

  const handleSubmitReview = async (
    status: "approved" | "changes_requested",
    body: string
  ) => {
    if (!id) return;
    await createReview(id, { status, body: body || undefined });
    await fetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-sm text-red-400 mb-2">{error || "Not found"}</p>
          <button
            onClick={fetch}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === snippet.author.id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-lg font-semibold text-slate-100 mb-1">
              {snippet.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{snippet.author.username}</span>
              <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                {snippet.language}
              </span>
              <StatusBadge status={snippet.status} />
              <span>
                {new Date(snippet.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-xs border border-red-500/40 text-red-400 rounded hover:bg-red-500/10 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
        {snippet.description && (
          <p className="text-sm text-slate-400 mt-2">{snippet.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CodeViewer
            code={snippet.code}
            language={snippet.language}
            comments={snippet.comments}
            onAddComment={handleAddComment}
          />
        </div>
        <div>
          <ReviewPanel
            reviews={snippet.reviews}
            onSubmitReview={handleSubmitReview}
          />
        </div>
      </div>
    </div>
  );
}
