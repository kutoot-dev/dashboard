/**
 * Types: Branch entity (formerly Merchant)
 *
 * DB TABLE: branches
 * COLUMNS: branch_id (UUID PK), ho_id (FK), business_name, owner_name, phone, email,
 *   gst_number (nullable), registration_date, sector_id (FK), location_id (FK),
 *   business_type (enum), transaction_pattern (enum), operating_hours_per_week (int),
 *   is_franchise (bool), is_regulated_margin (bool), declared_capacity (nullable int),
 *   platform_capture_percentage (decimal), status (enum), created_at, updated_at
 * INDEXES: branch_id, ho_id, sector_id, location_id, status
 * CONSTRAINTS: FK to head_offices(ho_id), FK to sectors(sector_id), FK to locations(location_id)
 */

export type BranchStatus = "active" | "dormant" | "suspended" | "under_review";

export type BusinessType = "goods" | "services" | "hybrid" | "b2b" | "subscription" | "seasonal";

export type TransactionPattern =
  | "high_frequency_low_value"
  | "low_frequency_high_value"
  | "subscription"
  | "bundled";

export interface Branch {
  branch_id: string;
  ho_id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  gst_number: string | null;
  registration_date: string;
  sector_id: string;
  location_id: string;
  business_type: BusinessType;
  transaction_pattern: TransactionPattern;
  operating_hours_per_week: number;
  is_franchise: boolean;
  is_regulated_margin: boolean;
  declared_capacity: number | null;
  platform_capture_percentage: number;
  status: BranchStatus;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use Branch instead */
export type Merchant = Branch;
/** @deprecated Use BranchStatus instead */
export type MerchantStatus = BranchStatus;
