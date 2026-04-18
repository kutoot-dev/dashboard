/**
 * Route: GET /api/merchant/dashboard
 *
 * Proxies to: /merchant/dashboard (aggregated KPIs for the dashboard home).
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(backendUrl(`/merchant/dashboard`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch dashboard", "INTERNAL_ERROR", 500);
  }
}
