import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSnippets } from "@/hooks/useSnippets";
import SnippetCard from "@/components/SnippetCard";
import type { SnippetStatus } from "@/types";

const LANGUAGES = [
  "All",
  "python",
  "javascript",
  "typescript",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
  "ruby",
  "php",
];

const STATUSES: Array<{ label: string; value: "all" | SnippetStatus }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Review", value: "in_review" },
  { label: "Approved", value: "approved" },
  { label: "Changes Requested", value: "changes_requested" },
];

export default function Dashboard() {
  const { snippets, loading, error, refetch } = useSnippets();
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("All");
  const [status, setStatus] = useState<"all" | SnippetStatus>("all");

  const filtered = useMemo(() => {
    return snippets.filter((s) => {
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (language !== "All" && s.language !== language) return false;
      if (status !== "all" && s.status !== status) return false;
      return true;
    });
  }, [snippets, search, language, status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-sm text-red-400 mb-2">{error}</p>
          <button
            onClick={refetch}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-slate-100">Snippets</h1>
        <Link
          to="/snippets/new"
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors"
        >
          New Snippet
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search snippets..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l === "All" ? "All Languages" : l}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "all" | SnippetStatus)
          }
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm mb-2">
            {snippets.length === 0
              ? "No snippets yet"
              : "No snippets match your filters"}
          </p>
          {snippets.length === 0 && (
            <Link
              to="/snippets/new"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Create your first snippet
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
    </div>
  );
}
