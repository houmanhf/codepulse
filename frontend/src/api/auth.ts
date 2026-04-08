import client from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  User,
} from "@/types";

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>("/auth/login", data);
  return res.data;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await client.post<RegisterResponse>("/auth/register", data);
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await client.get<User>("/auth/me");
  return res.data;
}
