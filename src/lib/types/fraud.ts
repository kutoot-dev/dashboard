/**
 * Types: Fraud Flag entity
 *
 * DB TABLE: fraud_flags
 * COLUMNS: flag_id (PK), branch_id (FK), period_id (FK),
 *   flag_type (enum), detection_signal (text), severity (enum),
 *   action_taken (enum), investigation_status (enum), created_at
 * INDEXES: flag_id, branch_id, period_id, severity
 * CONSTRAINTS: FK to branches, FK to scoring_periods
 */

export type FraudFlagType =
  | "fake_transaction"
  | "referral_loop"
  | "artificial_spike"
  | "discount_manipulation"
  | "price_inflation"
  | "category_abuse"
  | "dormancy_gaming";

export type Severity = "low" | "medium" | "high" | "critical";

export type FraudAction = "monitor" | "score_hold" | "score_reduction" | "exclusion";

export type InvestigationStatus = "open" | "under_review" | "resolved_genuine" | "resolved_fraudulent";

export interface FraudFlag {
  flag_id: string;
  branch_id: string;
  period_id: string;
  flag_type: FraudFlagType;
  detection_signal: string;
  severity: Severity;
  action_taken: FraudAction;
  investigation_status: InvestigationStatus;
  created_at: string;
}
