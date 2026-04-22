/**
 * Geo Service — country / state reference data from the kutoot backend.
 */
import type { ApiResponse } from "@/lib/types";
import apiClient from "../client";

export interface GeoState {
  id: number;
  code: string;
  name: string;
  type: "state" | "union_territory";
}

export interface GeoStatesResponse {
  country: string;
  states: GeoState[];
}

export interface GeoCitiesResponse {
  state_id: number;
  cities: string[];
}

export async function getStates() {
  const res = await apiClient.get<ApiResponse<GeoStatesResponse>>(
    "/geo/states",
  );
  return res.data;
}

export async function getCitiesByStateId(stateId: number) {
  const res = await apiClient.get<ApiResponse<GeoCitiesResponse>>("/geo/cities", {
    params: { state_id: stateId },
  });
  return res.data;
}

/** Row from `GET /geo/merchant-categories` (matches MerchantCategoryResource). */
export interface MerchantCategoryOption {
  id: number;
  name: string;
  image: string | null;
  serial: number | null;
  minimum_commission_percentage: number | null;
}

export interface MerchantCategoriesResponse {
  categories: MerchantCategoryOption[];
}

export async function getMerchantCategories(params?: { search?: string }) {
  const res = await apiClient.get<ApiResponse<MerchantCategoriesResponse>>(
    "/geo/merchant-categories",
    { params: params?.search ? { search: params.search } : undefined },
  );
  return res.data;
}
