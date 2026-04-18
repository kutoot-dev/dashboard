/**
 * Route: GET /api/merchant/[id]/transactions
 *
 * Proxies to: /merchant/{id}/transactions on the kutoot backend.
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const qs = req.nextUrl.searchParams.toString();
    const res = await fetch(backendUrl(`/merchant/${id}/transactions${qs ? `?${qs}` : ""}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to list transactions", "INTERNAL_ERROR", 500);
  }
}
