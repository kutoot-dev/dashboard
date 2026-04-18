import { authHeaders, backendBaseUrl, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

/**
 * POST /api/broadcasting/auth
 *
 * Proxies Laravel Echo auth requests for private channels to the Laravel
 * backend, attaching the merchant's Sanctum bearer token from the httpOnly
 * `kutoot_token` cookie. The dashboard frontend never sees the token directly.
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    // Laravel broadcasting/auth expects x-www-form-urlencoded { socket_id, channel_name }.
    const bodyText = await request.text();

    const headers = {
      ...(await authHeaders()),
      "Content-Type": contentType.includes("application/json")
        ? "application/json"
        : "application/x-www-form-urlencoded",
    };

    const base = backendBaseUrl().replace(/\/api\/dashboard$/, "");
    const upstream = `${base}/broadcasting/auth`;

    const res = await fetch(upstream, {
      method: "POST",
      headers,
      body: bodyText,
      cache: "no-store",
    });

    return proxyResponse(res);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Broadcasting auth failed",
      "BROADCAST_AUTH_FAILED",
      502,
    );
  }
}
