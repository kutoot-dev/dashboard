/**
 * Route: GET /api/branches/[id]/volume
 *
 * BACKEND SPEC: Aggregate transaction volumes per scoring period for the branch.
 */
import { NextRequest, NextResponse } from "next/server";
import { getBranchVolume } from "@/lib/mock/candlesticks";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const volume = getBranchVolume(id);

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
            message: `No volume data for branch ${id}`,
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
