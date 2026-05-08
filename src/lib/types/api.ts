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

/** Common filter parameters for leaderboard endpoint */
export interface LeaderboardFilters {
  page?: number;
  limit?: number;
  city_tier?: string;
  state?: string;
  start_date?: string;
  end_date?: string;
  min_successful_transactions?: number;
  sort_by?: string;
}

export interface LeaderboardEligibility {
  minimum_successful_transactions: number;
  counted_statuses: string[];
}

export interface LeaderboardData extends PaginatedData<LeaderboardEntry> {
  eligibility?: LeaderboardEligibility;
}

/** Leaderboard entry as returned by the API */
export interface LeaderboardEntry {
  rank: number;
  rank_movement: number;
  branch_id: string;
  business_name: string;
  period_date?: string;
  successful_transactions?: number;
  meets_minimum_transactions?: boolean;
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
