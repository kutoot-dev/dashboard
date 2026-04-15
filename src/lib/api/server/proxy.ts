/**
 * Server-side proxy helper.
 *
 * Reads the httpOnly `kutoot_token` cookie and attaches it as a
 * Bearer token when forwarding requests to the kutoot Laravel backend.
 *
 * Usage (inside a Next.js route handler):
 *   import { backendUrl, authHeaders } from "@/lib/api/server/proxy";
 *   const res = await fetch(backendUrl("/merchant-locations/1/profile"), {
 *     headers: await authHeaders(),
 *   });
 */
import { cookies } from "next/headers";

/** Base URL of the kutoot Laravel backend (server-side env only). */
export function backendUrl(path: string): string {
  const base = (process.env.KUTOOT_BACKEND_URL ?? "http://kutoot.test/api/dashboard").replace(
    /\/+$/,
    "",
  );
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalised}`;
}

/** Returns Authorization + JSON headers for a proxied fetch. */
export async function authHeaders(): Promise<Record<string, string>> {
  const jar = await cookies();
  const token = jar.get("kutoot_token")?.value;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Standard JSON error response shape used across all route handlers. */
export function errorResponse(
  message: string,
  code: string,
  status: number,
): Response {
  return Response.json(
    {
      success: false,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        period_id: null,
        request_id: crypto.randomUUID(),
      },
      error: { code, message },
    },
    { status },
  );
}

/** Proxy a backend fetch response directly back to the client. */
export async function proxyResponse(backendRes: Response): Promise<Response> {
  const body = await backendRes.text();
  return new Response(body, {
    status: backendRes.status,
    headers: { "Content-Type": "application/json" },
  });
}
