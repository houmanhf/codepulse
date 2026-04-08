import client from "./client";
import type {
  Review,
  Comment,
  CreateReviewRequest,
  CreateCommentRequest,
} from "@/types";

export async function createReview(
  snippetId: string,
  data: CreateReviewRequest
): Promise<Review> {
  const res = await client.post<Review>(`/snippets/${snippetId}/reviews`, data);
  return res.data;
}

export async function getReviews(snippetId: string): Promise<Review[]> {
  const res = await client.get<Review[]>(`/snippets/${snippetId}/reviews`);
  return res.data;
}

export async function createComment(
  snippetId: string,
  data: CreateCommentRequest
): Promise<Comment> {
  const res = await client.post<Comment>(`/snippets/${snippetId}/comments`, data);
  return res.data;
}

export async function getComments(snippetId: string): Promise<Comment[]> {
  const res = await client.get<Comment[]>(`/snippets/${snippetId}/comments`);
  return res.data;
}
