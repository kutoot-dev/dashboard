/**
 * Route: GET /api/scores/periods
 *
 * BACKEND SPEC: SELECT * FROM scoring_periods ORDER BY period_start ASC.
 * Returns all scoring periods with their status (open, calculating, closed).
 */
import { NextResponse } from "next/server";
import { MOCK_SCORING_PERIODS } from "@/lib/mock/scoring-periods";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: MOCK_SCORING_PERIODS,
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
          message: "Failed to fetch scoring periods",
        },
      },
      { status: 500 },
    );
  }
}
