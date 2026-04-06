/**
 * Route: GET /api/merchants/[id]/volume
 *
 * BACKEND SPEC: Aggregate transaction volumes per scoring period for the
 * given merchant. Return as histogram-ready VolumeBar[] with color coding
 * (green for gain periods, red for loss periods).
 */
import { NextRequest, NextResponse } from "next/server";
import { getMerchantVolume } from "@/lib/mock/candlesticks";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const volume = getMerchantVolume(id);

    if (volume.length === 0) {
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
            message: `No volume data for merchant ${id}`,
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: volume,
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
          message: "Failed to fetch volume data",
        },
      },
      { status: 500 },
    );
  }
}
