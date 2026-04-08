import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSnippet } from "@/api/snippets";
import { AxiosError } from "axios";

const LANGUAGES = [
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
  "bash",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "markdown",
];

export default function NewSnippet() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !code.trim()) {
      setError("Title and code are required");
      return;
    }

    setLoading(true);
    try {
      const snippet = await createSnippet({
        title: title.trim(),
        code,
        language,
        description: description.trim() || undefined,
      });
      navigate(`/snippets/${snippet.id}`);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.detail || "Failed to create snippet");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold text-slate-100 mb-6">
        New Snippet
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Binary search implementation"
            required
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={16}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this code do? What kind of feedback are you looking for?"
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating..." : "Create Snippet"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
