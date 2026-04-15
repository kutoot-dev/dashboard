/**
 * Route: POST /api/auth/logout
 *
 * Proxies to: POST /auth/logout
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendUrl, authHeaders, errorResponse } from "@/lib/api/server/proxy";

export async function POST() {
  try {
    const hdrs = await authHeaders();
    try {
      await fetch(backendUrl("/auth/logout"), { method: "POST", headers: hdrs });
    } catch { /* ignore */ }

    const jar = await cookies();
    jar.set("kutoot_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    jar.set("kutoot_auth", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });

    return NextResponse.json({
      success: true, data: null,
      meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() },
      error: null,
    });
  } catch {
    return errorResponse("Failed to process logout", "INTERNAL_ERROR", 500);
  }
}
