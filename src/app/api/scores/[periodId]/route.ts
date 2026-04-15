/**
 * Route: GET /api/scores/[periodId]
 *
 * Proxies to: GET /scores/{periodId}
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ periodId: string }> },
) {
  try {
    const { periodId } = await params;
    const res = await fetch(backendUrl(`/scores/${periodId}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch period scores", "INTERNAL_ERROR", 500);
  }
}
