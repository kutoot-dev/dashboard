/**
 * Route: GET /api/auth/me
 *
 * Proxies to: GET /auth/me
 */
import { NextResponse } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET() {
  try {
    const hdrs = await authHeaders();
    if (!hdrs.Authorization) {
      return NextResponse.json(
        { success: false, data: null, meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() }, error: { code: "AUTH_NOT_AUTHENTICATED", message: "Not authenticated" } },
        { status: 401 },
      );
    }
    const res = await fetch(backendUrl("/auth/me"), { headers: hdrs });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to read auth state", "INTERNAL_ERROR", 500);
  }
}
