/**
 * Route: PATCH/DELETE /api/merchant/[id]/deals/[dealId]
 *
 * Proxies to: /merchant/{id}/deals/{dealId} on the kutoot backend.
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; dealId: string }> },
) {
  try {
    const { id, dealId } = await params;
    const body = await req.text();
    const res = await fetch(backendUrl(`/merchant/${id}/deals/${dealId}`), {
      method: "PATCH",
      headers: await authHeaders(),
      body,
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to update deal", "INTERNAL_ERROR", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
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
    return errorResponse("Failed to delete deal", "INTERNAL_ERROR", 500);
  }
}
