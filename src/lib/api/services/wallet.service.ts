import type { ApiResponse } from "@/lib/types/api";
import type {
  WalletSummary,
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
  payload: WithdrawPayoutInput,
) {
  const res = await apiClient.post<
    ApiResponse<{
      id: number;
      amount: number;
      status: string;
      requested_at: string | null;
    }>
  >(`/merchant/${merchantId}/wallet/withdraw`, payload);
  return res.data;
}

export async function getWithdrawals(merchantId: string) {
  const res = await apiClient.get<
    ApiResponse<{ items: WithdrawalHistoryItem[] }>
  >(`/merchant/${merchantId}/wallet/withdrawals`);
  return res.data;
}
