/**
 * Route: GET /api/merchant/me
 *
 * Proxies to: /merchant/me (returns the authed merchant location).
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(backendUrl(`/merchant/me`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch merchant", "INTERNAL_ERROR", 500);
  }
}
