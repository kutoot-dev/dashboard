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

export interface OnboardingProfileField {
  label: string;
  value: string;
  type: "text" | "url";
}

export interface OnboardingProfileSection {
  id: string;
  title: string;
  description: string | null;
  fields: OnboardingProfileField[];
}

export interface OnboardingProfile {
  sections: OnboardingProfileSection[];
}

export interface MerchantQrCode {
  id: number;
  unique_code: string;
  is_primary: boolean;
  linked_at: string | null;
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
  merchant_branch_name?: string | null;
  campaign_reward_name?: string | null;
  bill_amount: number;
  discount: number;
  discounted_bill_amount?: number;
  platform_fee?: number;
  gst_amount?: number;
  platform_fee_gst_amount?: number;
  total_paid: number;
  commission: number;
  commission_gst_amount?: number;
  merchant_bonus_wallet?: number;
  user_reward_wallet?: number;
  merchant_settlement_wallet?: number;
  kutoot_retained_commission_wallet?: number;
  kutoot_company_wallet?: number;
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

export async function unarchiveDeal(branchId: string, dealId: number) {
  const res = await apiClient.post<ApiResponse<Deal>>(
    `/merchant/${branchId}/deals/${dealId}/unarchive`,
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

export interface StoreMediaItem {
  id: number;
  url: string;
  thumb?: string;
  is_approved: boolean;
  created_at?: string;
}

export async function listStoreMedia(branchId: string) {
  const res = await apiClient.get<ApiResponse<{ media: StoreMediaItem[] }>>(
    `/merchant/${branchId}/store/media`,
  );
  return res.data;
}

export async function uploadStoreMedia(branchId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<ApiResponse<StoreMediaItem>>(
    `/merchant/${branchId}/store/media`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

export async function getOnboardingProfile(branchId: string) {
  const res = await apiClient.get<ApiResponse<OnboardingProfile>>(
    `/merchant/${branchId}/store/onboarding-profile`,
  );
  return res.data;
}

export interface PanelBasicDetailsForm {
  legal_name: string;
  shop_name: string;
  sector_id: string;
  sector_name?: string;
  owner_name: string;
  owner_email?: string;
  owner_email_verified?: boolean;
  phone: string;
  merchant_phone_verified?: boolean;
  merchant_otp_phone?: string;
  referral_code?: string;
  commission_rate: number | null;
  commission_model?: string;
  minimum_commission_percentage?: number | null;
  storefront_photo_url?: string | null;
  storefront_photo_urls: string[];
  storefront_photo_status?: string;
  locality?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  gps_lat: number | null;
  gps_long: number | null;
  gps_accuracy?: number | null;
  google_maps_link?: string;
}

export interface PanelBasicDetailsStatus {
  requires_basic_details: boolean;
  basic_details_missing: string[];
  requires_wallet_kyc: boolean;
  panel_basic_details_completed_at: string | null;
}

export async function getPanelBasicDetailsStatus(branchId: string) {
  const res = await apiClient.get<ApiResponse<PanelBasicDetailsStatus>>(
    `/merchant/${branchId}/basic-details/status`,
  );
  return res.data;
}

export async function getPanelBasicDetails(branchId: string) {
  const res = await apiClient.get<
    ApiResponse<{ form: PanelBasicDetailsForm; requires_basic_details: boolean }>
  >(`/merchant/${branchId}/basic-details`);
  return res.data;
}

export async function savePanelBasicDetails(
  branchId: string,
  payload: PanelBasicDetailsForm,
) {
  const res = await apiClient.put<
    ApiResponse<{
      requires_basic_details: boolean;
      panel_basic_details_completed_at: string | null;
      form: PanelBasicDetailsForm;
      wallet?: {
        balance: number;
        available_balance: number;
        registration_bonus_granted: boolean;
      } | null;
    }>
  >(`/merchant/${branchId}/basic-details`, payload);
  return res.data;
}

export async function getMerchantQrCodes(branchId: string) {
  const res = await apiClient.get<ApiResponse<{ qr_codes: MerchantQrCode[] }>>(
    `/merchant/${branchId}/qr-codes`,
  );
  return res.data;
}

export async function fetchMerchantQrSticker(
  branchId: string,
  qrCodeId: number,
  variant: "preview" | "download" = "preview",
) {
  return apiClient.get(`/merchant/${branchId}/qr-codes/${qrCodeId}/sticker`, {
    params: { variant },
    responseType: "blob",
  });
}

/** @deprecated Use fetchMerchantQrSticker with variant=download */
export async function downloadMerchantQrCode(branchId: string, qrCodeId: number) {
  return fetchMerchantQrSticker(branchId, qrCodeId, "download");
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
  user_paid_amount?: number;
  platform_fee_amount?: number;
  gst_amount: number;
  commission_amount: number;
  commission_gst_amount?: number;
  merchant_bonus_wallet?: number;
  user_reward_wallet?: number;
  kutoot_retained_commission_wallet?: number;
  kutoot_company_wallet?: number;
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
  merchant_referral_code?: string | null;
  referral_share_url?: string | null;
}

export interface MerchantScoreInsight {
  key: string;
  score: number;
  weight: number;
  weight_percent: number;
  contribution: number;
  is_top_performer: boolean;
  is_least_performer: boolean;
}

export interface MerchantDashboard {
  today: { transactions: number; gmv: number; discount: number; commission: number };
  week: { transactions: number; gmv: number; discount: number; commission: number };
  month: { transactions: number; gmv: number; discount: number; commission: number };
  merchant_referral_code?: string | null;
  referral_share_url?: string | null;
  live: {
    composite_score: number;
    rank: number;
    gmv_today: number;
    active_deals: number;
    score_breakdown?: Record<string, number>;
    score_insights?: MerchantScoreInsight[];
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

export interface MerchantNewsFeedItem {
  id: string;
  event: string;
  icon: string;
  message: string;
  subject: string;
  merchant_location_id: number | null;
  merchant_location_name: string | null;
  user_name: string | null;
  actor_name: string | null;
  subject_id: number | null;
  created_at: string;
}

export interface MerchantNewsFeed {
  rows: MerchantNewsFeedItem[];
  hours: number;
  configured_hours: number;
  limit: number;
}

export async function getMerchantMe() {
  const res = await apiClient.get<ApiResponse<MerchantMe>>(`/merchant/me`);
  return res.data;
}

export async function getMerchantDashboard() {
  const res = await apiClient.get<ApiResponse<MerchantDashboard>>(`/merchant/dashboard`);
  return res.data;
}

export async function getMerchantNewsFeed(params?: { hours?: number; limit?: number }) {
  const res = await apiClient.get<ApiResponse<MerchantNewsFeed>>(`/merchant/news-feed`, {
    params,
  });
  return res.data;
}

export async function updateCommission(
  commission_percentage: number,
  incentive_agreement_acceptance_id?: number,
) {
  const res = await apiClient.patch<
    ApiResponse<{
      commission_percentage: number;
      old_commission_percentage: number;
      category_min_commission: number;
    }>
  >(`/merchant/commission`, {
    commission_percentage,
    ...(incentive_agreement_acceptance_id != null
      ? { incentive_agreement_acceptance_id }
      : {}),
  });
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

// ── Composite score history (1-min granularity, intraday) ───────────────────

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
