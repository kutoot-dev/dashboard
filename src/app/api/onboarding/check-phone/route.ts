/**
 * Route: POST /api/onboarding/check-phone
 *
 * Proxies to: POST /onboarding/check-phone
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/onboarding/check-phone"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to check phone", "INTERNAL_ERROR", 500);
  }
}
