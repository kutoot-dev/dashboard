/**
 * Route: GET /api/ticker
 *
 * Proxies to: GET /ticker
 */
import { NextResponse } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET() {
  try {
    const res = await fetch(backendUrl("/ticker"), {
      headers: await authHeaders(),
    });
    // Return empty data for 404/401 instead of forwarding the error status
    if (res.status === 404 || res.status === 401) {
      return NextResponse.json({ success: true, data: [], meta: null, error: null });
    }
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch ticker data", "INTERNAL_ERROR", 500);
  }
}
