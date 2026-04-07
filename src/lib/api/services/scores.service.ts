/**
 * Scores Service
 *
 * BACKEND SPEC: Scoring period and per-period score endpoints.
 */
import type {
  ApiResponse,
  ScoringPeriod,
  BranchScore,
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
 * Get all branch scores for a given period.
 * @endpoint GET /api/scores/:periodId
 * BACKEND SPEC: SELECT * FROM branch_scores WHERE period_id = :periodId
 *   ORDER BY final_rank ASC
 */
export async function getPeriodScores(periodId: string) {
  const res = await apiClient.get<ApiResponse<BranchScore[]>>(
    `/scores/${periodId}`,
  );
  return res.data;
}
