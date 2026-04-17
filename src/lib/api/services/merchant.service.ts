/**
 * Merchant (branch) portal services: deals, store profile, transactions, visitors.
 */
import type { ApiResponse } from "@/lib/types";
import apiClient from "../client";

// ── Types ───────────────────────────────────────────────────────────────────

export interface Deal {
  id: number;
  title: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number | null;
  max_discount_amount: number | null;
  code: string | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  status: string; // pending|approved|rejected|expired
  created_at: string;
  branch_name?: string;
}

export interface CreateDealPayload {
  title: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value?: number | null;
  max_discount_amount?: number | null;
  code?: string | null;
  starts_at?: string | null;
  expires_at?: string | null;
}

export interface StoreProfile {
  id: number;
  name: string;
  store_email: string | null;
  owner_name: string | null;
  owner_mobile_whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  operating_hours_start: string | null;
  operating_hours_end: string | null;
  category: string | null;
  // read-only (blocked by backend)
  gst_number?: string | null;
  pan_number?: string | null;
  commission_percentage?: number | null;
}

export interface UpdateStorePayload {
  store_email?: string;
  owner_name?: string;
  owner_mobile_whatsapp?: string;
  operating_hours_start?: string;
  operating_hours_end?: string;
  commission_percentage?: number;
}

export interface Transaction {
  id: number;
  payment_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  bill_amount: number;
  discount: number;
  total_paid: number;
  commission: number;
  status: string;
  type: string;
  coupon_code: string | null;
  coupon_title: string | null;
  created_at: string;
}

export interface Visitor {
  id: number;
  name: string;
  phone: string;
  visit_count: number;
  last_visited: string;
  total_spend: number;
  redeemed: boolean;
}

// ── Deals ────────────────────────────────────────────────────────────────────

export async function getDeals(branchId: string, params?: { page?: number; limit?: number; status?: string }) {
  const res = await apiClient.get<ApiResponse<{ deals: Deal[]; total: number }>>(
    `/merchant/${branchId}/deals`,
    { params },
  );
  return res.data;
}

export async function createDeal(branchId: string, payload: CreateDealPayload) {
  const res = await apiClient.post<ApiResponse<Deal>>(
    `/merchant/${branchId}/deals`,
    payload,
  );
  return res.data;
}

export async function updateDeal(branchId: string, dealId: number, payload: Partial<CreateDealPayload & { is_active?: boolean }>) {
  const res = await apiClient.patch<ApiResponse<Deal>>(
    `/merchant/${branchId}/deals/${dealId}`,
    payload,
  );
  return res.data;
}

export async function deleteDeal(branchId: string, dealId: number) {
  const res = await apiClient.delete<ApiResponse<null>>(
    `/merchant/${branchId}/deals/${dealId}`,
  );
  return res.data;
}

// ── Store Profile ────────────────────────────────────────────────────────────

export async function getStoreProfile(branchId: string) {
  const res = await apiClient.get<ApiResponse<StoreProfile>>(
    `/merchant/${branchId}/store`,
  );
  return res.data;
}

export async function updateStoreProfile(branchId: string, payload: UpdateStorePayload) {
  const res = await apiClient.patch<ApiResponse<StoreProfile>>(
    `/merchant/${branchId}/store`,
    payload,
  );
  return res.data;
}

// ── Transactions ─────────────────────────────────────────────────────────────

export async function getTransactions(
  branchId: string,
  params?: { page?: number; limit?: number; from?: string; to?: string; status?: string; search?: string },
) {
  const res = await apiClient.get<ApiResponse<{ rows: Transaction[]; total: number; page: number; pages: number }>>(
    `/merchant/${branchId}/transactions`,
    { params },
  );
  return res.data;
}

// ── Visitors ─────────────────────────────────────────────────────────────────

export async function getVisitors(
  branchId: string,
  params?: { page?: number; limit?: number; from?: string; to?: string; search?: string },
) {
  const res = await apiClient.get<ApiResponse<{ rows: Visitor[]; total: number; page: number; pages: number }>>(
    `/merchant/${branchId}/visitors`,
    { params },
  );
  return res.data;
}

// ── HO ───────────────────────────────────────────────────────────────────────

export interface HoSummary {
  total_revenue: number;
  total_transactions: number;
  total_visitors: number;
  total_branches: number;
  active_deals: number;
  avg_score: number;
  total_payout: number;
  best_branch: { id: string; name: string; score: number } | null;
  worst_branch: { id: string; name: string; score: number } | null;
}

export interface HoBranch {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  transactions_count: number;
  revenue: number;
  status: string;
}

export async function getHoSummary(hoId: string) {
  const res = await apiClient.get<ApiResponse<HoSummary>>(`/ho/${hoId}/summary`);
  return res.data;
}

export async function getHoBranches(hoId: string, params?: { page?: number; limit?: number }) {
  const res = await apiClient.get<ApiResponse<{ rows: HoBranch[]; total: number }>>(`/ho/${hoId}/branches`, { params });
  return res.data;
}

export async function getHoDeals(hoId: string, params?: { page?: number; limit?: number; status?: string; branch_id?: string }) {
  const res = await apiClient.get<ApiResponse<{ deals: Deal[]; total: number }>>(`/ho/${hoId}/deals`, { params });
  return res.data;
}

export async function getHoTransactions(hoId: string, params?: { page?: number; limit?: number; from?: string; to?: string; status?: string; branch_id?: string; search?: string }) {
  const res = await apiClient.get<ApiResponse<{ rows: Transaction[]; total: number }>>(`/ho/${hoId}/transactions`, { params });
  return res.data;
}

export async function getHoVisitors(hoId: string, params?: { page?: number; limit?: number; from?: string; to?: string; search?: string }) {
  const res = await apiClient.get<ApiResponse<{ rows: Visitor[]; total: number }>>(`/ho/${hoId}/visitors`, { params });
  return res.data;
}

export async function getHoBranchScores(hoId: string) {
  const res = await apiClient.get<ApiResponse<import("@/lib/types").BranchScore[]>>(`/ho/${hoId}/branch-scores`);
  return res.data;
}
