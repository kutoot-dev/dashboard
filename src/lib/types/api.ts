/**
 * Types: API response envelope and common API types
 *
 * All Kutoot API endpoints return this consistent envelope structure.
 * When migrating to FastAPI/Laravel, replicate this exact shape.
 */

/** Standard API response envelope matching spec requirements */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    period_id: string | null;
    request_id: string;
  };
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

/** Pagination metadata for list endpoints */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/** Paginated response data wrapper */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type LeaderboardScoringParameter =
  | "all"
  | "gmv_score"
  | "commission_score"
  | "platform_capture_score"
  | "user_growth_score"
  | "repeat_rate_score"
  | "discount_aggression_score"
  | "referral_score"
  | "fairness_score";

/** Common filter parameters for leaderboard endpoint */
export interface LeaderboardFilters {
  page?: number;
  limit?: number;
  city_tier?: string;
  state?: string;
  start_date?: string;
  end_date?: string;
  parameter?: LeaderboardScoringParameter;
  sort_by?: string;
  search?: string;
}

export interface LeaderboardFiltersMeta {
  snapshot_date?: string;
  selected_parameter: LeaderboardScoringParameter;
  selected_parameters: string[];
  available_parameters: string[];
}

export interface LeaderboardMyEntry extends LeaderboardEntry {
  is_viewer?: boolean;
  rank_pool_total?: number;
  visible_in_list?: boolean;
  eligible_for_leaderboard?: boolean;
  list_total?: number;
}

export interface LeaderboardData extends PaginatedData<LeaderboardEntry> {
  filters?: LeaderboardFiltersMeta;
  my_entry?: LeaderboardMyEntry | null;
}

/** Leaderboard entry as returned by the API */
export interface LeaderboardEntry {
  rank: number;
  rank_movement: number;
  branch_id: string;
  business_name: string;
  period_date?: string;
  successful_transactions?: number;
  parameter_score?: number;
  selected_parameter?: LeaderboardScoringParameter;
  city_name: string;
  state: string;
  sector_name: string;
  sector_id: string;
  city_tier: string;
  composite_score: number;
  score_change: number;
  commission_percentage: number;
  discount_ratio: number;
  discount_efficiency: number;
  active_discounts: {
    title: string;
    discount_type: string;
    discount_value: number;
    min_order: number;
    max_discount: number;
  }[];
  sub_scores: {
    gmv_score?: number;
    commission_score?: number;
    platform_capture_score?: number;
    user_growth_score?: number;
    repeat_rate_score?: number;
    discount_aggression_score?: number;
    referral_score?: number;
    fairness_score?: number;
    shop_activity: number;
    business_efficiency: number;
    location_advantage: number;
    growth_trend: number;
    community_score: number;
    discount_efficiency: number;
    discount_multiplier: number;
  };
  payout_status: "paid" | "non_monetary" | "none";
  payout_amount: number;
  sparkline_data: number[];
}
