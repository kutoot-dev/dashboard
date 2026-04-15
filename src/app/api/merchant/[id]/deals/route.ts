/**
 * Route: GET  /api/merchant/[id]/deals  — list deals for a branch
 *        POST /api/merchant/[id]/deals  — create a new deal
 *
 * Proxies to: GET  /merchant/{id}/deals
 *             POST /merchant/{id}/deals
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
    const res = await fetch(backendUrl(`/merchant/${id}/deals${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() }, error: { code: "INTERNAL_ERROR", message: "Failed to fetch deals" } },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const res = await fetch(backendUrl(`/merchant/${id}/deals`), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() }, error: { code: "INTERNAL_ERROR", message: "Failed to create deal" } },
      { status: 500 },
    );
  }
}
