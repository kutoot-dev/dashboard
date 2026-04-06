/**
 * Route: GET/PATCH /api/admin/fraud
 *
 * BACKEND SPEC:
 *   GET   — SELECT * FROM fraud_flags [WHERE investigation_status = :status]
 *           ORDER BY created_at DESC. Requires admin role.
 *   PATCH — UPDATE fraud_flags SET action_taken = :action,
 *           investigation_status = :status WHERE flag_id = :id.
 *           Requires admin role.
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_FRAUD_FLAGS } from "@/lib/mock/fraud-flags";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");

    let flags = [...MOCK_FRAUD_FLAGS];
    if (status) {
      flags = flags.filter((f) => f.investigation_status === status);
    }

    return NextResponse.json({
      success: true,
      data: flags,
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
          message: "Failed to fetch fraud flags",
        },
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, status } = body;

    if (!id || !action || !status) {
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
            message: "id, action, and status are required",
          },
        },
        { status: 400 },
      );
    }

    const flag = MOCK_FRAUD_FLAGS.find((f) => f.flag_id === id);
    if (!flag) {
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
            message: `Fraud flag ${id} not found`,
          },
        },
        { status: 404 },
      );
    }

    const updated = {
      ...flag,
      action_taken: action,
      investigation_status: status,
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
          message: "Failed to update fraud flag",
        },
      },
      { status: 500 },
    );
  }
}
