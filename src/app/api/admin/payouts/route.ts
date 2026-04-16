/**
 * Route: GET /api/admin/payouts
 * Proxies to: GET /admin/payouts
 */
import { NextRequest, NextResponse } from "next/server";
import { backendUrl, authHeaders, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.search;
    const res = await fetch(backendUrl(`/admin/payouts${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Failed to fetch payouts" } },
      { status: 500 },
    );
  }
}
