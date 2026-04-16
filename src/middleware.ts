import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "kutoot_auth";
const FILAMENT_URL = process.env.NEXT_PUBLIC_FILAMENT_URL ?? "http://kutoot.test/admin";

const BRANCH_ROUTES = ["/dashboard", "/leaderboard", "/analysis", "/payouts"];
const HO_ROUTES = ["/ho"];

function getHomeForRole(role: string): string {
  switch (role) {
    case "ho": return "/ho";
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

  // Admin users belong in Filament — redirect them out of the dashboard.
  if (role === "admin") {
    return NextResponse.redirect(FILAMENT_URL);
  }

  // Redirect authenticated users away from login
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL(getHomeForRole(role ?? "branch"), request.url));
  }

  // Protect HO routes
  if (HO_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "ho") return NextResponse.redirect(new URL(getHomeForRole(role ?? "branch"), request.url));
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
    "/ho/:path*",
    "/onboard/:path*",
    "/login",
  ],
};
