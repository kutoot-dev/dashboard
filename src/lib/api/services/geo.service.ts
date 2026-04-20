/**
 * Geo Service — country / state reference data from the kutoot backend.
 */
import type { ApiResponse } from "@/lib/types";
import apiClient from "../client";

export interface GeoState {
  code: string;
  name: string;
  type: "state" | "union_territory";
}

export interface GeoStatesResponse {
  country: string;
  states: GeoState[];
}

export async function getStates() {
  const res = await apiClient.get<ApiResponse<GeoStatesResponse>>(
    "/geo/states",
  );
  return res.data;
}
