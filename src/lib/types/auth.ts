/**
 * Types: Authentication types for mock auth system
 *
 * Mock auth stores { role, merchantId } in a cookie.
 * When migrating to real auth (JWT/session), replace the cookie-based
 * approach with proper token-based auth from your backend.
 */

export type UserRole = "merchant" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  merchant_id: string | null;
}

export interface LoginRequest {
  merchant_id?: string;
  role: UserRole;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
