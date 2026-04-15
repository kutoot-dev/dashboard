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
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch ticker data", "INTERNAL_ERROR", 500);
  }
}
