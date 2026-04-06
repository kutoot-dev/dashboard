/**
 * Route: GET /api/merchants/[id]/score
 *
 * BACKEND SPEC: SELECT * FROM merchant_scores WHERE merchant_id = :id
 *   AND period_id = :periodId ORDER BY created_at DESC LIMIT 1.
 * If no period_id query param, use latest closed period.
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_SCORES } from "@/lib/mock/scores";
import { MOCK_SCORING_PERIODS } from "@/lib/mock/scoring-periods";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    let periodId = searchParams.get("period_id");

    if (!periodId) {
      const closed = MOCK_SCORING_PERIODS
        .filter((p) => p.status === "closed")
        .sort((a, b) => a.period_start.localeCompare(b.period_start));
      periodId = closed.length > 0
        ? closed[closed.length - 1].period_id
        : MOCK_SCORING_PERIODS[0].period_id;
    }

    const score = MOCK_SCORES.find(
      (s) => s.merchant_id === id && s.period_id === periodId,
    );

    if (!score) {
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
            message: `Score not found for merchant ${id} in period ${periodId}`,
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: score,
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
          message: "Failed to fetch merchant score",
        },
      },
      { status: 500 },
    );
  }
}
