import { useState, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Comment } from "@/types";
import CommentThread from "./CommentThread";

interface Props {
  code: string;
  language: string;
  comments: Comment[];
  onAddComment?: (lineNumber: number, body: string) => Promise<void>;
}

export default function CodeViewer({
  code,
  language,
  comments,
  onAddComment,
}: Props) {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const commentsByLine = useMemo(() => {
    const map = new Map<number, Comment[]>();
    for (const c of comments) {
      const existing = map.get(c.line_number) || [];
      existing.push(c);
      map.set(c.line_number, existing);
    }
    return map;
  }, [comments]);

  const lines = code.split("\n");

  const handleSubmitComment = async () => {
    if (!activeLine || !commentText.trim() || !onAddComment) return;
    setSubmitting(true);
    try {
      await onAddComment(activeLine, commentText.trim());
      setCommentText("");
      setActiveLine(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLineClick = (lineNum: number) => {
    if (!onAddComment) return;
    setActiveLine(activeLine === lineNum ? null : lineNum);
    setCommentText("");
  };

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 bg-[#282c34]">
      <div className="overflow-x-auto">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const lineComments = commentsByLine.get(lineNum);
          const isActive = activeLine === lineNum;

          return (
            <div key={lineNum}>
              <div className="flex group">
                <button
                  onClick={() => handleLineClick(lineNum)}
                  className={`
                    flex-shrink-0 w-12 text-right pr-3 py-0 text-xs select-none
                    font-mono leading-6 border-r border-slate-700
                    ${
                      onAddComment
                        ? "cursor-pointer hover:bg-indigo-500/20 hover:text-indigo-400"
                        : "cursor-default"
                    }
                    ${isActive ? "bg-indigo-500/20 text-indigo-400" : "text-slate-500"}
                  `}
                >
                  {lineNum}
                </button>
                <div className="flex-1 min-w-0">
                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      padding: "0 12px",
                      background: "transparent",
                      fontSize: "0.8125rem",
                      lineHeight: "1.5rem",
                    }}
                    codeTagProps={{
                      style: { lineHeight: "1.5rem" },
                    }}
                    PreTag="div"
                    CodeTag="span"
                    wrapLines={false}
                  >
                    {line || " "}
                  </SyntaxHighlighter>
                </div>
              </div>

              {lineComments && lineComments.length > 0 && (
                <div className="ml-12 pl-3 pr-3 py-1 bg-slate-800/60 border-l-2 border-indigo-500/40">
                  {lineComments.map((c) => (
                    <CommentThread key={c.id} comment={c} />
                  ))}
                </div>
              )}

              {isActive && (
                <div className="ml-12 pl-3 pr-3 py-2 bg-slate-800/80 border-l-2 border-indigo-500">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-xs text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleSubmitComment}
                      disabled={submitting || !commentText.trim()}
                      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? "Posting..." : "Comment"}
                    </button>
                    <button
                      onClick={() => {
                        setActiveLine(null);
                        setCommentText("");
                      }}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
