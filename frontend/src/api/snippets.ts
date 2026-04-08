import client from "./client";
import type { Snippet, SnippetDetail, CreateSnippetRequest } from "@/types";

export async function listSnippets(): Promise<Snippet[]> {
  const res = await client.get<{ snippets: Snippet[] }>("/snippets");
  return res.data.snippets;
}

export async function getSnippet(id: string): Promise<SnippetDetail> {
  const res = await client.get<SnippetDetail>(`/snippets/${id}`);
  return res.data;
}

export async function createSnippet(data: CreateSnippetRequest): Promise<Snippet> {
  const res = await client.post<Snippet>("/snippets", data);
  return res.data;
}

export async function updateSnippet(
  id: string,
  data: Partial<CreateSnippetRequest>
): Promise<Snippet> {
  const res = await client.put<Snippet>(`/snippets/${id}`, data);
  return res.data;
}

export async function deleteSnippet(id: string): Promise<void> {
  await client.delete(`/snippets/${id}`);
}
