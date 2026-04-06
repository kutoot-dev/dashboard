/**
 * Route: POST /api/auth/logout
 *
 * BACKEND SPEC: Invalidate the user session/JWT on the server side.
 * Clear the auth cookie.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const jar = await cookies();
    jar.set("kutoot_auth", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({
      success: true,
      data: null,
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
        error: { code: "INTERNAL_ERROR", message: "Failed to process logout" },
      },
      { status: 500 },
    );
  }
}
