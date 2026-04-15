/**
 * Route: POST /api/onboarding/verify-bank
 *
 * Proxies to: POST /onboarding/verify-bank
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/onboarding/verify-bank"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to verify bank account", "INTERNAL_ERROR", 500);
  }
}
