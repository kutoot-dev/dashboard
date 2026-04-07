/**
 * Route: GET /api/scores/[periodId]
 *
 * BACKEND SPEC: SELECT * FROM branch_scores WHERE period_id = :periodId
 *   ORDER BY final_rank ASC.
 * Returns all branch scores for the given scoring period.
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_SCORES } from "@/lib/mock/scores";
import { MOCK_SCORING_PERIODS } from "@/lib/mock/scoring-periods";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ periodId: string }> },
) {
  try {
    const { periodId } = await params;

    const period = MOCK_SCORING_PERIODS.find((p) => p.period_id === periodId);
    if (!period) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          meta: {
            timestamp: new Date().toISOString(),
            period_id: periodId,
            request_id: crypto.randomUUID(),
          },
          error: {
            code: "NOT_FOUND",
            message: `Scoring period ${periodId} not found`,
          },
        },
        { status: 404 },
      );
    }

    const scores = MOCK_SCORES
      .filter((s) => s.period_id === periodId)
      .sort((a, b) => a.final_rank - b.final_rank);

    return NextResponse.json({
      success: true,
      data: scores,
      meta: {
        timestamp: new Date().toISOString(),
        period_id: periodId,
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
          message: "Failed to fetch period scores",
        },
      },
      { status: 500 },
    );
  }
}
