/**
 * Route: POST /api/onboarding/verify-gst
 * Verify GST number via external API (mocked).
 * Non-blocking: API failure results in pending_manual_review, never stops onboarding.
 */
import { NextRequest, NextResponse } from "next/server";
import type { GstVerifyResult } from "@/lib/types";

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
    const body = await request.json();
    const gst = String(body.gst_number || "").trim().toUpperCase();
    const gstPattern = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}Z[A-Z0-9]{1}$/;

    if (!gst || !gstPattern.test(gst)) {
      const result: GstVerifyResult = {
        valid: false,
        business_name: null,
        business_address: null,
        status: "failed",
        message: "Invalid GST number format. Expected: 29ABCDE1234F1Z5",
      };
      return makeResponse(result);
    }

    // Mock: simulate API success for numbers starting with valid state codes
    // Simulate random failure (10% chance) to test non-blocking behavior
    const random = Math.random();
    if (random < 0.1) {
      // Simulate API failure
      const result: GstVerifyResult = {
        valid: false,
        business_name: null,
        business_address: null,
        status: "pending_manual_review",
        message:
          "GST verification service temporarily unavailable. Application will proceed with manual review.",
      };
      return makeResponse(result);
    }

    // Mock: return fake verified data
    const stateCode = gst.substring(0, 2);
    const states: Record<string, string> = {
      "29": "Karnataka",
      "27": "Maharashtra",
      "07": "Delhi",
      "33": "Tamil Nadu",
      "06": "Haryana",
    };

    const result: GstVerifyResult = {
      valid: true,
      business_name: body.owner_name
        ? `${body.owner_name} Enterprises`
        : "Registered Business",
      business_address: `Registered Address, ${states[stateCode] || "India"}`,
      status: "verified",
      message: "GST number verified successfully.",
    };
    return makeResponse(result);
  } catch {
    // API failure should NOT block — return pending_manual_review
    const result: GstVerifyResult = {
      valid: false,
      business_name: null,
      business_address: null,
      status: "pending_manual_review",
      message:
        "Verification service error. Application will proceed with manual review.",
    };
    return makeResponse(result);
  }
}
