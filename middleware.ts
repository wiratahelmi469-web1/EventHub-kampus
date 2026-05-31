import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Paths
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isLoginRoute = nextUrl.pathname === "/login";
  const isRegisterRoute = nextUrl.pathname === "/register";

  // Get user role if logged in
  const role = req.auth?.user?.role;

  // 1. Redirect if trying to access dashboard routing without authentication
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 2. Redirect if already logged in but trying to access login/register
  if ((isLoginRoute || isRegisterRoute) && isLoggedIn && role) {
    const mappedRole = role === "staf" ? "staff" : role;
    return NextResponse.redirect(new URL(`/dashboard/${mappedRole}`, nextUrl));
  }

  // 3. Prevent cross-role page access
  if (isDashboardRoute && isLoggedIn && role) {
    const segments = nextUrl.pathname.split("/");
    const dashboardRole = segments[2]; // /dashboard/[role]
    if (dashboardRole) {
      const userRoleNormalized = (role === "staf" ? "staff" : role).toLowerCase();
      const reqRoleNormalized = dashboardRole.toLowerCase();
      if (reqRoleNormalized !== userRoleNormalized) {
        return NextResponse.redirect(new URL(`/dashboard/${userRoleNormalized}`, nextUrl));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/"],
};
