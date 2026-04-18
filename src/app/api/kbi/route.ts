/**
 * Route: GET /api/kbi
 *
 * Proxies to: GET /kbi
 */
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET() {
  try {
    const res = await fetch(backendUrl("/kbi"), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch KBI data", "INTERNAL_ERROR", 500);
  }
}
