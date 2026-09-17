// frontend-hyperion/src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedRoute, isPublicRoute, ROUTES } from '@/config/routes';

export function middleware(request: NextRequest) {
  // 1. Obtener la cookie HttpOnly enviada desde el Backend
  const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 2. CASO A: Intento de entrar a ruta protegida (/certificates, /certificates/new, etc.) SIN TOKEN
  if (!token && isProtectedRoute(pathname)) {
    const loginUrl = new URL(ROUTES.AFTER_LOGOUT, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. CASO B: Usuario AUTENTICADO intentando entrar al /login
  if (token && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.AFTER_LOGIN, request.url));
  }

  return NextResponse.next();
}

// Configuración del Matcher estricto
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};