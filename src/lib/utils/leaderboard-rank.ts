import type {
  LeaderboardEntry,
  LeaderboardMyEntry,
  LeaderboardScoringParameter,
} from "@/lib/types";

/**
 * Rank for the viewer's branch — prefers the paginated table row (same sort as the list)
 * so the hero card always matches the highlighted table row.
 */
export function resolveMyLeaderboardRank(
  parameter: LeaderboardScoringParameter,
  myEntry: LeaderboardMyEntry | null | undefined,
  items: LeaderboardEntry[],
  branchId: string | null | undefined,
): number | null {
  if (branchId) {
    const row = items.find((item) => item.branch_id === branchId);
    if (row?.rank != null) {
      return row.rank;
    }
  }

  if (!myEntry) {
    return null;
  }

  if (myEntry.selected_parameter && myEntry.selected_parameter !== parameter) {
    return null;
  }

  return myEntry.rank ?? null;
}
