import { NextRequest, NextResponse } from "next/server";

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/dashboard',
  '/budgets',
  '/budget-requests',
  '/transactions',
  '/invoices',
  '/clients',
  '/suppliers',
  '/requisitions',
  '/manage-company'
];

// Rutas que requieren rol de admin
const ADMIN_ROUTES = [
  '/dashboard',
  '/budgets',      // Solo admins pueden ver esta página, usuarios normales ven budget-requests
  '/manage-company'
];

export function middleware(request: NextRequest) {
  // Obtener la ruta actual
  const path = request.nextUrl.pathname;
  
  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route));
  
  // Verificar si la ruta actual requiere rol de admin
  const isAdminRoute = ADMIN_ROUTES.some(route => path.startsWith(route));
  
  // Obtener la cookie de sesión
  const sessionCookie = request.cookies.get('session')?.value;
  
  // Si es una ruta protegida y no hay cookie de sesión, redirigir al login
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Para rutas de admin, verificar rol (simplificado)
  if (isAdminRoute && sessionCookie) {
    try {
      // Decodificar base64 de la parte del payload (segunda parte de un JWT)
      const base64Payload = sessionCookie.split('.')[1];
      
      // Si no hay payload, probablemente no es un JWT válido
      if (!base64Payload) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // Decodificar base64 y convertir a objeto
      const decodedPayload = JSON.parse(
        Buffer.from(base64Payload, 'base64').toString('utf-8')
      );
      
      // Verificar si el usuario tiene rol admin
      if (decodedPayload.role !== 'admin') {
        // Si es la ruta /budgets, redirigir a /budget-requests
        if (path.startsWith('/budgets')) {
          return NextResponse.redirect(new URL('/budget-requests', request.url));
        }
        // Para otras rutas admin, redirigir al dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Error al verificar roles:', error);
      // Por seguridad, ante un error redirigir al login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (_next/, api/)
     * - static files (images, media, favicon.ico)
     * - Login, register, and root pages
     */
    '/((?!_next|api|.*\\..*|login|sign-up|$).*)',
  ],
}