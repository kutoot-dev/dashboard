/**
 * Route: GET /api/merchant/[id]/visitors
 *
 * Proxies to: GET /merchant/{id}/visitors
 * Supports ?page=&limit=&from=&to=&search=
 */
import { NextRequest, NextResponse } from "next/server";
import { backendUrl, authHeaders, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const qs = request.nextUrl.search;
    const res = await fetch(backendUrl(`/merchant/${id}/visitors${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() }, error: { code: "INTERNAL_ERROR", message: "Failed to fetch visitors" } },
      { status: 500 },
    );
  }
}
