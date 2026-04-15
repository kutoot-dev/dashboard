/**
 * Route: POST /api/admin/payouts/simulate
 *
 * Proxies to: POST /admin/payouts/simulate
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/admin/payouts/simulate"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to simulate payout", "INTERNAL_ERROR", 500);
  }
}
