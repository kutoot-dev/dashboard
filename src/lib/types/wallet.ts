import type { ApiResponse } from "./api";

export interface WalletTransactionItem {
  id: number;
  type: string;
  amount: number;
  balance_after: number;
  created_at: string | null;
}

export interface WalletSummary {
  balance: number;
  locked_balance: number;
  available_balance: number;
  currency: string;
  registration_bonus_granted: boolean;
  recent_transactions: WalletTransactionItem[];
  has_pending_withdrawal: boolean;
}

export interface ReferralProgress {
  current: number;
  target: number;
  met: boolean;
}

export interface WithdrawEligibility {
  kyc_complete: boolean;
  kyc_missing: string[];
  customer_referrals: ReferralProgress;
  store_referrals: ReferralProgress;
  referral_target_met: boolean;
  eligible: boolean;
  blocking_reasons: string[];
}

export interface WithdrawCheckResult {
  available_balance: number;
  eligibility: WithdrawEligibility;
  can_submit: boolean;
}

export interface WithdrawPayoutInput {
  bank_account_name: string;
  bank_name?: string;
  bank_branch_name?: string;
  account_number: string;
  ifsc_code: string;
  pan_number: string;
  aadhaar_number: string;
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
