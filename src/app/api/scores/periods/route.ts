/**
 * Route: GET /api/scores/periods
 *
 * Proxies to: GET /scores/periods
 */
import { backendUrl, authHeaders, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function GET() {
  try {
    const res = await fetch(backendUrl("/scores/periods"), {
      headers: await authHeaders(),
    });
    return proxyResponse(res);
  } catch {
    return errorResponse("Failed to fetch scoring periods", "INTERNAL_ERROR", 500);
  }
}
