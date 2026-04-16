/**
 * Admin Service
 *
 * BACKEND SPEC: Admin-only endpoints for parameter management, fraud review,
 * force majeure, cohort health, and payout simulation. All endpoints should
 * be protected by admin role middleware.
 */
import type {
  ApiResponse,
  ScoringParameter,
  FraudFlag,
  ForceMajeureEvent,
} from "@/lib/types";
import apiClient from "../client";

// ── Admin Branch Listing (for dropdowns) ────────────────────────────

export interface AdminBranch {
  branch_id: string;
  business_name: string;
  ho_id: string | null;
  ho_name: string | null;
  city: string | null;
  state: string | null;
  status: string;
}

export async function getAdminBranches(search?: string) {
  const params = search ? { search } : {};
  const res = await apiClient.get<ApiResponse<AdminBranch[]>>(
    "/admin/branches",
    { params },
  );
  return res.data;
}

// ── Parameters ─────────────────────────────────────────────────────

/**
 * Get all scoring parameters.
 * @endpoint GET /api/admin/parameters
 * BACKEND SPEC: SELECT * FROM scoring_parameters ORDER BY parameter_key
 */
export async function getParameters() {
  const res = await apiClient.get<ApiResponse<ScoringParameter[]>>(
    "/admin/parameters",
  );
  return res.data;
}

/**
 * Update a single scoring parameter value.
 * @endpoint PUT /api/admin/parameters
 * BACKEND SPEC: UPDATE scoring_parameters SET parameter_value = :value,
 *   last_updated_by = :user, last_updated_at = NOW() WHERE parameter_key = :key
 */
export async function updateParameter(key: string, value: number) {
  const res = await apiClient.put<ApiResponse<ScoringParameter>>(
    "/admin/parameters",
    { key, value },
  );
  return res.data;
}

// ── Fraud Flags ────────────────────────────────────────────────────

/**
 * Get fraud flags, optionally filtered by investigation status.
 * @endpoint GET /api/admin/fraud?status=
 * BACKEND SPEC: SELECT * FROM fraud_flags [WHERE investigation_status = :status]
 *   ORDER BY created_at DESC
 */
export async function getFraudFlags(status?: string) {
  const params = status ? { status } : {};
  const res = await apiClient.get<ApiResponse<FraudFlag[]>>("/admin/fraud", {
    params,
  });
  return res.data;
}

/**
 * Update a fraud flag's action and investigation status.
 * @endpoint PATCH /api/admin/fraud
 * BACKEND SPEC: UPDATE fraud_flags SET action_taken = :action,
 *   investigation_status = :status WHERE flag_id = :id
 */
export async function updateFraudFlag(
  id: string,
  action: string,
  status: string,
) {
  const res = await apiClient.patch<ApiResponse<FraudFlag>>("/admin/fraud", {
    id,
    action,
    status,
  });
  return res.data;
}

// ── Force Majeure ──────────────────────────────────────────────────

/**
 * Get all force majeure events.
 * @endpoint GET /api/admin/force-majeure
 * BACKEND SPEC: SELECT * FROM force_majeure_events ORDER BY start_timestamp DESC
 */
export async function getForceMajeure() {
  const res = await apiClient.get<ApiResponse<ForceMajeureEvent[]>>(
    "/admin/force-majeure",
  );
  return res.data;
}

/**
 * Create a new force majeure event.
 * @endpoint POST /api/admin/force-majeure
 * BACKEND SPEC: INSERT INTO force_majeure_events (...) VALUES (...)
 */
export async function createForceMajeure(
  data: Omit<ForceMajeureEvent, "event_id" | "created_at">,
) {
  const res = await apiClient.post<ApiResponse<ForceMajeureEvent>>(
    "/admin/force-majeure",
    data,
  );
  return res.data;
}

// ── Cohort Health ──────────────────────────────────────────────────

/** Cohort health metric for a sector group */
export interface CohortHealthMetric {
  sector_id: string;
  sector_name: string;
  branch_count: number;
  avg_score: number;
  median_score: number;
  top_quartile_avg: number;
  bottom_quartile_avg: number;
  dormant_count: number;
}

/**
 * Get cohort health metrics, optionally filtered by sector.
 * @endpoint GET /api/admin/cohorts?sector_id=
 * BACKEND SPEC: Aggregate branch_scores by sector with percentile breakdowns.
 */
export async function getCohortHealth(sectorId?: string) {
  const params = sectorId ? { sector_id: sectorId } : {};
  const res = await apiClient.get<ApiResponse<CohortHealthMetric[]>>(
    "/admin/cohorts",
    { params },
  );
  return res.data;
}

// ── Overrides ──────────────────────────────────────────────────────

export interface ScoreOverride {
  id: string;
  branch_id: string;
  branch_name: string;
  period_id: string;
  original_score: number | null;
  override_score: number;
  reason: string;
  applied_by: string;
  created_at: string;
}

export async function getAdminOverrides() {
  const res = await apiClient.get<ApiResponse<ScoreOverride[]>>("/admin/overrides");
  return res.data;
}

export async function createAdminOverride(data: {
  branch_ids: string[];
  period_id: string;
  override_score: number;
  reason: string;
}) {
  const res = await apiClient.post<ApiResponse<ScoreOverride[]>>("/admin/overrides", data);
  return res.data;
}

// ── Payout Management ──────────────────────────────────────────────

export interface PayoutRecord {
  id: string;
  branch_id: string;
  branch_name: string;
  ho_name: string | null;
  period_id: string;
  period_label: string;
  allocated_amount: number;
  status: "allocated" | "paid";
  paid_at: string | null;
  paid_by: string | null;
}

export async function getPayoutRecords(periodId?: string) {
  const params = periodId ? { period_id: periodId } : {};
  const res = await apiClient.get<ApiResponse<PayoutRecord[]>>("/admin/payouts", { params });
  return res.data;
}

export async function markPayoutPaid(payoutIds: string[]) {
  const res = await apiClient.post<ApiResponse<{ updated: number }>>("/admin/payouts/mark-paid", { payout_ids: payoutIds });
  return res.data;
}

// ── Payout Simulation ──────────────────────────────────────────────

/** Simulated payout entry for a single branch */
export interface PayoutSimulationEntry {
  branch_id: string;
  business_name: string;
  rank: number;
  composite_score: number;
  payout_amount: number;
}

/** Payout simulation result */
export interface PayoutSimulationResult {
  period_id: string;
  pool_amount: number;
  total_distributed: number;
  entries: PayoutSimulationEntry[];
}

/**
 * Simulate payout distribution for a period with optional parameter overrides.
 * @endpoint POST /api/admin/payouts/simulate
 * BACKEND SPEC: Run payout formula with given parameters, return projected
 *   distribution without persisting.
 */
export async function simulatePayout(
  periodId: string,
  params?: { pool_override?: number; top_n?: number },
) {
  const res = await apiClient.post<ApiResponse<PayoutSimulationResult>>(
    "/admin/payouts/simulate",
    { period_id: periodId, ...params },
  );
  return res.data;
}
