/**
 * Route: GET/PATCH /api/merchant/[id]/store
 *
 * Proxies to: /merchant/{id}/store on the kutoot backend.
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(backendUrl(`/merchant/${id}/store`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch store", "INTERNAL_ERROR", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.text();
    const res = await fetch(backendUrl(`/merchant/${id}/store`), {
      method: "PATCH",
      headers: await authHeaders(),
      body,
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to update store", "INTERNAL_ERROR", 500);
  }
}
