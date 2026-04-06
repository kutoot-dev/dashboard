/**
 * Auth Service
 *
 * BACKEND SPEC: Authentication endpoints. The real backend should implement
 * JWT or session-based auth with proper password hashing.
 * Current mock uses cookie-stored user JSON.
 */
import type { ApiResponse, AuthUser } from "@/lib/types";
import apiClient from "../client";

/**
 * Log in with email and password.
 * @endpoint POST /api/auth/login
 * BACKEND SPEC: Validate credentials against user table, issue JWT/session.
 */
export async function login(email: string, password: string) {
  const res = await apiClient.post<ApiResponse<AuthUser>>("/auth/login", {
    email,
    password,
  });
  return res.data;
}

/**
 * Log out the current user.
 * @endpoint POST /api/auth/logout
 * BACKEND SPEC: Invalidate session/JWT, clear auth cookie.
 */
export async function logout() {
  const res = await apiClient.post<ApiResponse<null>>("/auth/logout");
  return res.data;
}

/**
 * Get the currently authenticated user.
 * @endpoint GET /api/auth/me
 * BACKEND SPEC: Decode JWT/session and return the user record.
 */
export async function getMe() {
  const res = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
  return res.data;
}
