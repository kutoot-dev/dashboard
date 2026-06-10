import { NextRequest, NextResponse } from "next/server";
import { MERCHANT_DEALS_ENABLED } from "@/lib/constants/features";

const AUTH_COOKIE = "kutoot_auth";
const SESSION_COOKIE = "kutoot_session";

const MERCHANT_ROUTES = [
  "/complete-basic-details",
  "/dashboard",
  "/leaderboard",
  "/payouts",
  "/transactions",
  "/reports",
  "/visitors",
  "/deals",
  "/discount-program",
  "/store",
  "/discover",
  "/academy",
  "/merchant-referral",
  "/team",
  "/wallet",
];

const STORE_TEAM_MEMBER_ROUTES = ["/transactions", "/reports"];

function parseAuthUser(cookie: { value: string } | undefined): { role?: string; store_role?: string } | null {
  if (!cookie?.value) return null;

  try {
    const decoded = decodeURIComponent(cookie.value);
    return JSON.parse(decoded);
  } catch {
    try {
      return JSON.parse(cookie.value);
    } catch {
      return null;
    }
  }
}

function hasActiveSession(request: NextRequest): boolean {
  const user = parseAuthUser(request.cookies.get(AUTH_COOKIE));
  const session = request.cookies.get(SESSION_COOKIE);
  return user !== null && session?.value === "1";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  if (pathname.startsWith("/onboard") || pathname.startsWith("/operations-hub")) {
    return NextResponse.next();
  }

  const isAuthenticated = hasActiveSession(request);

  if (pathname === "/") {
    const user = parseAuthUser(request.cookies.get(AUTH_COOKIE));
    const home =
      isAuthenticated && user?.role === "merchant" && user.store_role === "manager"
        ? "/transactions"
        : "/dashboard";
    return NextResponse.redirect(new URL(isAuthenticated ? home : "/login", request.url));
  }

  // Redirect authenticated users away from login
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!MERCHANT_DEALS_ENABLED && pathname.startsWith("/deals")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect merchant routes
  if (MERCHANT_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      if (pathname !== "/login") {
        loginUrl.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    const user = parseAuthUser(request.cookies.get(AUTH_COOKIE));
    if (user?.role === "merchant" && user.store_role === "manager") {
      const allowed = STORE_TEAM_MEMBER_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      );
      if (!allowed) {
        return NextResponse.redirect(new URL("/transactions", request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/complete-basic-details",
    "/dashboard",
    "/dashboard/:path*",
    "/leaderboard/:path*",
    "/payouts/:path*",
    "/transactions/:path*",
    "/reports/:path*",
    "/visitors/:path*",
    "/deals/:path*",
    "/discount-program/:path*",
    "/store/:path*",
    "/discover/:path*",
    "/academy/:path*",
    "/merchant-referral/:path*",
    "/onboard/:path*",
    "/operations-hub",
    "/operations-hub/:path*",
    "/login",
  ],
};
