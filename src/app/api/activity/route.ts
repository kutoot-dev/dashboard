/**
 * Route: GET /api/activity
 *
 * Proxies to: GET /activity?limit=50
 */
import { type NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get("limit") ?? "50";
    const res = await fetch(backendUrl(`/activity?limit=${encodeURIComponent(limit)}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch activity data", "INTERNAL_ERROR", 500);
  }
}
