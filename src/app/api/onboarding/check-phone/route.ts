/**
 * Route: POST /api/onboarding/check-phone
 * Check if phone number already exists as lead/merchant/application.
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_APPLICATIONS } from "@/lib/mock/onboarding";
import type { PhoneCheckResult } from "@/lib/types";

// Rate limit: 20 per IP per minute
const checkTracker = new Map<string, { count: number; resetAt: number }>();

function makeResponse(data: unknown, status = 200) {
  return NextResponse.json(
    {
      success: status < 400,
      data,
      meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() },
      error: status >= 400 ? { code: "ERROR", message: String(data) } : null,
    },
    { status },
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const tracker = checkTracker.get(ip);
    if (tracker && tracker.resetAt > now && tracker.count >= 20) {
      return makeResponse("Rate limit exceeded", 429);
    }
    if (!tracker || tracker.resetAt <= now) {
      checkTracker.set(ip, { count: 1, resetAt: now + 60000 });
    } else {
      tracker.count++;
    }

    const body = await request.json();
    const phone = String(body.phone || "").replace(/\D/g, "");

    if (phone.length !== 10) {
      return makeResponse("Invalid phone number", 400);
    }

    // Check mock applications
    const existing = MOCK_APPLICATIONS.find((a) => a.phone === phone);

    let result: PhoneCheckResult;
    if (existing) {
      if (existing.status === "active") {
        result = {
          exists: true,
          status: "active_merchant",
          application_id: existing.application_id,
          application_status: existing.status,
          message: "This merchant is already active on Kutoot.",
        };
      } else if (existing.submitted_at) {
        result = {
          exists: true,
          status: "already_submitted",
          application_id: existing.application_id,
          application_status: existing.status,
          message: `Application ${existing.application_id} already submitted for this number. Status: ${existing.status}`,
        };
      } else {
        result = {
          exists: true,
          status: "existing_lead",
          application_id: existing.application_id,
          application_status: existing.status,
          message: "A draft application exists for this number. You can resume it.",
        };
      }
    } else {
      result = {
        exists: false,
        status: "new",
        application_id: null,
        application_status: null,
        message: "This number is available for registration.",
      };
    }

    return makeResponse(result);
  } catch {
    return makeResponse("Internal server error", 500);
  }
}
