/**
 * Branches Service
 *
 * BACKEND SPEC: Branch CRUD and related data endpoints.
 * All queries should join with sectors/locations for enriched data.
 */
import type {
  ApiResponse,
  Branch,
  BranchScore,
  ScoreBreakdown,
  ScoreCandlestick,
  VolumeBar,
} from "@/lib/types";
import apiClient from "../client";

/**
 * Get a single branch by ID.
 * @endpoint GET /api/branches/:id
 * BACKEND SPEC: SELECT * FROM branches WHERE branch_id = :id
 */
export async function getBranch(id: string) {
  const res = await apiClient.get<ApiResponse<Branch>>(`/branches/${id}`);
  return res.data;
}

/**
 * Get the branch's score for the latest or specified period.
 * @endpoint GET /api/branches/:id/score?period_id=
 * BACKEND SPEC: SELECT * FROM branch_scores WHERE branch_id = :id
 *   AND period_id = :periodId ORDER BY created_at DESC LIMIT 1
 */
export async function getBranchScore(id: string, periodId?: string) {
  const params = periodId ? { period_id: periodId } : {};
  const res = await apiClient.get<ApiResponse<BranchScore>>(
    `/branches/${id}/score`,
    { params },
  );
  return res.data;
}

/**
 * Get OHLC candlestick data for the branch's score history.
 * @endpoint GET /api/branches/:id/candlesticks
 * BACKEND SPEC: Compute OHLC from branch_scores ordered by period.
 */
export async function getBranchCandlesticks(id: string) {
  const res = await apiClient.get<ApiResponse<ScoreCandlestick[]>>(
    `/branches/${id}/candlesticks`,
  );
  return res.data;
}

/**
 * Get volume histogram data for the branch's transaction history.
 * @endpoint GET /api/branches/:id/volume
 * BACKEND SPEC: Aggregate transaction volumes per period for the branch.
 */
export async function getBranchVolume(id: string) {
  const res = await apiClient.get<ApiResponse<VolumeBar[]>>(
    `/branches/${id}/volume`,
  );
  return res.data;
}

/** Single day bonus payout from the payout engine */
export interface BranchPayoutHistoryItem {
  payout_id: string;
  period_id: string;
  date: string;
  daily_pool: number;
  your_share: number;
  rank: number | null;
  status: string;
}

/** Live or settled projection for the current calendar day */
export interface BranchPayoutTodayExpected {
  date: string;
  daily_pool: number;
  accumulated_net?: number;
  payout_wallet_name?: string | null;
  payout_wallet_share_percentage?: number | null;
  your_share: number;
  rank: number | null;
  as_of: string;
  is_estimate: boolean;
}

/** Bonus payout API payload */
export interface BranchPayoutsData {
  total_bonus_received: number;
  today_expected: BranchPayoutTodayExpected | null;
  latest: {
    date: string;
    rank: number | null;
    daily_pool: number;
    your_share: number;
  } | null;
  history: BranchPayoutHistoryItem[];
}

/**
 * Get the branch's bonus payout summary and history.
 * @endpoint GET /api/branches/:id/payouts
 */
export async function getBranchPayouts(id: string) {
  const res = await apiClient.get<ApiResponse<BranchPayoutsData>>(
    `/branches/${id}/payouts`,
  );
  return res.data;
}

/** Branch score-history item (daily with breakdown) */
export interface BranchScoreHistoryItem {
  period_id: string;
  date: string;
  score: number;
  rank: number;
  payout: number;
  pool: number;
  breakdown: ScoreBreakdown;
}

/**
 * Get the branch's full score history with breakdowns.
 * @endpoint GET /api/branches/:id/score-history
 */
export async function getBranchScoreHistory(id: string) {
  const res = await apiClient.get<ApiResponse<BranchScoreHistoryItem[]>>(
    `/branches/${id}/score-history`,
  );
  return res.data;
}
