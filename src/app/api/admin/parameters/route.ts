/**
 * Route: GET/PUT /api/admin/parameters
 *
 * Proxies to: GET/PUT /admin/parameters
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET() {
  try {
    const res = await fetch(backendUrl("/admin/parameters"), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch parameters", "INTERNAL_ERROR", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/admin/parameters"), {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to update parameter", "INTERNAL_ERROR", 500);
  }
}
