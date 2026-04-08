/**
 * Route: GET /api/scores/range
 *
 * BACKEND SPEC: Return branch scores for all scoring periods that overlap
 *   with the given date range. Accepts startDate and endDate as ISO date
 *   strings (YYYY-MM-DD). Defaults to all periods if no range given.
 *   SELECT bs.* FROM branch_scores bs
 *   JOIN scoring_periods sp ON bs.period_id = sp.period_id
 *   WHERE sp.period_start <= :endDate AND sp.period_end >= :startDate
 *   ORDER BY sp.period_start ASC, bs.final_rank ASC
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_SCORES } from "@/lib/mock/scores";
import { MOCK_SCORING_PERIODS } from "@/lib/mock/scoring-periods";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    // Filter periods that overlap with the requested date range
    let periodsInRange = MOCK_SCORING_PERIODS;
    if (startDate || endDate) {
      const rangeStart = startDate ? new Date(`${startDate}T00:00:00Z`) : new Date(0);
      const rangeEnd = endDate ? new Date(`${endDate}T23:59:59Z`) : new Date();

      periodsInRange = MOCK_SCORING_PERIODS.filter((p) => {
        const pStart = new Date(p.period_start);
        const pEnd = new Date(p.period_end);
        return pStart <= rangeEnd && pEnd >= rangeStart;
      });
    }

    const periodIds = new Set(periodsInRange.map((p) => p.period_id));
    const scores = MOCK_SCORES
      .filter((s) => periodIds.has(s.period_id))
      .sort((a, b) => a.final_rank - b.final_rank);

    return NextResponse.json({
      success: true,
      data: scores,
      meta: {
        timestamp: new Date().toISOString(),
        period_id: null,
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
          message: "Failed to fetch scores by date range",
        },
      },
      { status: 500 },
    );
  }
}
