/**
 * Route: GET /api/admin/cohorts
 *
 * Proxies to: GET /admin/cohorts (pass through query params)
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.search;
    const res = await fetch(backendUrl(`/admin/cohorts${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to compute cohort health", "INTERNAL_ERROR", 500);
  }
}
