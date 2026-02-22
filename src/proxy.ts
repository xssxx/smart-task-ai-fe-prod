import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "auth-token";
const ROUTES = {
  HOME: "/app/home",
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  CALLBACK: "/auth/callback",
  PROFILE_SETUP: "/auth/profile-setup",
  PROFILE: "/app/profile",
} as const;

const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.CALLBACK];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = !!token;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (pathname === "/") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
    }
    return NextResponse.redirect(new URL(ROUTES.HOME, req.url));
  }

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
  }

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

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
};
