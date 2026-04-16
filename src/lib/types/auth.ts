/**
 * Types: Authentication types for mock auth system
 *
 * Mock auth stores { role, branch_id, ho_id } in a cookie.
 * When migrating to real auth (JWT/session), replace the cookie-based
 * approach with proper token-based auth from your backend.
 */

export type UserRole = "branch" | "ho";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch_id: string | null;
  ho_id: string | null;
}

export interface LoginRequest {
  branch_id?: string;
  ho_id?: string;
  role: UserRole;
}

/** Filament super-admin panel URL — admin users are redirected here instead of the dashboard */
export const FILAMENT_ADMIN_URL = process.env.NEXT_PUBLIC_FILAMENT_URL ?? "http://kutoot.test/admin";

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
