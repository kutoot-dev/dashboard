import type { ApiResponse } from "@/lib/types";
import type { StorePivotRole } from "@/lib/types/auth";
import apiClient from "../client";

export type AssignableStoreRole = Extract<StorePivotRole, "manager" | "staff">;

export interface StoreTeamMember {
  id: number;
  name: string;
  mobile: string;
  role: StorePivotRole;
}

/** @deprecated Use StoreTeamMember */
export type StoreManager = StoreTeamMember;

export async function listManagers(): Promise<ApiResponse<StoreTeamMember[]>> {
  const res = await apiClient.get<ApiResponse<StoreTeamMember[]>>("/merchant/managers");
  return res.data;
}

export async function addManager(payload: {
  mobile: string;
  name?: string;
  role?: AssignableStoreRole;
}): Promise<ApiResponse<StoreTeamMember>> {
  const res = await apiClient.post<ApiResponse<StoreTeamMember>>("/merchant/managers", payload);
  return res.data;
}

export async function removeManager(userId: number): Promise<ApiResponse<null>> {
  const res = await apiClient.delete<ApiResponse<null>>(`/merchant/managers/${userId}`);
  return res.data;
}
