/**
 * Route: GET /api/branches/[id]/score-history
 *
 * Proxies to: GET /branches/{id}/score-history
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(backendUrl(`/branches/${id}/score-history`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch branch score history", "INTERNAL_ERROR", 500);
  }
}
