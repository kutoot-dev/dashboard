/**
 * Route: GET /api/leaderboard
 *
 * Proxies to: GET /leaderboard (pass through all query params)
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.search;
    const res = await fetch(backendUrl(`/leaderboard${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch leaderboard", "INTERNAL_ERROR", 500);
  }
}
