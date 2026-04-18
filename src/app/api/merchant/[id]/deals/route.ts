/**
 * Route: GET/POST /api/merchant/[id]/deals
 *
 * Proxies to: /merchant/{id}/deals on the kutoot backend.
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
    const res = await fetch(backendUrl(`/merchant/${id}/deals${qs ? `?${qs}` : ""}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to list deals", "INTERNAL_ERROR", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.text();
    const res = await fetch(backendUrl(`/merchant/${id}/deals`), {
      method: "POST",
      headers: await authHeaders(),
      body,
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to create deal", "INTERNAL_ERROR", 500);
  }
}
