/**
 * Types: Transaction entity
 *
 * DB TABLE: transactions
 * COLUMNS: transaction_id (UUID PK), merchant_id (FK), transaction_timestamp,
 *   amount_gross (decimal), amount_net (decimal),
 *   customer_identifier_hash (hashed string),
 *   transaction_type (enum), bundle_unit_count (nullable int),
 *   is_platform_originated (bool), is_flagged (bool),
 *   flag_reason (nullable), created_at
 * INDEXES: transaction_id, merchant_id, transaction_timestamp
 * CONSTRAINTS: FK to merchants(merchant_id)
 */

export type TransactionType = "standard" | "subscription" | "bundle" | "refund" | "reversal";

export interface Transaction {
  transaction_id: string;
  merchant_id: string;
  transaction_timestamp: string;
  amount_gross: number;
  amount_net: number;
  customer_identifier_hash: string;
  transaction_type: TransactionType;
  bundle_unit_count: number | null;
  is_platform_originated: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  created_at: string;
}
