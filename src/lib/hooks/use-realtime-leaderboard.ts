"use client";

import { useState, useEffect } from "react";
import { getEcho } from "@/lib/echo";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import type { LeaderboardFilters, LeaderboardEntry } from "@/lib/types";

export interface LiveRanking {
  location_id: number;
  rank: number;
  score: number;
  rank_delta: number;
}

/**
 * useRealtimeLeaderboard — merges the REST leaderboard snapshot with
 * live Reverb updates from the `exchange.leaderboard` channel.
 *
 * The hook starts with the polling-based React Query result and then
 * applies incremental rank/score patches as broadcast events arrive.
 */
export function useRealtimeLeaderboard(filters: LeaderboardFilters = {}): {
  data: LeaderboardEntry[] | undefined;
  pagination: { total: number; total_pages: number; page: number; limit: number } | undefined;
  isLoading: boolean;
  isLive: boolean;
} {
  const { data: restData, isLoading } = useLeaderboard(filters);
  const [livePatches, setLivePatches] = useState<Map<number, LiveRanking>>(new Map());
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    try {
      const echo = getEcho();
      const ch = echo.channel("exchange.leaderboard");

      ch.listen(".leaderboard.updated", (payload: { rankings: LiveRanking[] }) => {
        const map = new Map<number, LiveRanking>();
        payload.rankings.forEach((r) => map.set(r.location_id, r));
        setLivePatches(map);
        setIsLive(true);
      });
    } catch {
      setIsLive(false);
    }

    return () => {
      try {
        getEcho().leaveChannel("exchange.leaderboard");
      } catch {
        // noop
      }
    };
  }, []);

  // Merge REST data with live patches
  const merged = restData?.items?.map((entry) => {
    // branch_id is a string like "LOC_123"; extract numeric id for lookup
    const numId = Number(entry.branch_id?.replace(/\D/g, "") ?? 0);
    const patch = livePatches.get(numId);
    if (!patch) return entry;
    return {
      ...entry,
      composite_score: patch.score ?? entry.composite_score,
      rank:            patch.rank ?? entry.rank,
      rank_movement:   patch.rank_delta ?? entry.rank_movement,
    };
  });

  return {
    data: merged ?? restData?.items,
    pagination: restData?.pagination,
    isLoading,
    isLive,
  };
}
