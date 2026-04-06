import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "kutoot_auth";

const PROTECTED_ROUTES = ["/dashboard", "/leaderboard", "/analysis", "/payouts"];
const ADMIN_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get(AUTH_COOKIE);

  let user: { role?: string } | null = null;
  if (cookie?.value) {
    try {
      user = JSON.parse(cookie.value);
    } catch {
      user = null;
    }
  }

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === "admin";

  // Redirect authenticated users away from login
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect authenticated routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leaderboard/:path*",
    "/analysis/:path*",
    "/payouts/:path*",
    "/admin/:path*",
    "/login",
  ],
};
