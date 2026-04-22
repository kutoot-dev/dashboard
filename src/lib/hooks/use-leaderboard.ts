import { useQuery } from "@tanstack/react-query";
import type { LeaderboardFilters } from "@/lib/types";
import {
  getLeaderboard,
  getTicker,
} from "@/lib/api/services/leaderboard.service";

export function useLeaderboard(filters: LeaderboardFilters = {}) {
  return useQuery({
    queryKey: ["leaderboard", filters],
    queryFn: () => getLeaderboard(filters),
    select: (res) => res.data,
  });
}

export function useTicker() {
  return useQuery({
    queryKey: ["ticker"],
    queryFn: () => getTicker(),
    refetchInterval: (query) => (query.state.error ? false : 30_000),
    retry: false,
    select: (res) => res.data,
  });
}
