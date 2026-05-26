import type { ApiResponse } from "@/lib/types";
import apiClient from "../client";

export interface OpsHubAttachedLocation {
  id: number;
  branch_name: string;
  merchant_category_id?: number | null;
  category?: string | null;
  share_percentage?: number;
  is_active?: boolean;
}

export interface OpsHubMeData {
  user: { id: number; name: string; email: string; phone?: string };
  plan: {
    has_plan: boolean;
    plan_name?: string;
    commission_share_percentage?: number;
    active_locations?: number;
    max_merchant_locations?: number | null;
    remaining_total?: number | null;
    category_restriction_enabled?: boolean;
    category_usage?: Array<{
      merchant_category_id: number;
      category_name?: string;
      max_locations: number;
      used: number;
      remaining: number;
    }>;
    expires_at?: string | null;
  };
  attached_locations: OpsHubAttachedLocation[];
  default_location_id: number | null;
}

export interface OpsHubSummaryData {
  from: string;
  to: string;
  location_count: number;
  transaction_count: number;
  total_volume: number;
  total_commission: number;
  total_hub_share: number;
  average_rank: number | null;
  by_category: Array<{ category: string; location_count: number }>;
  plan: OpsHubMeData["plan"];
}

export interface OpsHubLocationRow {
  location_id: number;
  branch_name: string;
  merchant_name?: string;
  merchant_category_id?: number;
  category?: string;
  share_percentage: number;
  current_rank?: number | null;
  rank_movement?: number | null;
  transaction_count: number;
  total_commission: number;
  hub_share_earned: number;
  is_active: boolean;
}

export interface OpsHubLocationsFilters {
  from?: string;
  to?: string;
  merchant_category_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export async function getOpsHubMe() {
  const res = await apiClient.get<ApiResponse<OpsHubMeData>>("/ops-hub/me");
  return res.data;
}

export async function getOpsHubSummary(filters: { from?: string; to?: string; merchant_category_id?: number } = {}) {
  const res = await apiClient.get<ApiResponse<OpsHubSummaryData>>("/ops-hub/summary", { params: filters });
  return res.data;
}

export async function getOpsHubLocations(filters: OpsHubLocationsFilters = {}) {
  const res = await apiClient.get<ApiResponse<{ data: OpsHubLocationRow[]; meta: Record<string, unknown> }>>(
    "/ops-hub/locations",
    { params: filters },
  );
  return res.data;
}

export async function detachOpsHubLocation(locationId: number) {
  const res = await apiClient.post<ApiResponse<{ message: string }>>(`/ops-hub/locations/${locationId}/detach`);
  return res.data;
}
