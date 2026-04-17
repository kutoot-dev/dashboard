import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "kutoot_auth";

const BRANCH_ROUTES = ["/dashboard", "/leaderboard", "/analysis", "/payouts", "/transactions", "/visitors", "/deals", "/store"];
const HO_ROUTES = ["/ho"];

function getHomeForRole(role: string): string {
  switch (role) {
    case "ho":
    case "admin":
      return "/ho";
    default: return "/dashboard";
  }
}

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
  const role = user?.role;

  // Redirect authenticated users away from login
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL(getHomeForRole(role ?? "branch"), request.url));
  }

  // Protect HO routes
  if (HO_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "ho" && role !== "admin") return NextResponse.redirect(new URL(getHomeForRole(role ?? "branch"), request.url));
    return NextResponse.next();
  }

  // Protect branch routes (accessible by branch and ho roles)
  if (BRANCH_ROUTES.some((route) => pathname.startsWith(route))) {
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
    "/ho/:path*",
    "/onboard/:path*",
    "/login",
  ],
};
