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
  archived_at?: string | null;
  is_active: boolean;
  status: string; // pending|approved|rejected|expired
  lifecycle_status?: "active" | "paused" | "archived";
  visit_count?: number;
  total_amount?: number;
  discount_amount?: number;
  net_sales?: number;
  created_at: string;
  branch_name?: string;
}

export interface CreateDealPayload {
  /**
   * Optional — server auto-generates a short title from the discount values
   * if omitted (e.g. "10% OFF" or "₹100 OFF"). Merchants no longer pick a title.
   */
  title?: string;
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
  const res = await apiClient.delete<ApiResponse<Deal>>(
    `/merchant/${branchId}/deals/${dealId}`,
  );
  return res.data;
}

export async function pauseDeal(branchId: string, dealId: number) {
  const res = await apiClient.post<ApiResponse<Deal>>(
    `/merchant/${branchId}/deals/${dealId}/pause`,
  );
  return res.data;
}

export async function resumeDeal(branchId: string, dealId: number) {
  const res = await apiClient.post<ApiResponse<Deal>>(
    `/merchant/${branchId}/deals/${dealId}/resume`,
  );
  return res.data;
}

export async function archiveDeal(branchId: string, dealId: number) {
  const res = await apiClient.post<ApiResponse<Deal>>(
    `/merchant/${branchId}/deals/${dealId}/archive`,
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

export async function exportTransactionsCsv(
  branchId: string,
  params?: { from?: string; to?: string; status?: string; search?: string },
) {
  return apiClient.get(`/merchant/${branchId}/transactions/export`, {
    params,
    responseType: "blob",
  });
}

export interface GstSummaryRow {
  month: string;
  transaction_count: number;
  gross_bill_amount: number;
  discount_amount: number;
  taxable_amount: number;
  gst_amount: number;
  commission_amount: number;
  settlement_amount: number;
}

export async function getGstSummary(
  branchId: string,
  params?: { from?: string; to?: string; status?: string; search?: string },
) {
  const res = await apiClient.get<ApiResponse<{ rows: GstSummaryRow[] }>>(
    `/merchant/${branchId}/transactions/gst-summary`,
    { params },
  );
  return res.data;
}

export async function exportGstSummaryCsv(
  branchId: string,
  params?: { from?: string; to?: string; status?: string; search?: string },
) {
  return apiClient.get(`/merchant/${branchId}/transactions/gst-summary`, {
    params: { ...params, format: "csv" },
    responseType: "blob",
  });
}

export async function downloadTransactionInvoice(branchId: string, transactionId: number) {
  return apiClient.get(`/merchant/${branchId}/transactions/${transactionId}/invoice`, {
    responseType: "blob",
  });
}

export async function downloadInvoicesZip(
  branchId: string,
  params?: { from?: string; to?: string; status?: string; search?: string; max?: number },
) {
  return apiClient.get(`/merchant/${branchId}/transactions/invoices.zip`, {
    params,
    responseType: "blob",
  });
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

// ── Merchant (authed) ───────────────────────────────────────────────────────

export interface MerchantMe {
  id: string;
  name: string;
  store_email: string | null;
  commission_percentage: number;
  category_min_commission: number;
  category: string | null;
  is_test: boolean;
}

export interface MerchantDashboard {
  today: { transactions: number; gmv: number; discount: number; commission: number };
  week: { transactions: number; gmv: number; discount: number; commission: number };
  month: { transactions: number; gmv: number; discount: number; commission: number };
  live: {
    composite_score: number;
    rank: number;
    gmv_today: number;
    active_deals: number;
    score_breakdown?: Record<string, number>;
  };
}

export interface RecentRedemption {
  id: number;
  customer_name: string | null;
  customer_initial: string;
  customer_phone: string | null;
  coupon_code: string | null;
  coupon_title: string | null;
  discount_applied: number;
  bill_amount: number;
  total_paid: number;
  created_at: string;
}

export async function getMerchantMe() {
  const res = await apiClient.get<ApiResponse<MerchantMe>>(`/merchant/me`);
  return res.data;
}

export async function getMerchantDashboard() {
  const res = await apiClient.get<ApiResponse<MerchantDashboard>>(`/merchant/dashboard`);
  return res.data;
}

export async function updateCommission(commission_percentage: number) {
  const res = await apiClient.patch<
    ApiResponse<{
      commission_percentage: number;
      old_commission_percentage: number;
      category_min_commission: number;
    }>
  >(`/merchant/commission`, { commission_percentage });
  return res.data;
}

export async function getRecentRedemptions(limit = 5) {
  const res = await apiClient.get<ApiResponse<{ rows: RecentRedemption[] }>>(
    `/merchant/recent-redemptions`,
    { params: { limit } },
  );
  return res.data;
}

// ── Rolling 30-day score/rank (authed) ──────────────────────────────────────

export interface RollingScoreSeriesEntry {
  date: string;
  score: number;
  rank: number | null;
  payout: number;
}

export interface RollingScore {
  score: number;
  rank: number;
  score_delta_30d: number;
  rank_delta_30d: number;
  days: number;
  total_payout_30d: number;
  last_updated_at: string | null;
  series: RollingScoreSeriesEntry[];
}

export async function getRollingScore(days = 30) {
  const res = await apiClient.get<ApiResponse<RollingScore>>(
    `/merchant/rolling-score`,
    { params: { days } },
  );
  return res.data;
}

// ── Composite score history (5-min granularity, intraday) ───────────────────

export interface CompositeScoreHistoryPoint {
  recorded_at: string;
  composite_score: number;
  previous_score: number | null;
  score_delta: number;
  live_rank: number | null;
  rank_delta: number;
  gmv_bucket: number;
  txn_count_bucket: number;
}

export interface CompositeScoreHistory {
  hours: number;
  bucket_minutes: number;
  count: number;
  latest_score: number;
  first_score: number;
  window_delta: number;
  live_rank: number | null;
  last_updated_at: string | null;
  series: CompositeScoreHistoryPoint[];
}

export async function getCompositeScoreHistory(hours = 24) {
  const res = await apiClient.get<ApiResponse<CompositeScoreHistory>>(
    `/merchant/composite-score-history`,
    { params: { hours } },
  );
  return res.data;
}

// ── Simulated transaction (demo merchants) ──────────────────────────────────

export interface SimulatedTransaction {
  id: number;
  bill_amount: number;
  discount_applied: number;
  total_paid: number;
  customer_name: string | null;
  customer_initial: string;
  coupon_code: string | null;
  coupon_title: string | null;
  created_at: string;
}

export async function simulateTransaction(payload: {
  bill_amount?: number | null;
  use_coupon?: boolean | null;
}) {
  const res = await apiClient.post<ApiResponse<SimulatedTransaction>>(
    `/merchant/simulate/transaction`,
    payload,
  );
  return res.data;
}

// ── Active deals (any branch — used by the rankings profile) ────────────────

export interface ActiveDeal {
  id: number;
  title: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order: number;
  max_discount: number;
  code: string | null;
  expires_at: string | null;
}

export async function getActiveDeals(branchId: string | number) {
  const res = await apiClient.get<ApiResponse<{ deals: ActiveDeal[] }>>(
    `/merchant/${branchId}/active-deals`,
  );
  return res.data;
}

// ── Transactions trend summary (daily buckets, same filters as table) ───────

export interface TransactionsSummaryRow {
  date: string;
  count: number;
  amount: number;
}

export async function getTransactionsSummary(
  branchId: string,
  params?: { from?: string; to?: string; status?: string; search?: string },
) {
  const res = await apiClient.get<ApiResponse<{ rows: TransactionsSummaryRow[] }>>(
    `/merchant/${branchId}/transactions/summary`,
    { params },
  );
  return res.data;
}

// ── Per-merchant UI prefs (dashboard layout, etc.) ──────────────────────────

export type MerchantUiPrefs = Record<string, unknown>;

export async function getUiPrefs() {
  const res = await apiClient.get<ApiResponse<{ prefs: MerchantUiPrefs; updated_at: string | null }>>(
    `/merchant/ui-prefs`,
  );
  return res.data;
}

export async function putUiPrefs(prefs: MerchantUiPrefs) {
  const res = await apiClient.put<ApiResponse<{ prefs: MerchantUiPrefs; updated_at: string | null }>>(
    `/merchant/ui-prefs`,
    { prefs },
  );
  return res.data;
}
