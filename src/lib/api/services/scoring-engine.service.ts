import apiClient from "@/lib/api/client";
import type { ApiResponse } from "@/lib/types";

export interface ScoringEngineParameter {
  key: string;
  label: string;
  description: string;
  unit: string;
  range: [number, number] | string[] | null;
  value: string | number | boolean | null;
  default: string | number | boolean | null;
}

export interface ScoringEngineConfigGroup {
  group: string;
  parameters: ScoringEngineParameter[];
}

export interface ScoringEngineOverview {
  branch: { id: number; name: string };
  config: {
    groups: ScoringEngineConfigGroup[];
    weights: Record<string, number>;
  };
  payout_rules: {
    pool_formula: string;
    platform_fee_mode: string;
    platform_fee_percentage: number;
    merchant_bonus_pool_percentage: number;
    payout_min_score_threshold: number;
    payout_max_single_branch_share: number;
    score_formula_version: number;
    score_floor: number;
    score_ceiling: number;
    share_formula: string;
  };
  schedule: Array<{
    id: string;
    cron: string;
    command: string;
    description: string;
  }>;
  today: {
    date: string;
    pool: number;
    platform_fees: number;
    txn_count: number;
    projected_distributed: number;
    your_share: number;
    live_rank: number | null;
    live_composite: number | null;
    gmv_today: number | null;
    last_updated_at: string | null;
  };
  projection_top: Array<{
    branch_id: number;
    branch_name: string;
    live_rank: number | null;
    composite: number;
    projected_share: number;
  }>;
  recent_periods: Array<{
    id: number;
    date: string;
    pool_amount: number;
    status: string;
    payout_count: number;
  }>;
  allowed_commands: string[];
}

export type ScoringEngineCommand =
  | "scores:tick"
  | "scores:compute-daily"
  | "payouts:distribute-daily"
  | "demo:add-txn";

export interface RunScoringEngineCommandPayload {
  command: ScoringEngineCommand;
  date?: string;
  dry_run?: boolean;
  catch_up?: boolean;
  count?: number;
  bill_amount?: number;
  random?: boolean;
}

export interface RunScoringEngineCommandResult {
  command: string;
  exit_code: number;
  output: string;
  parameters?: Record<string, unknown>;
  transactions?: Array<{ id: number; bill_amount: number; platform_fee: number }>;
  ran_at: string;
}

export async function getScoringEngineOverview() {
  const res = await apiClient.get<ApiResponse<ScoringEngineOverview>>(
    "/merchant/demo/scoring-engine",
  );
  return res.data;
}

export async function runScoringEngineCommand(payload: RunScoringEngineCommandPayload) {
  const res = await apiClient.post<ApiResponse<RunScoringEngineCommandResult>>(
    "/merchant/demo/scoring-engine/run",
    payload,
  );
  return res.data;
}
