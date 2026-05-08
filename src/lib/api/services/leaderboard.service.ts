/**
 * Leaderboard Service
 *
 * BACKEND SPEC: Leaderboard computation and ticker tape endpoints.
 * Leaderboard should be computed server-side with proper SQL ranking
 * (RANK() OVER) and cached per period.
 */
import type {
  ApiResponse,
  LeaderboardData,
  LeaderboardEntry,
  LeaderboardFilters,
  TickerItem,
} from "@/lib/types";
import apiClient from "../client";

/**
 * Get the paginated leaderboard with optional filters.
 * @endpoint GET /api/leaderboard?page=&limit=&city_tier=&state=&period_id=
 * BACKEND SPEC: Compute ranked scores with joins to merchants, sectors,
 *   locations. Apply filters, paginate with OFFSET/LIMIT.
 */
export async function getLeaderboard(filters: LeaderboardFilters = {}) {
  const res = await apiClient.get<ApiResponse<LeaderboardData>>(
    "/leaderboard",
    { params: filters },
  );
  return res.data;
}

/**
 * Get ticker tape data (top movers).
 * @endpoint GET /api/ticker
 * BACKEND SPEC: Compare current vs previous period scores,
 *   return top N by absolute change.
 */
export async function getTicker() {
  const res = await apiClient.get<ApiResponse<TickerItem[]>>("/ticker");
  return res.data;
}
