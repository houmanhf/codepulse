export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description: string | null;
  status: SnippetStatus;
  author: { id: string; username: string };
  created_at: string;
  updated_at: string;
  review_count: number;
  comment_count: number;
}

export type SnippetStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "changes_requested";

export interface SnippetDetail extends Snippet {
  reviews: Review[];
  comments: Comment[];
}

export interface Review {
  id: string;
  reviewer: { id: string; username: string };
  status: "approved" | "changes_requested";
  body: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  author: { id: string; username: string };
  line_number: number;
  body: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  user: User;
  access_token: string;
}

export interface CreateSnippetRequest {
  title: string;
  code: string;
  language: string;
  description?: string;
}

export interface CreateReviewRequest {
  status: "approved" | "changes_requested";
  body?: string;
}

export interface CreateCommentRequest {
  line_number: number;
  body: string;
}