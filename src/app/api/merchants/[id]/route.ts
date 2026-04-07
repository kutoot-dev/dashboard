/**
 * Route: GET /api/merchants/[id]
 *
 * BACKEND SPEC: SELECT * FROM merchants WHERE merchant_id = :id.
 * Join with sectors and locations for enriched data if needed.
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_BRANCHES } from "@/lib/mock/branches";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const merchant = MOCK_BRANCHES.find((m) => m.branch_id === id);

    if (!merchant) {
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
            message: `Branch ${id} not found`,
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: merchant,
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
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch branch" },
      },
      { status: 500 },
    );
  }
}
