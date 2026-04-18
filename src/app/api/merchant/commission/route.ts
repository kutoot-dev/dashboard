/**
 * Route: PATCH /api/merchant/commission
 *
 * Proxies to: /merchant/commission (updates commission_percentage for the authed merchant).
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.text();
    const res = await fetch(backendUrl(`/merchant/commission`), {
      method: "PATCH",
      headers: await authHeaders(),
      body,
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to update commission", "INTERNAL_ERROR", 500);
  }
}
