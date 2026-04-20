/**
 * Types: Branch entity (a single MerchantLocation)
 *
 * Every business is modelled as a flat list of branches (no Head Office concept).
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
