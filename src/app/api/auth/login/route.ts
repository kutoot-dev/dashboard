/**
 * Route: POST /api/auth/login
 *
 * BACKEND SPEC: Validate email/password against users table (bcrypt hash).
 * Issue a signed JWT or create a server session. Set HttpOnly secure cookie.
 * Return the authenticated user profile.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MOCK_USERS = [
  {
    id: "user-branch-001",
    name: "Rajesh Sharma",
    email: "branch@kutoot.com",
    password: "password",
    role: "branch" as const,
    branch_id: "m-001",
    ho_id: null,
  },
  {
    id: "user-ho-001",
    name: "Sharma Group HO",
    email: "ho@kutoot.com",
    password: "password",
    role: "ho" as const,
    branch_id: null,
    ho_id: "ho-001",
  },
  {
    id: "user-admin-001",
    name: "Kutoot Admin",
    email: "admin@kutoot.com",
    password: "password",
    role: "admin" as const,
    branch_id: null,
    ho_id: null,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
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
            code: "VALIDATION_ERROR",
            message: "Email and password are required",
          },
        },
        { status: 400 },
      );
    }

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
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
            code: "AUTH_INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 },
      );
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id,
      ho_id: user.ho_id,
    };

    const jar = await cookies();
    jar.set("kutoot_auth", JSON.stringify(authUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      data: authUser,
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
        error: { code: "INTERNAL_ERROR", message: "Failed to process login" },
      },
      { status: 500 },
    );
  }
}
