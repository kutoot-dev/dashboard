/**
 * Scores Service
 *
 * BACKEND SPEC: Scoring period and per-period score endpoints.
 */
import type {
  ApiResponse,
  ScoringPeriod,
  MerchantScore,
} from "@/lib/types";
import apiClient from "../client";

/**
 * Get all scoring periods.
 * @endpoint GET /api/scores/periods
 * BACKEND SPEC: SELECT * FROM scoring_periods ORDER BY period_start ASC
 */
export async function getScoringPeriods() {
  const res = await apiClient.get<ApiResponse<ScoringPeriod[]>>(
    "/scores/periods",
  );
  return res.data;
}

/**
 * Get all merchant scores for a given period.
 * @endpoint GET /api/scores/:periodId
 * BACKEND SPEC: SELECT * FROM merchant_scores WHERE period_id = :periodId
 *   ORDER BY final_rank ASC
 */
export async function getPeriodScores(periodId: string) {
  const res = await apiClient.get<ApiResponse<MerchantScore[]>>(
    `/scores/${periodId}`,
  );
  return res.data;
}
