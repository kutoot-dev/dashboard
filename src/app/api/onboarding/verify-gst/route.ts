/**
 * Route: POST /api/onboarding/verify-gst
 *
 * Proxies to: POST /onboarding/verify-gst
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/onboarding/verify-gst"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to verify GST", "INTERNAL_ERROR", 500);
  }
}
