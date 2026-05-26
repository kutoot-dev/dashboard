/**
 * Types: Authentication types
 *
 * Merchant users map to a single branch. Operations hub users manage
 * multiple attached merchant locations via a selected location context.
 */

export type UserRole = "merchant" | "operations_hub";

export interface AttachedLocationSummary {
  id: number | string;
  branch_name: string;
  merchant_category_id?: number | null;
  category?: string | null;
  role?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch_id: string | null;
  default_location_id?: string | null;
  attached_locations?: AttachedLocationSummary[];
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
