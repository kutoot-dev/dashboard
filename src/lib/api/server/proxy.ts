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
export function backendBaseUrl(): string {
  const configured =
    process.env.KUTOOT_BACKEND_URL ??
    process.env.kutoot_backend_url ??
    "http://kutoot.test/api/dashboard";

  const trimmed = configured.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!parsed.pathname || parsed.pathname === "/") {
      parsed.pathname = "/api/dashboard";
    }
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return "http://kutoot.test/api/dashboard";
  }
}

/** Base URL of the kutoot Laravel backend (server-side env only). */
export function backendUrl(path: string): string {
  const base = backendBaseUrl();
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
  details?: Record<string, unknown>,
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
      error: { code, message, ...(details ? { details } : {}) },
    },
    { status },
  );
}

/** Proxy a backend fetch response directly back to the client. */
export async function proxyResponse(
  backendRes: Response,
  options?: { proxyTarget?: string },
): Promise<Response> {
  const body = await backendRes.text();

  const headers = new Headers({ "Content-Type": "application/json" });
  if (options?.proxyTarget) {
    headers.set("X-Proxy-Target", options.proxyTarget);
  }

  if (!options?.proxyTarget) {
    return new Response(body, { status: backendRes.status, headers });
  }

  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    const meta = (parsed.meta as Record<string, unknown> | undefined) ?? {};
    parsed.meta = {
      ...meta,
      proxy_target: options.proxyTarget,
      upstream_status: backendRes.status,
    };

    return Response.json(parsed, {
      status: backendRes.status,
      headers,
    });
  } catch {
    return new Response(body, { status: backendRes.status, headers });
  }
}
