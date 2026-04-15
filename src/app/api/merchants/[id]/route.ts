/**
 * Route: GET /api/merchants/[id]
 *
 * Proxies to: GET /branches/{id} (merchants are aliases for branches)
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(backendUrl(`/branches/${id}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch branch", "INTERNAL_ERROR", 500);
  }
}
