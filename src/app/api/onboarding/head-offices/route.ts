/**
 * Route: GET /api/onboarding/head-offices
 *
 * Proxies to: GET /onboarding/head-offices
 */
import { NextRequest, NextResponse } from "next/server";
import { backendUrl, authHeaders, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(backendUrl("/onboarding/head-offices"), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() }, error: { code: "INTERNAL_ERROR", message: "Failed to fetch head offices" } },
      { status: 500 },
    );
  }
}
