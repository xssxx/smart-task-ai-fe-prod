import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const config = {
  matcher: ["/app/:path*", "/auth/:path*"],
};

const secret = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ""
);

async function verifyJWT(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Get JWT token from cookies
  const token = req.cookies.get("auth-token")?.value;

  const isValidToken = token ? await verifyJWT(token) : false;

  // Redirect unauthenticated users trying to access /app
  if (!isValidToken && pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Redirect authenticated users trying to access /auth
  if (isValidToken && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/app/home", req.url));
  }

  return NextResponse.next();
}
