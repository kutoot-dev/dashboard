import type { ApiResponse } from "@/lib/types";
import apiClient from "../client";

export interface ScoringWeightsPayload {
  weights: Record<string, number>;
  sum: number;
}

export async function getScoringWeights() {
  const res = await apiClient.get<ApiResponse<ScoringWeightsPayload>>("/scoring/weights");
  return res.data;
}
