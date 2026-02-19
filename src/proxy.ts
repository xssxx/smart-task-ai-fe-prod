import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from './i18n/config';

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
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  const locale = req.cookies.get('NEXT_LOCALE')?.value || defaultLocale;
  const validLocale = locales.includes(locale as any) ? locale : defaultLocale;

  let response = getRouteResponse(pathname, isAuthenticated, isPublicRoute, req.url);

  if (!req.cookies.get('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', validLocale);
  }

  return response;
}

function getRouteResponse(
  pathname: string,
  isAuthenticated: boolean,
  isPublicRoute: boolean,
  baseUrl: string
): NextResponse {
  if (pathname === "/") {
    const redirectTo = isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN;
    return NextResponse.redirect(new URL(redirectTo, baseUrl));
  }

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, baseUrl));
  }

  const isAuthRoute = pathname.startsWith("/auth");
  const isProtectedAuthRoute = isAuthRoute &&
    pathname !== ROUTES.CALLBACK &&
    pathname !== ROUTES.PROFILE_SETUP;

  if (isAuthenticated && isProtectedAuthRoute) {
    return NextResponse.redirect(new URL(ROUTES.HOME, baseUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
};
