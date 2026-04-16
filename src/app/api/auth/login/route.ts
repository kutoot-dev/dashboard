/**
 * Route: POST /api/auth/login
 *
 * Proxies to: POST /auth/login
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendBaseUrl, backendUrl, errorResponse, proxyResponse } from "@/lib/api/server/proxy";

export async function POST(request: NextRequest) {
  const targetUrl = backendUrl("/auth/login");

  try {
    const body = await request.json();
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return proxyResponse(res, { proxyTarget: targetUrl });
    }

    const json = await res.json();
    const token = json.token || res.headers.get("X-Auth-Token");
    const authUser = json.data;

    const jar = await cookies();

    if (token) {
      jar.set("kutoot_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    if (authUser) {
      jar.set("kutoot_auth", JSON.stringify(authUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({
      success: json.success,
      data: authUser,
      meta: {
        ...(json.meta ?? {}),
        proxy_target: targetUrl,
      },
      error: json.error,
    });
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    const configuredEnv = process.env.KUTOOT_BACKEND_URL ?? process.env.kutoot_backend_url ?? null;

    console.error("[api/auth/login] proxy failure", {
      proxy_target: targetUrl,
      backend_base_url: backendBaseUrl(),
      configured_backend_env: configuredEnv,
      reason,
    });

    return errorResponse("Failed to process login", "INTERNAL_ERROR", 500, {
      proxy_target: targetUrl,
      backend_base_url: backendBaseUrl(),
      configured_backend_env: configuredEnv,
      reason,
    });
  }
}
