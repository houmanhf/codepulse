import { useState, useEffect, useCallback } from "react";
import type { Snippet } from "@/types";
import { listSnippets } from "@/api/snippets";

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSnippets();
      setSnippets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load snippets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { snippets, loading, error, refetch: fetch };
}