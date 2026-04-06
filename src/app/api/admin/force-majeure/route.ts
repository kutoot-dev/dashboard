/**
 * Route: GET/POST /api/admin/force-majeure
 *
 * BACKEND SPEC:
 *   GET  — SELECT * FROM force_majeure_events ORDER BY start_timestamp DESC.
 *          Requires admin role.
 *   POST — INSERT INTO force_majeure_events (...) VALUES (...).
 *          Auto-generate event_id and created_at. Requires admin role.
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_FORCE_MAJEURE } from "@/lib/mock/force-majeure";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: MOCK_FORCE_MAJEURE,
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
          message: "Failed to fetch force majeure events",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_name,
      event_type,
      affected_location_ids,
      start_timestamp,
      end_timestamp,
      scoring_adjustment_type,
    } = body;

    if (
      !event_name ||
      !event_type ||
      !affected_location_ids ||
      !start_timestamp ||
      !end_timestamp ||
      !scoring_adjustment_type
    ) {
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
            message:
              "event_name, event_type, affected_location_ids, start_timestamp, end_timestamp, and scoring_adjustment_type are required",
          },
        },
        { status: 400 },
      );
    }

    const newEvent = {
      event_id: `fm-${String(MOCK_FORCE_MAJEURE.length + 1).padStart(3, "0")}`,
      event_name,
      event_type,
      affected_location_ids,
      start_timestamp,
      end_timestamp,
      scoring_adjustment_type,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newEvent,
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
          message: "Failed to create force majeure event",
        },
      },
      { status: 500 },
    );
  }
}
