/**
 * Types: Authentication types
 *
 * Merchant users map to a single branch. Operations hub users manage
 * multiple attached merchant locations via a selected location context.
 */

export type UserRole = "merchant" | "operations_hub";

export type StorePivotRole = "owner" | "manager" | "staff";

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
  /** Pivot role on merchant_location_user (owners can manage team). */
  store_role?: StorePivotRole;
  branch_id: string | null;
  default_location_id?: string | null;
  attached_locations?: AttachedLocationSummary[];
  is_test?: boolean;
  /** Demo merchant or demo-ops hub only — controls Score Engine nav. */
  scoring_engine_enabled?: boolean;
  /** Post-login onboarding: merchant panel basic details (onboarding step). */
  requires_basic_details?: boolean;
  /** Wallet access needs bank + KYC documents saved first. */
  requires_wallet_kyc?: boolean;
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
