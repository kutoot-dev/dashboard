/**
 * Route: GET /api/ho/[hoId]/deals
 *
 * Proxies to: GET /ho/{hoId}/deals
 */
import { NextRequest, NextResponse } from "next/server";
import { backendUrl, authHeaders, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hoId: string }> },
) {
  try {
    const { hoId } = await params;
    const qs = request.nextUrl.search;
    const res = await fetch(backendUrl(`/ho/${hoId}/deals${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return NextResponse.json(
      { success: false, data: null, meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() }, error: { code: "INTERNAL_ERROR", message: "Failed to fetch HO deals" } },
      { status: 500 },
    );
  }
}
