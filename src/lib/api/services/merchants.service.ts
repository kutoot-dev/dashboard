/**
 * Merchants Service
 *
 * BACKEND SPEC: Merchant CRUD and related data endpoints.
 * All queries should join with sectors/locations for enriched data.
 */
import type {
  ApiResponse,
  Merchant,
  MerchantScore,
  ScoreCandlestick,
  VolumeBar,
} from "@/lib/types";
import apiClient from "../client";

/**
 * Get a single merchant by ID.
 * @endpoint GET /api/merchants/:id
 * BACKEND SPEC: SELECT * FROM merchants WHERE merchant_id = :id
 */
export async function getMerchant(id: string) {
  const res = await apiClient.get<ApiResponse<Merchant>>(`/merchants/${id}`);
  return res.data;
}

/**
 * Get the merchant's score for the latest or specified period.
 * @endpoint GET /api/merchants/:id/score?period_id=
 * BACKEND SPEC: SELECT * FROM merchant_scores WHERE merchant_id = :id
 *   AND period_id = :periodId ORDER BY created_at DESC LIMIT 1
 */
export async function getMerchantScore(id: string, periodId?: string) {
  const params = periodId ? { period_id: periodId } : {};
  const res = await apiClient.get<ApiResponse<MerchantScore>>(
    `/merchants/${id}/score`,
    { params },
  );
  return res.data;
}

/**
 * Get OHLC candlestick data for the merchant's score history.
 * @endpoint GET /api/merchants/:id/candlesticks
 * BACKEND SPEC: Compute OHLC from merchant_scores ordered by period.
 */
export async function getMerchantCandlesticks(id: string) {
  const res = await apiClient.get<ApiResponse<ScoreCandlestick[]>>(
    `/merchants/${id}/candlesticks`,
  );
  return res.data;
}

/**
 * Get volume histogram data for the merchant's transaction history.
 * @endpoint GET /api/merchants/:id/volume
 * BACKEND SPEC: Aggregate transaction volumes per period for the merchant.
 */
export async function getMerchantVolume(id: string) {
  const res = await apiClient.get<ApiResponse<VolumeBar[]>>(
    `/merchants/${id}/volume`,
  );
  return res.data;
}
