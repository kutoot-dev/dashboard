/**
 * Route: POST /api/admin/payouts/mark-paid
 * Proxies to: POST /admin/payouts/mark-paid
 */
import { NextRequest, NextResponse } from "next/server";
import { backendUrl, authHeaders, proxyResponse } from "@/lib/api/server/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/admin/payouts/mark-paid"), {
      method: "POST",
      headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Failed to mark payouts" } },
      { status: 500 },
    );
  }
}
