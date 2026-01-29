import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Constants for proxy (can't use path aliases in proxy)
const AUTH_COOKIE_NAME = "auth-token";
const ROUTES = {
  HOME: "/app/home",
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  CALLBACK: "/auth/callback",
  PROFILE_SETUP: "/auth/profile-setup",
  PROFILE: "/app/profile",
} as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.CALLBACK];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get JWT token from cookie
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = !!token;

  // Check if current path is a public route
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Handle root path redirect
  if (pathname === "/") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
    }
    return NextResponse.redirect(new URL(ROUTES.HOME, req.url));
  }

  // If user is not authenticated and trying to access protected route, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
  }

  // If user is authenticated and trying to access auth pages (except callback and profile-setup), redirect to home
  if (
    isAuthenticated &&
    pathname.startsWith("/auth") &&
    pathname !== ROUTES.CALLBACK &&
    pathname !== ROUTES.PROFILE_SETUP
  ) {
    return NextResponse.redirect(new URL(ROUTES.HOME, req.url));
  }

  return NextResponse.next();
}

// Configuration for which paths the proxy should apply to
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
};
