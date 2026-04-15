/**
 * Route: GET/PATCH /api/admin/fraud
 *
 * Proxies to: GET/PATCH /admin/fraud
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.search;
    const res = await fetch(backendUrl(`/admin/fraud${qs}`), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch fraud flags", "INTERNAL_ERROR", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(backendUrl("/admin/fraud"), {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to update fraud flag", "INTERNAL_ERROR", 500);
  }
}
