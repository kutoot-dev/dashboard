/**
 * Types: Authentication types
 *
 * Auth user is a single MerchantLocation (branch). The platform no longer
 * has a Head Office concept — every location is a standalone branch.
 */

export type UserRole = "merchant";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch_id: string | null;
  is_test?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
