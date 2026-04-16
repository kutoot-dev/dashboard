/**
 * Route: GET /api/branches/[id]/payouts
 *
 * Proxies to: GET /branches/{id}/payouts
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(backendUrl(`/branches/${id}/payouts`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch branch payouts", "INTERNAL_ERROR", 500);
  }
}
