/**
 * Route: GET/POST /api/admin/overrides
 * Proxies to: GET/POST /admin/overrides
 */
import { NextRequest, NextResponse } from "next/server";
import { backendUrl, authHeaders, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.search;
    const res = await fetch(backendUrl(`/admin/overrides${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Failed to fetch overrides" } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/admin/overrides"), {
      method: "POST",
      headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Failed to create override" } },
      { status: 500 },
    );
  }
}
