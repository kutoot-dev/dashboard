/**
 * Route: PATCH  /api/merchant/[id]/deals/[dealId]  — toggle active/deactivate
 *        DELETE /api/merchant/[id]/deals/[dealId]  — delete deal
 *
 * Proxies to: PATCH  /merchant/{id}/deals/{dealId}
 *             DELETE /merchant/{id}/deals/{dealId}
 */
import { NextRequest, NextResponse } from "next/server";
import { backendUrl, authHeaders, proxyResponse } from "@/lib/api/server/proxy";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dealId: string }> },
) {
  try {
    const { id, dealId } = await params;
    const body = await request.json();
    const res = await fetch(backendUrl(`/merchant/${id}/deals/${dealId}`), {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() }, error: { code: "INTERNAL_ERROR", message: "Failed to update deal" } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; dealId: string }> },
) {
  try {
    const { id, dealId } = await params;
    const res = await fetch(backendUrl(`/merchant/${id}/deals/${dealId}`), {
      method: "DELETE",
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() }, error: { code: "INTERNAL_ERROR", message: "Failed to delete deal" } },
      { status: 500 },
    );
  }
}
