/**
 * Types: Scoring Period & Branch Score entities
 *
 * DB TABLE: scoring_periods
 * COLUMNS: period_id (PK), period_start, period_end,
 *   period_type (enum), pool_amount (decimal), status (enum), created_at
 *
 * DB TABLE: branch_scores
 * COLUMNS: score_id (PK), branch_id (FK), period_id (FK),
 *   raw_transaction_volume, raw_revenue, log_normalized_volume,
 *   log_normalized_revenue, percentile_scale_score, sector_zscore,
 *   sector_percentile_rank, margin_efficiency_ratio, margin_neutralized_score,
 *   location_opportunity_multiplier, location_adjusted_score,
 *   opportunity_normalized_score, transaction_pattern_quality_score,
 *   momentum_score, ecosystem_contribution_score,
 *   composite_index_score (0–100), final_rank, rank_movement,
 *   fatigue_dampener_applied (bool), fatigue_dampener_value (decimal),
 *   payout_amount (decimal), score_breakdown_json (JSON), created_at
 * INDEXES: score_id, branch_id, period_id, final_rank, composite_index_score
 * CONSTRAINTS: FK to branches, FK to scoring_periods
 */

export type PeriodType = "daily" | "weekly" | "biweekly";
export type PeriodStatus = "open" | "calculating" | "closed";

export interface ScoringPeriod {
  period_id: string;
  period_start: string;
  period_end: string;
  period_type: PeriodType;
  pool_amount: number;
  status: PeriodStatus;
  created_at: string;
}

/** v2 Exchange Economy sub-scores (current formula) */
export interface ScoreBreakdown {
  // Legacy keys still referenced by some pages
  trading_performance?: number;
  margin_efficiency?: number;
  location_opportunity?: number;
  transaction_quality?: number;
  momentum?: number;
  ecosystem_contribution?: number;

  // v2 exchange keys
  gmv_score?: number;
  commission_score?: number;
  platform_capture_score?: number;
  user_growth_score?: number;
  repeat_rate_score?: number;
  discount_aggression_score?: number;
  referral_score?: number;
  fairness_score?: number;
  behavior_adjustment?: number;

  [key: string]: number | undefined;
}

export interface BranchScore {
  score_id: string;
  branch_id: string;
  period_id: string;
  raw_transaction_volume: number;
  raw_revenue: number;
  log_normalized_volume: number;
  log_normalized_revenue: number;
  percentile_scale_score: number;
  sector_zscore: number;
  sector_percentile_rank: number;
  margin_efficiency_ratio: number;
  margin_neutralized_score: number;
  location_opportunity_multiplier: number;
  location_adjusted_score: number;
  opportunity_normalized_score: number;
  transaction_pattern_quality_score: number;
  momentum_score: number;
  ecosystem_contribution_score: number;
  composite_index_score: number;
  final_rank: number;
  rank_movement: number;
  fatigue_dampener_applied: boolean;
  fatigue_dampener_value: number;
  payout_amount: number;
  score_breakdown: ScoreBreakdown;
  created_at: string;
}
