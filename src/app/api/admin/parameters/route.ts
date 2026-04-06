/**
 * Route: GET/PUT /api/admin/parameters
 *
 * BACKEND SPEC:
 *   GET  — SELECT * FROM scoring_parameters ORDER BY parameter_key
 *   PUT  — UPDATE scoring_parameters SET parameter_value = :value,
 *          last_updated_by = :user, last_updated_at = NOW()
 *          WHERE parameter_key = :key
 * Both endpoints require admin role.
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_PARAMETERS } from "@/lib/mock/parameters";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: MOCK_PARAMETERS,
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
          message: "Failed to fetch parameters",
        },
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined || value === null) {
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
            message: "key and value are required",
          },
        },
        { status: 400 },
      );
    }

    const param = MOCK_PARAMETERS.find((p) => p.parameter_key === key);
    if (!param) {
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
            message: `Parameter ${key} not found`,
          },
        },
        { status: 404 },
      );
    }

    // Return the "updated" parameter (mock doesn't persist)
    const updated = {
      ...param,
      parameter_value: value,
      last_updated_by: "admin",
      last_updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updated,
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
          message: "Failed to update parameter",
        },
      },
      { status: 500 },
    );
  }
}
