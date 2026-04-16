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

/** Branch payout history item */
export interface BranchPayout {
  payout_id: string;
  period_id: string;
  period_label: string;
  pool_amount: number;
  allocated_amount: number;
  status: string;
  paid_at: string | null;
  score: number | null;
  rank: number | null;
}

/**
 * Get the branch's payout history.
 * @endpoint GET /api/branches/:id/payouts
 */
export async function getBranchPayouts(id: string) {
  const res = await apiClient.get<ApiResponse<BranchPayout[]>>(
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
  breakdown: {
    trading_performance: number;
    margin_efficiency: number;
    location_opportunity: number;
    transaction_quality: number;
    momentum: number;
    ecosystem_contribution: number;
  };
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
