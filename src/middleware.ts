import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "kutoot_auth";

const MERCHANT_ROUTES = [
  "/dashboard",
  "/leaderboard",
  "/analysis",
  "/payouts",
  "/transactions",
  "/visitors",
  "/deals",
  "/store",
  "/discover",
  "/academy",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get(AUTH_COOKIE);

  // Public routes — no auth needed
  if (pathname.startsWith("/onboard")) {
    return NextResponse.next();
  }

  let user: { role?: string } | null = null;
  if (cookie?.value) {
    try {
      user = JSON.parse(cookie.value);
    } catch {
      user = null;
    }
  }

  const isAuthenticated = user !== null;

  // Redirect authenticated users away from login
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect merchant routes
  if (MERCHANT_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) return NextResponse.redirect(new URL("/login", request.url));
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
    "/transactions/:path*",
    "/visitors/:path*",
    "/deals/:path*",
    "/store/:path*",
    "/discover/:path*",
    "/academy/:path*",
    "/onboard/:path*",
    "/login",
  ],
};
