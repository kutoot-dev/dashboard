/**
 * Route: POST /api/admin/payouts/simulate
 *
 * BACKEND SPEC: Run the payout distribution formula for the given period
 *   without persisting results. Accept optional pool_override and top_n params.
 *   Formula: payout_i = pool * (score_i / sum(scores)) for top N merchants.
 *   Requires admin role.
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_SCORES } from "@/lib/mock/scores";
import { MOCK_MERCHANTS } from "@/lib/mock/merchants";
import { MOCK_SCORING_PERIODS } from "@/lib/mock/scoring-periods";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period_id, pool_override, top_n } = body;

    if (!period_id) {
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
            code: "VALIDATION_ERROR",
            message: "period_id is required",
          },
        },
        { status: 400 },
      );
    }

    const period = MOCK_SCORING_PERIODS.find((p) => p.period_id === period_id);
    if (!period) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          meta: {
            timestamp: new Date().toISOString(),
            period_id: period_id,
            request_id: crypto.randomUUID(),
          },
          error: {
            code: "NOT_FOUND",
            message: `Period ${period_id} not found`,
          },
        },
        { status: 404 },
      );
    }

    const poolAmount = pool_override ?? period.pool_amount;
    const maxRecipients = top_n ?? 50;

    // Get scores sorted by rank for this period
    const periodScores = MOCK_SCORES
      .filter((s) => s.period_id === period_id)
      .sort((a, b) => a.final_rank - b.final_rank)
      .slice(0, maxRecipients);

    const totalScore = periodScores.reduce(
      (sum, s) => sum + s.composite_index_score,
      0,
    );

    const entries = periodScores.map((s) => {
      const merchant = MOCK_MERCHANTS.find(
        (m) => m.merchant_id === s.merchant_id,
      );
      const payout =
        totalScore > 0
          ? Math.round((poolAmount * (s.composite_index_score / totalScore)) * 100) / 100
          : 0;

      return {
        merchant_id: s.merchant_id,
        business_name: merchant?.business_name ?? "Unknown",
        rank: s.final_rank,
        composite_score: s.composite_index_score,
        payout_amount: payout,
      };
    });

    const totalDistributed = entries.reduce(
      (sum, e) => sum + e.payout_amount,
      0,
    );

    return NextResponse.json({
      success: true,
      data: {
        period_id,
        pool_amount: poolAmount,
        total_distributed: Math.round(totalDistributed * 100) / 100,
        entries,
      },
      meta: {
        timestamp: new Date().toISOString(),
        period_id,
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
          message: "Failed to simulate payout",
        },
      },
      { status: 500 },
    );
  }
}
