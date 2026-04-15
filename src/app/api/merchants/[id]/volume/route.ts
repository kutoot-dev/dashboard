/**
 * Route: GET /api/merchants/[id]/volume
 *
 * Proxies to: GET /branches/{id}/volume (merchants are aliases for branches)
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(backendUrl(`/branches/${id}/volume`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch volume data", "INTERNAL_ERROR", 500);
  }
}
