/**
 * Route: GET /api/merchant/recent-redemptions
 *
 * Proxies to: /merchant/recent-redemptions (latest coupon redemptions for the authed merchant).
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(req: NextRequest) {
  try {
    const qs = req.nextUrl.searchParams.toString();
    const res = await fetch(backendUrl(`/merchant/recent-redemptions${qs ? `?${qs}` : ""}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch redemptions", "INTERNAL_ERROR", 500);
  }
}
