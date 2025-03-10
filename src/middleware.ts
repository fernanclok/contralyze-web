import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";

const protectedRoutes = {
  "/dashboard": ["admin", "user"],
  "/dashboard/budgets": ["admin", "user"],
  "/clients": ["admin", "user"],
  "/suppliers": ["admin", "user"],
  "/manage-company": ["admin"], 
};
const publicRoutes = ["/", "/register"]; // Cambié "/login" por "/"

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = Object.keys(protectedRoutes).includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (path === "/" && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Bypass middleware for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    if (!session?.userId) {
      return NextResponse.redirect(new URL("/", req.nextUrl)); // Redirige a "/"
    }

    const userRole = session.role as string; // Assuming the role is stored in the session
    const allowedRoles = protectedRoutes[path as keyof typeof protectedRoutes];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.nextUrl)); // Redirect to an unauthorized page
    }
  }

  if (!session) {
    return NextResponse.redirect(new URL("/", req.nextUrl)); // Redirige a "/"
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/budgets', '/admin', '/', '/manage-company'],
};
