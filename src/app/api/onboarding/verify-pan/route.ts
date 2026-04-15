/**
 * Route: POST /api/onboarding/verify-pan
 *
 * Proxies to: POST /onboarding/verify-pan
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/onboarding/verify-pan"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to verify PAN", "INTERNAL_ERROR", 500);
  }
}
