/**
 * Route: GET /api/branches/[id]/score
 *
 * Proxies to: GET /branches/{id}/score (pass through query params)
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const qs = request.nextUrl.search;
    const res = await fetch(backendUrl(`/branches/${id}/score${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch branch score", "INTERNAL_ERROR", 500);
  }
}
