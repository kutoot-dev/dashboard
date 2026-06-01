import type { ApiResponse } from "@/lib/types";
import apiClient from "../client";

export interface StoreManager {
  id: number;
  name: string;
  mobile: string;
  role: string;
}

export async function listManagers(): Promise<ApiResponse<StoreManager[]>> {
  const res = await apiClient.get<ApiResponse<StoreManager[]>>("/merchant/managers");
  return res.data;
}

export async function addManager(payload: {
  mobile: string;
  name?: string;
}): Promise<ApiResponse<StoreManager>> {
  const res = await apiClient.post<ApiResponse<StoreManager>>("/merchant/managers", payload);
  return res.data;
}

export async function removeManager(userId: number): Promise<ApiResponse<null>> {
  const res = await apiClient.delete<ApiResponse<null>>(`/merchant/managers/${userId}`);
  return res.data;
}
