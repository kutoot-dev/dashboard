import type { ApiResponse } from "@/lib/types/api";
import type {
  WalletSummary,
  WalletPayoutDetailsResponse,
  WithdrawCheckResult,
  WithdrawPayoutInput,
  WithdrawalHistoryItem,
} from "@/lib/types/wallet";
import apiClient from "../client";

export async function getWallet(merchantId: string) {
  const res = await apiClient.get<ApiResponse<WalletSummary>>(
    `/merchant/${merchantId}/wallet`,
  );
  return res.data;
}

export async function getPayoutDetails(merchantId: string) {
  const res = await apiClient.get<ApiResponse<WalletPayoutDetailsResponse>>(
    `/merchant/${merchantId}/wallet/payout-details`,
  );
  return res.data;
}

export async function savePayoutDetails(
  merchantId: string,
  payload: WithdrawPayoutInput,
) {
  const res = await apiClient.put<ApiResponse<WithdrawCheckResult>>(
    `/merchant/${merchantId}/wallet/payout-details`,
    payload,
  );
  return res.data;
}

export async function getWithdrawEligibility(merchantId: string) {
  const res = await apiClient.get<ApiResponse<WithdrawCheckResult>>(
    `/merchant/${merchantId}/wallet/withdraw/eligibility`,
  );
  return res.data;
}

/** @deprecated Prefer savePayoutDetails */
export async function checkWithdraw(
  merchantId: string,
  payload: WithdrawPayoutInput,
) {
  const res = await apiClient.post<ApiResponse<WithdrawCheckResult>>(
    `/merchant/${merchantId}/wallet/withdraw/check`,
    payload,
  );
  return res.data;
}

export async function submitWithdraw(
  merchantId: string,
  options: { useSavedPayout?: boolean; payload?: WithdrawPayoutInput } = {},
) {
  const body = options.useSavedPayout
    ? { use_saved_payout: true }
    : options.payload;

  const res = await apiClient.post<
    ApiResponse<{
      id: number;
      amount: number;
      status: string;
      requested_at: string | null;
    }>
  >(`/merchant/${merchantId}/wallet/withdraw`, body);
  return res.data;
}

export async function getWithdrawals(merchantId: string) {
  const res = await apiClient.get<
    ApiResponse<{ items: WithdrawalHistoryItem[] }>
  >(`/merchant/${merchantId}/wallet/withdrawals`);
  return res.data;
}
