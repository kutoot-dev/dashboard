/**
 * Route: GET /api/merchant/[id]/transactions/summary
 *
 * Proxies to: /merchant/{id}/transactions/summary on the kutoot backend.
 * Returns daily-bucketed transaction totals for the trend chart, honouring
 * the same from/to/status/search filters as the table.
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
    const res = await fetch(
      backendUrl(`/merchant/${id}/transactions/summary${qs ? `?${qs}` : ""}`),
      { headers: await authHeaders(), cache: "no-store" },
    );
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to load transactions summary", "INTERNAL_ERROR", 500);
  }
}
