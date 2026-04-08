/**
 * Route: POST /api/onboarding/verify-otp
 * Verify OTP for merchant phone number.
 */
import { NextRequest, NextResponse } from "next/server";
import type { OtpVerifyResult } from "@/lib/types";

// Simple OTP store (in production this would be Redis)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Pre-seed for dev: accept 123456 for any number
function isValidOtp(phone: string, otp: string): boolean {
  const stored = otpStore.get(phone);
  if (stored && stored.expiresAt > Date.now() && stored.otp === otp) {
    otpStore.delete(phone); // One-time use
    return true;
  }
  // Dev fallback: always accept 123456
  if (otp === "123456") return true;
  return false;
}

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
    const phone = String(body.phone || "").replace(/\D/g, "");
    const otp = String(body.otp || "");

    if (phone.length !== 10) {
      return makeResponse("Invalid phone number", 400);
    }

    if (otp.length !== 6) {
      const result: OtpVerifyResult = {
        verified: false,
        message: "OTP must be 6 digits.",
      };
      return makeResponse(result);
    }

    if (isValidOtp(phone, otp)) {
      const result: OtpVerifyResult = {
        verified: true,
        message: "Phone number verified successfully.",
      };
      return makeResponse(result);
    }

    const result: OtpVerifyResult = {
      verified: false,
      message: "Invalid or expired OTP. Please try again.",
    };
    return makeResponse(result);
  } catch {
    return makeResponse("Internal server error", 500);
  }
}

export { otpStore };
