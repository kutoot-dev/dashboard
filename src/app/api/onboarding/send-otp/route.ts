/**
 * Route: POST /api/onboarding/send-otp
 * Send OTP to merchant phone number.
 */
import { NextRequest, NextResponse } from "next/server";
import type { OtpSendResult } from "@/lib/types";

// Rate limit: 3 per phone per hour, 10 per IP per hour
const phoneTracker = new Map<string, { count: number; resetAt: number }>();
const ipTracker = new Map<string, { count: number; resetAt: number }>();
// Store OTPs for verification
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

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
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    if (phone.length !== 10) {
      return makeResponse("Invalid phone number", 400);
    }

    // Rate limit by phone
    const pKey = `ph:${phone}`;
    const pTrack = phoneTracker.get(pKey);
    if (pTrack && pTrack.resetAt > now && pTrack.count >= 3) {
      const result: OtpSendResult = {
        sent: false,
        message: "OTP limit reached for this number. Try again in 1 hour.",
        expires_in_seconds: 0,
      };
      return makeResponse(result, 429);
    }
    if (!pTrack || pTrack.resetAt <= now) {
      phoneTracker.set(pKey, { count: 1, resetAt: now + 3600000 });
    } else {
      pTrack.count++;
    }

    // Rate limit by IP
    const iTrack = ipTracker.get(ip);
    if (iTrack && iTrack.resetAt > now && iTrack.count >= 10) {
      const result: OtpSendResult = {
        sent: false,
        message: "Too many OTP requests. Try again later.",
        expires_in_seconds: 0,
      };
      return makeResponse(result, 429);
    }
    if (!iTrack || iTrack.resetAt <= now) {
      ipTracker.set(ip, { count: 1, resetAt: now + 3600000 });
    } else {
      iTrack.count++;
    }

    // Generate mock OTP (always 123456 in dev)
    const otp = "123456";
    otpStore.set(phone, { otp, expiresAt: now + 300000 }); // 5 min expiry

    const result: OtpSendResult = {
      sent: true,
      message: `OTP sent to ${phone.slice(0, 2)}XXXXXX${phone.slice(8)}. Valid for 5 minutes. (Dev: use 123456)`,
      expires_in_seconds: 300,
    };

    return makeResponse(result);
  } catch {
    return makeResponse("Internal server error", 500);
  }
}

// Export otpStore for verify-otp route
export { otpStore };
