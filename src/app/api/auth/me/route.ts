/**
 * Route: GET /api/auth/me
 *
 * BACKEND SPEC: Decode the JWT/session cookie and return the authenticated
 * user record. Return 401 if not authenticated.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/types";

export async function GET() {
  try {
    const jar = await cookies();
    const authCookie = jar.get("kutoot_auth");

    if (!authCookie?.value) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          meta: {
            timestamp: new Date().toISOString(),
            period_id: null,
            request_id: crypto.randomUUID(),
          },
          error: {
            code: "AUTH_NOT_AUTHENTICATED",
            message: "Not authenticated",
          },
        },
        { status: 401 },
      );
    }

    const user: AuthUser = JSON.parse(authCookie.value);

    return NextResponse.json({
      success: true,
      data: user,
      meta: {
        timestamp: new Date().toISOString(),
        period_id: null,
        request_id: crypto.randomUUID(),
      },
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          period_id: null,
          request_id: crypto.randomUUID(),
        },
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to read auth state",
        },
      },
      { status: 500 },
    );
  }
}
