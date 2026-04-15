/**
 * Route: GET /api/scores/range
 *
 * Proxies to: GET /scores/range (pass through query params)
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.search;
    const res = await fetch(backendUrl(`/scores/range${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch scores by date range", "INTERNAL_ERROR", 500);
  }
}
