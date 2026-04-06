/**
 * Types: Merchant entity
 * 
 * DB TABLE: merchants
 * COLUMNS: merchant_id (UUID PK), business_name, owner_name, phone, email,
 *   gst_number (nullable), registration_date, sector_id (FK), location_id (FK),
 *   business_type (enum), transaction_pattern (enum), operating_hours_per_week (int),
 *   is_franchise (bool), is_regulated_margin (bool), declared_capacity (nullable int),
 *   platform_capture_percentage (decimal), status (enum), created_at, updated_at
 * INDEXES: merchant_id, sector_id, location_id, status
 * CONSTRAINTS: FK to sectors(sector_id), FK to locations(location_id)
 */

export type MerchantStatus = "active" | "dormant" | "suspended" | "under_review";

export type BusinessType = "goods" | "services" | "hybrid" | "b2b" | "subscription" | "seasonal";

export type TransactionPattern =
  | "high_frequency_low_value"
  | "low_frequency_high_value"
  | "subscription"
  | "bundled";

export interface Merchant {
  merchant_id: string;
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
  status: MerchantStatus;
  created_at: string;
  updated_at: string;
}
