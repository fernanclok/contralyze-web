import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";

const protectedRoutes = {
  "/dashboard": ["admin", "user"],
  "/admin": ["admin"], 
};
const publicRoutes = ["/login", "/register"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = Object.keys(protectedRoutes).includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // Bypass middleware for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute) {
    if (!session?.userId) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    const userRole = session.role; // Assuming the role is stored in the session
    const allowedRoles = protectedRoutes[path];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.nextUrl)); // Redirect to an unauthorized page
    }
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/admin', '/login', '/register'],
};