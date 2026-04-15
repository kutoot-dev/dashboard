/**
 * Route: GET/POST /api/admin/force-majeure
 *
 * Proxies to: GET/POST /admin/force-majeure
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET() {
  try {
    const res = await fetch(backendUrl("/admin/force-majeure"), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch force majeure events", "INTERNAL_ERROR", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/admin/force-majeure"), {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to create force majeure event", "INTERNAL_ERROR", 500);
  }
}
