/**
 * Route: GET /api/admin/cohorts
 *
 * BACKEND SPEC: Aggregate branch_scores by sector for the latest closed period.
 *   For each sector: count branches, compute avg/median/top-quartile/bottom-quartile
 *   composite_index_score, count dormant branches.
 *   Optional ?sector_id= filter for single-sector view.
 *   Requires admin role.
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_SCORES } from "@/lib/mock/scores";
import { MOCK_BRANCHES } from "@/lib/mock/branches";
import { MOCK_SECTORS } from "@/lib/mock/sectors";
import { MOCK_SCORING_PERIODS } from "@/lib/mock/scoring-periods";

interface CohortHealthMetric {
  sector_id: string;
  sector_name: string;
  branch_count: number;
  avg_score: number;
  median_score: number;
  top_quartile_avg: number;
  bottom_quartile_avg: number;
  dormant_count: number;
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function quartileAvg(arr: number[], top: boolean): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const q = Math.max(1, Math.floor(sorted.length / 4));
  const slice = top ? sorted.slice(-q) : sorted.slice(0, q);
  return slice.reduce((sum, v) => sum + v, 0) / slice.length;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const sectorIdFilter = searchParams.get("sector_id") || undefined;

    // Find latest closed period
    const closed = MOCK_SCORING_PERIODS
      .filter((p) => p.status === "closed")
      .sort((a, b) => a.period_start.localeCompare(b.period_start));
    const latestPeriod = closed[closed.length - 1];
    if (!latestPeriod) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          timestamp: new Date().toISOString(),
          period_id: null,
          request_id: crypto.randomUUID(),
        },
        error: null,
      });
    }

    const periodScores = MOCK_SCORES.filter(
      (s) => s.period_id === latestPeriod.period_id,
    );

    let sectors = MOCK_SECTORS;
    if (sectorIdFilter) {
      sectors = sectors.filter((s) => s.sector_id === sectorIdFilter);
    }

    const metrics: CohortHealthMetric[] = sectors.map((sector) => {
      const sectorBranches = MOCK_BRANCHES.filter(
        (m) => m.sector_id === sector.sector_id,
      );
      const branchIds = new Set(sectorBranches.map((m) => m.branch_id));
      const scores = periodScores
        .filter((s) => branchIds.has(s.branch_id))
        .map((s) => s.composite_index_score);

      const dormant = sectorBranches.filter(
        (m) => m.status === "dormant",
      ).length;

      const avg =
        scores.length > 0
          ? Math.round(
              (scores.reduce((sum, v) => sum + v, 0) / scores.length) * 100,
            ) / 100
          : 0;

      return {
        sector_id: sector.sector_id,
        sector_name: sector.sector_name,
        branch_count: sectorBranches.length,
        avg_score: avg,
        median_score: Math.round(median(scores) * 100) / 100,
        top_quartile_avg: Math.round(quartileAvg(scores, true) * 100) / 100,
        bottom_quartile_avg:
          Math.round(quartileAvg(scores, false) * 100) / 100,
        dormant_count: dormant,
      };
    });

    return NextResponse.json({
      success: true,
      data: metrics,
      meta: {
        timestamp: new Date().toISOString(),
        period_id: latestPeriod.period_id,
        request_id: crypto.randomUUID(),
      },
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          period_id: null,
          request_id: crypto.randomUUID(),
        },
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to compute cohort health",
        },
      },
      { status: 500 },
    );
  }
}
