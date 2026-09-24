import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSessionToken } from "@/lib/auth/session";
import { verifySuperAdminSessionToken } from "@/lib/auth/super-admin-session";

const ADMIN_COOKIE_NAME = "tb_admin_session";
const SUPER_ADMIN_COOKIE_NAME = "dropx_super_admin_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─────────────────────────────────────────────
  // THIRUMALA BAKERY ADMIN
  // ─────────────────────────────────────────────

  if (pathname.startsWith("/admin")) {
    // /admin itself must reach the layout so it can
    // display the login modal when not authenticated.
    if (pathname === "/admin") {
      return NextResponse.next();
    }

    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const session = verifyAdminSessionToken(token);

    if (!session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  // ─────────────────────────────────────────────
  // DROPXCORP SUPER ADMIN
  // ─────────────────────────────────────────────

  if (pathname.startsWith("/super-admin")) {
    // /super-admin itself must reach the layout so it
    // can display the login screen when not authenticated.
    if (pathname === "/super-admin") {
      return NextResponse.next();
    }

    const token = request.cookies
      .get(SUPER_ADMIN_COOKIE_NAME)
      ?.value;

    if (!token) {
      return NextResponse.redirect(
        new URL("/super-admin", request.url)
      );
    }

    const session = verifySuperAdminSessionToken(token);

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(
        new URL("/super-admin", request.url)
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*"],
};