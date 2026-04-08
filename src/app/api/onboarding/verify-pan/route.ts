/**
 * Route: POST /api/onboarding/verify-pan
 * Verify PAN number via external API (mocked).
 * Non-blocking: API failure results in pending_manual_review.
 */
import { NextRequest, NextResponse } from "next/server";
import type { PanVerifyResult } from "@/lib/types";

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
    const pan = String(body.pan_number || "").trim().toUpperCase();
    const ownerName = String(body.owner_name || "").trim().toUpperCase();
    const panPattern = /^[A-Z]{5}\d{4}[A-Z]{1}$/;

    if (!pan || !panPattern.test(pan)) {
      const result: PanVerifyResult = {
        valid: false,
        holder_name: null,
        name_match: false,
        status: "failed",
        message: "Invalid PAN format. Expected: ABCDE1234F",
      };
      return makeResponse(result);
    }

    // Simulate 10% API failure
    if (Math.random() < 0.1) {
      const result: PanVerifyResult = {
        valid: false,
        holder_name: null,
        name_match: false,
        status: "pending_manual_review",
        message:
          "PAN verification service temporarily unavailable. Application will proceed with manual review.",
      };
      return makeResponse(result);
    }

    // Mock: return the owner name as holder
    const holderName = ownerName || "PAN HOLDER NAME";
    const nameMatch = ownerName
      ? holderName.includes(ownerName.split(" ")[0])
      : false;

    const result: PanVerifyResult = {
      valid: true,
      holder_name: holderName,
      name_match: nameMatch,
      status: "verified",
      message: nameMatch
        ? "PAN verified. Name matches owner name."
        : "PAN verified, but name does not fully match. Please check.",
    };
    return makeResponse(result);
  } catch {
    const result: PanVerifyResult = {
      valid: false,
      holder_name: null,
      name_match: false,
      status: "pending_manual_review",
      message:
        "Verification service error. Application will proceed with manual review.",
    };
    return makeResponse(result);
  }
}
