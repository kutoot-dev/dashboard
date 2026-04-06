/**
 * Route: GET /api/merchants/[id]/candlesticks
 *
 * BACKEND SPEC: Compute OHLC candlestick data from merchant_scores table.
 * open = previous period's close, close = current composite_index_score,
 * high/low derived from intra-period peaks. One candle per scoring period.
 */
import { NextRequest, NextResponse } from "next/server";
import { getMerchantCandlesticks } from "@/lib/mock/candlesticks";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const candles = getMerchantCandlesticks(id);

    if (candles.length === 0) {
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
            code: "NOT_FOUND",
            message: `No candlestick data for merchant ${id}`,
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: candles,
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
          message: "Failed to fetch candlestick data",
        },
      },
      { status: 500 },
    );
  }
}
