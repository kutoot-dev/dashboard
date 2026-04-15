/**
 * Route: GET /api/merchant/[id]/transactions
 *
 * Proxies to: GET /merchant/{id}/transactions
 * Supports ?page=&limit=&from=&to=&status=&search=
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
    const res = await fetch(backendUrl(`/merchant/${id}/transactions${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() }, error: { code: "INTERNAL_ERROR", message: "Failed to fetch transactions" } },
      { status: 500 },
    );
  }
}
