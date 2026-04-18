/**
 * Route: GET/PUT /api/merchant/ui-prefs
 *
 * Proxies to: /merchant/ui-prefs (per-merchant dashboard layout + UI prefs).
 */
import { NextRequest } from "next/server";
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(backendUrl(`/merchant/ui-prefs`), {
      headers: await authHeaders(),
      cache: "no-store",
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to load UI preferences", "INTERNAL_ERROR", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.text();
    const res = await fetch(backendUrl(`/merchant/ui-prefs`), {
      method: "PUT",
      headers: await authHeaders(),
      body,
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to save UI preferences", "INTERNAL_ERROR", 500);
  }
}
