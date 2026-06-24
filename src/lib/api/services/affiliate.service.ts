import type { ApiResponse } from "@/lib/types/api";
import apiClient from "../client";

export type AffiliateRegistrationState =
  | "not_registered"
  | "pending"
  | "active"
  | "suspended"
  | string;

export interface AffiliateRegistrationStatus {
  is_registered: boolean;
  status: AffiliateRegistrationState;
  can_register?: boolean;
  reason?: string | null;
  registered_at?: string | null;
}

export interface AffiliateBankDetails {
  bank_account_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id?: string | null;
  pan_number: string;
  bank_status?: string | null;
}

export interface AffiliateBankDetailsInput {
  bank_account_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id?: string;
  pan_number: string;
}

export interface AffiliateProfile {
  is_registered?: boolean;
  status?: AffiliateRegistrationState;
  registered_at?: string | null;
  referral_code?: string | null;
  referral_url?: string | null;
  share_url?: string | null;
  total_earned?: number;
  pending_balance?: number;
  min_withdrawal_amount?: number;
  bank_details?: AffiliateBankDetails | null;
}

export interface AffiliateReferralLink {
  referral_code?: string | null;
  referral_url?: string | null;
  share_url?: string | null;
}

export interface AffiliateAnalytics {
  total_referrals?: number;
  successful_referrals?: number;
  pending_referrals?: number;
  conversion_rate?: number;
  total_earned?: number;
  pending_balance?: number;
  min_withdrawal_amount?: number;
}

export interface AffiliatePayoutItem {
  id: string | number;
  amount: number;
  status: string;
  requested_at?: string | null;
  paid_at?: string | null;
  reference?: string | null;
}

export interface AffiliatePayouts {
  items?: AffiliatePayoutItem[];
  rows?: AffiliatePayoutItem[];
  payouts?: AffiliatePayoutItem[];
}

export async function getAffiliateProfile(branchId: string | number) {
  const res = await apiClient.get<ApiResponse<AffiliateProfile>>(
    `/merchant/${branchId}/affiliate/profile`
  );
  return res.data;
}

export async function getAffiliateProfileStatus(branchId: string | number) {
  const res = await apiClient.get<ApiResponse<AffiliateRegistrationStatus>>(
    `/merchant/${branchId}/affiliate/profile/status`
  );
  return res.data;
}

export async function registerAffiliateProgram(branchId: string | number) {
  const res = await apiClient.post<ApiResponse<AffiliateProfile>>(
    `/merchant/${branchId}/affiliate/register`
  );
  return res.data;
}

export async function getAffiliateReferralLink(branchId: string | number) {
  const res = await apiClient.get<ApiResponse<AffiliateReferralLink>>(
    `/merchant/${branchId}/affiliate/referral-link`
  );
  return res.data;
}

export async function getAffiliateAnalytics(branchId: string | number) {
  const res = await apiClient.get<ApiResponse<AffiliateAnalytics>>(
    `/merchant/${branchId}/affiliate/analytics`
  );
  return res.data;
}

export async function getAffiliatePayouts(
  branchId: string | number,
  params?: { limit?: number; page?: number }
) {
  const res = await apiClient.get<ApiResponse<AffiliatePayouts>>(
    `/merchant/${branchId}/affiliate/payouts/history`,
    { params }
  );
  return res.data;
}

export async function updateAffiliateBankDetails(
  branchId: string | number,
  payload: AffiliateBankDetailsInput
) {
  const res = await apiClient.put<ApiResponse<{ bank_details: AffiliateBankDetails }>>(
    `/merchant/${branchId}/affiliate/bank-details`,
    payload
  );
  return res.data;
}

export async function requestAffiliateWithdraw(
  branchId: string | number,
  amount?: number
) {
  const res = await apiClient.post<
    ApiResponse<{ id: string | number; amount: number; status: string; requested_at?: string | null }>
  >(
    `/merchant/${branchId}/affiliate/payouts/request`,
    amount != null ? { amount } : undefined
  );
  return res.data;
}
