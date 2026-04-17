/**
 * Mock Data: Leaderboard Computation
 *
 * Computes a filtered, sorted leaderboard from scores, branches,
 * sectors, and locations. Supports filtering by period, sector, and location.
 * Returns data matching the LeaderboardEntry API shape.
 */

import type { LeaderboardEntry } from "@/lib/types";
import { MOCK_BRANCHES } from "./branches";
import { MOCK_SCORES } from "./scores";
import { MOCK_SECTORS } from "./sectors";
import { MOCK_LOCATIONS } from "./locations";
import { MOCK_SCORING_PERIODS } from "./scoring-periods";

/**
 * Compute a leaderboard for a given period (defaults to latest closed).
 * Optionally filter by sector and/or location, or by a date range.
 * When startDate/endDate are provided, the latest closed period overlapping
 * that range is used as the reference period.
 */
export function computeLeaderboard(
  periodId?: string,
  sectorId?: string,
  locationId?: string,
  startDate?: string,
  endDate?: string,
): LeaderboardEntry[] {
  // Resolve target period
  const targetPeriodId =
    periodId ??
    (() => {
      let candidates = MOCK_SCORING_PERIODS.filter((p) => p.status === "closed");

      // Narrow to periods overlapping the requested date range
      if (startDate || endDate) {
        const rangeStart = startDate ? new Date(`${startDate}T00:00:00Z`) : new Date(0);
        const rangeEnd = endDate ? new Date(`${endDate}T23:59:59Z`) : new Date();
        const inRange = candidates.filter((p) => {
          const pStart = new Date(p.period_start);
          const pEnd = new Date(p.period_end);
          return pStart <= rangeEnd && pEnd >= rangeStart;
        });
        // Use narrowed list if any periods found, otherwise fall back to all closed
        if (inRange.length > 0) candidates = inRange;
      }

      const sorted = candidates.sort((a, b) => a.period_start.localeCompare(b.period_start));
      return sorted.length > 0 ? sorted[sorted.length - 1].period_id : MOCK_SCORING_PERIODS[0].period_id;
    })();

  // Find previous period for change calculations
  const periodIdx = MOCK_SCORING_PERIODS.findIndex((p) => p.period_id === targetPeriodId);
  const prevPeriodId = periodIdx > 0 ? MOCK_SCORING_PERIODS[periodIdx - 1].period_id : null;

  // Get current period scores
  let periodScores = MOCK_SCORES.filter((s) => s.period_id === targetPeriodId);

  // Apply filters
  if (sectorId) {
    const branchIds = new Set(
      MOCK_BRANCHES.filter((m) => m.sector_id === sectorId).map((m) => m.branch_id),
    );
    periodScores = periodScores.filter((s) => branchIds.has(s.branch_id));
  }

  if (locationId) {
    const branchIds = new Set(
      MOCK_BRANCHES.filter((m) => m.location_id === locationId).map((m) => m.branch_id),
    );
    periodScores = periodScores.filter((s) => branchIds.has(s.branch_id));
  }

  // Sort by composite score descending
  periodScores.sort((a, b) => b.composite_index_score - a.composite_index_score);

  // Previous period scores for change computation
  const prevScoresMap = new Map(
    prevPeriodId
      ? MOCK_SCORES
          .filter((s) => s.period_id === prevPeriodId)
          .map((s) => [s.branch_id, s])
      : [],
  );

  // Build sparkline from all period scores for each branch
  const sparklineMap = new Map<string, number[]>();
  for (const branch of MOCK_BRANCHES) {
    const trajectory = MOCK_SCORES
      .filter((s) => s.branch_id === branch.branch_id)
      .sort((a, b) => {
        const aIdx = MOCK_SCORING_PERIODS.findIndex((p) => p.period_id === a.period_id);
        const bIdx = MOCK_SCORING_PERIODS.findIndex((p) => p.period_id === b.period_id);
        return aIdx - bIdx;
      })
      .map((s) => s.composite_index_score);
    sparklineMap.set(branch.branch_id, trajectory);
  }

  return periodScores.map((score, idx) => {
    const branch = MOCK_BRANCHES.find((m) => m.branch_id === score.branch_id);
    const sector = MOCK_SECTORS.find((s) => s.sector_id === branch?.sector_id);
    const location = MOCK_LOCATIONS.find((l) => l.location_id === branch?.location_id);
    const prevScore = prevScoresMap.get(score.branch_id);

    const rank = idx + 1;
    const prevRank = prevScore?.final_rank ?? rank;
    const scoreChange = prevScore
      ? Math.round((score.composite_index_score - prevScore.composite_index_score) * 100) / 100
      : 0;

    // Map breakdown to API sub_scores shape using friendly labels
    const bd = score.score_breakdown;

    // Determine payout status
    let payoutStatus: "paid" | "non_monetary" | "none";
    if (score.payout_amount >= 50) {
      payoutStatus = "paid";
    } else if (score.payout_amount > 0) {
      payoutStatus = "non_monetary";
    } else {
      payoutStatus = "none";
    }

    return {
      rank,
      rank_movement: prevRank - rank,
      branch_id: score.branch_id,
      business_name: branch?.business_name ?? "Unknown",
      city_name: location?.city_name ?? "Unknown",
      state: location?.state ?? "Unknown",
      sector_name: sector?.sector_name ?? "Unknown",
      sector_id: sector?.sector_id ?? "",
      city_tier: location?.city_tier ?? "tier2",
      composite_score: score.composite_index_score,
      score_change: scoreChange,
      sub_scores: {
        shop_activity: bd.trading_performance ?? bd.gmv_score ?? 0,
        business_efficiency: bd.margin_efficiency ?? bd.commission_score ?? 0,
        location_advantage: bd.location_opportunity ?? bd.platform_capture_score ?? 0,
        growth_trend: bd.momentum ?? bd.user_growth_score ?? 0,
        community_score: bd.ecosystem_contribution ?? bd.referral_score ?? 0,
      },
      payout_status: payoutStatus,
      payout_amount: score.payout_amount,
      sparkline_data: sparklineMap.get(score.branch_id) ?? [],
    };
  });
}
