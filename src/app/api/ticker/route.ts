/**
 * Route: GET /api/ticker
 *
 * BACKEND SPEC: Compare current period scores vs previous period.
 * Return top N merchants by absolute score change, sorted descending.
 * Cache this for the duration of the current period.
 */
import { NextResponse } from "next/server";
import { getTickerData } from "@/lib/mock/ticker";

export async function GET() {
  try {
    const ticker = getTickerData();

    return NextResponse.json({
      success: true,
      data: ticker,
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
          message: "Failed to fetch ticker data",
        },
      },
      { status: 500 },
    );
  }
}
