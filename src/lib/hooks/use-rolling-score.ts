"use client";

import { useQuery } from "@tanstack/react-query";
import { getRollingScore, type RollingScore } from "@/lib/api/services/merchant.service";

/**
 * useRollingScore — fetches the authed merchant's 30-day rolling score + rank
 * from `/merchant/rolling-score`. Polls every 60s as a fallback; the score is
 * also kept fresh by server-side per-minute ticks, so users always see
 * near-live numbers even when the websocket connection is unavailable.
 */
export function useRollingScore(days = 30): {
  data: RollingScore | null;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ["rolling-score", days],
    queryFn: () => getRollingScore(days),
    refetchInterval: 60_000,
    retry: false,
  });

  return {
    data: data?.success ? data.data : null,
    isLoading,
  };
}
