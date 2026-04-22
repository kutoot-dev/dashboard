/**
 * Auth Service
 *
 * Talks DIRECTLY to the kutoot Laravel backend.
 * Login persists the Sanctum bearer token in localStorage and a small
 * non-httpOnly cookie so Next.js middleware can detect the auth state.
 */
import type { ApiResponse, AuthUser } from "@/lib/types";
import apiClient, { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_COOKIE } from "../client";

interface LoginResponseEnvelope extends ApiResponse<AuthUser> {
  /** Sanctum plain-text token returned at the top level by Laravel. */
  token?: string;
}

const COOKIE_MAX_AGE_DAYS = 7;

function setAuthCookie(user: AuthUser): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(user));
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_USER_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_USER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/**
 * Log in with email and password.
 * Stores the bearer token in localStorage so subsequent requests carry it.
 */
export async function login(email: string, password: string) {
  const res = await apiClient.post<LoginResponseEnvelope>("/auth/login", {
    email,
    password,
  });

  const envelope = res.data;
  const token = envelope.token;

  if (token && typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }

  if (envelope.success && envelope.data) {
    setAuthCookie(envelope.data);
  }

  return envelope;
}

/**
 * Log out the current user.
 * Best-effort: revoke server token, then clear local storage and cookie.
 */
export async function logout() {
  try {
    await apiClient.post<ApiResponse<null>>("/auth/logout");
  } catch {
    /* ignore — clear locally regardless */
  }

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
  clearAuthCookie();

  return {
    success: true,
    data: null,
    meta: { timestamp: new Date().toISOString(), period_id: null, request_id: "" },
    error: null,
  } as ApiResponse<null>;
}

/**
 * Get the currently authenticated user.
 */
export async function getMe() {
  const res = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
  if (res.data.success && res.data.data) {
    setAuthCookie(res.data.data);
  }
  return res.data;
}
