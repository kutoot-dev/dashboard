/**
 * Route: POST /api/onboarding (create application)
 *        GET  /api/onboarding (list applications)
 *
 * Proxies to: POST/GET /onboarding
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/onboarding"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to create application", "INTERNAL_ERROR", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.search;
    const res = await fetch(backendUrl(`/onboarding${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch applications", "INTERNAL_ERROR", 500);
  }
}
