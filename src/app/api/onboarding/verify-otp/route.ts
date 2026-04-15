/**
 * Route: POST /api/onboarding/verify-otp
 *
 * Proxies to: POST /onboarding/verify-otp
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/onboarding/verify-otp"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to verify OTP", "INTERNAL_ERROR", 500);
  }
}
