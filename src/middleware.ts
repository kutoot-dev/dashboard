import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "kutoot_auth";
const SESSION_COOKIE = "kutoot_session";

const MERCHANT_ROUTES = [
  "/dashboard",
  "/leaderboard",
  "/payouts",
  "/transactions",
  "/visitors",
  "/deals",
  "/store",
  "/discover",
  "/academy",
  "/merchant-referral",
];

function parseAuthUser(cookie: { value: string } | undefined): { role?: string } | null {
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
  if (pathname.startsWith("/onboard")) {
    return NextResponse.next();
  }

  const isAuthenticated = hasActiveSession(request);

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? "/dashboard" : "/login", request.url),
    );
  }

  // Redirect authenticated users away from login
  if (pathname === "/login" && isAuthenticated) {
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
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/leaderboard/:path*",
    "/payouts/:path*",
    "/transactions/:path*",
    "/visitors/:path*",
    "/deals/:path*",
    "/store/:path*",
    "/discover/:path*",
    "/academy/:path*",
    "/merchant-referral/:path*",
    "/onboard/:path*",
    "/login",
  ],
};
