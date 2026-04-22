import { NextResponse } from "next/server";
import { auth } from "@/auth";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];
const PUBLIC_ROUTES = ["/", "/verify"];

export default auth((request) => {
  const { nextUrl } = request;
  const isLoggedIn = Boolean(request.auth?.user);
  const { pathname } = nextUrl;

  // Keep API routes out of redirect logic and authorize them in Route Handlers.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
