"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { ApiResponse } from "@/lib/types";

interface KbiData {
  value: number;
  change: number;
  change_percent: number;
  is_positive: boolean;
  history: { time: string; value: number }[];
}

/**
 * useKMI — fetches the real Kutoot Branch Index from backend.
 * Polls every 30 seconds for live updates.
 */
export function useKMI(): {
  value: number;
  change: number;
  changePercent: number;
  history: { time: string; value: number }[];
  isPositive: boolean;
} {
  const { data } = useQuery({
    queryKey: ["kbi"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<KbiData>>("/kbi");
      return res.data.data;
    },
    refetchInterval: 30_000,
    retry: false,
  });

  return {
    value: data?.value ?? 0,
    change: data?.change ?? 0,
    changePercent: data?.change_percent ?? 0,
    history: data?.history ?? [],
    isPositive: data?.is_positive ?? true,
  };
}
