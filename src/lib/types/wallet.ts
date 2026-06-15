import type { ApiResponse } from "./api";

export interface WalletTransactionItem {
  id: number;
  type: string;
  amount: number;
  balance_after: number;
  created_at: string | null;
}

export interface ReferralEarnings {
  count: number;
  pending_count?: number;
  qualified_count?: number;
  amount_per_referral: number;
  earned: number;
}

export interface ReferralEarningsSummary {
  customer_referrals: ReferralEarnings;
  store_referrals: ReferralEarnings;
  total: number;
  min_withdrawal_amount: number;
}

export interface WalletSummary {
  balance: number;
  locked_balance: number;
  available_balance: number;
  currency: string;
  registration_bonus_granted: boolean;
  recent_transactions: WalletTransactionItem[];
  has_pending_withdrawal: boolean;
  payout_kyc_saved?: boolean;
  can_submit_withdrawal?: boolean;
  referral_earnings?: ReferralEarningsSummary;
}

export interface WithdrawEligibility {
  kyc_complete: boolean;
  kyc_missing: string[];
  customer_referrals: ReferralEarnings;
  store_referrals: ReferralEarnings;
  total_referral_earnings: number;
  min_withdrawal_amount: number;
  referral_earnings_met: boolean;
  eligible: boolean;
  blocking_reasons: string[];
}

export interface WithdrawCheckResult {
  available_balance: number;
  eligibility: WithdrawEligibility;
  can_submit: boolean;
  payout_kyc_saved?: boolean;
}

export interface WalletPayoutDetailsResponse {
  payout: WithdrawPayoutInput;
  payout_kyc_saved: boolean;
  gst_path: "none" | "gst" | "enrollment";
}

export interface WithdrawPayoutInput {
  bank_account_name: string;
  bank_name?: string;
  bank_branch_name?: string;
  account_number: string;
  ifsc_code: string;
  upi_id?: string;
  pan_number: string;
  aadhaar_number: string;
  gst_number?: string;
  gst_enrollment_number?: string;
  gst_doc_photo_url?: string | null;
  pan_doc_photo_url?: string | null;
  aadhaar_doc_photo_url?: string | null;
  amount?: number;
}

export interface WithdrawalHistoryItem {
  id: number;
  amount: number;
  status: "requested" | "paid";
  requested_at: string | null;
  paid_at: string | null;
  bank_account_name: string | null;
  bank_name: string | null;
  account_number_masked: string | null;
  ifsc_code: string | null;
  pan_masked: string | null;
  aadhaar_masked: string | null;
}

export type WalletSummaryResponse = ApiResponse<WalletSummary>;
export type WithdrawCheckResponse = ApiResponse<WithdrawCheckResult>;
export type WithdrawSubmitResponse = ApiResponse<{
  id: number;
  amount: number;
  status: string;
  requested_at: string | null;
}>;
