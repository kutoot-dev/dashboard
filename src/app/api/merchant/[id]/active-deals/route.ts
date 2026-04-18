/**
 * Route: GET /api/merchant/[id]/active-deals
 *
 * Proxies to: /merchant/{id}/active-deals on the kutoot backend.
 * Returns the list of active discount coupons for ANY merchant location
 * (used by the rankings → merchant profile page).
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(backendUrl(`/merchant/${id}/active-deals`), {
      headers: await authHeaders(),
      cache: "no-store",
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to load active deals", "INTERNAL_ERROR", 500);
  }
}
