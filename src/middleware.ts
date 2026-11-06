// frontend-hyperion/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedRoute, isPublicRoute, ROUTES } from '@/config/routes';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';

  const scriptPolicy = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const upgradeInsecure = isProd ? 'upgrade-insecure-requests;' : '';

  const cspHeader = `
  default-src 'self';
  script-src ${scriptPolicy};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' blob: data: https://*.supabase.co;
  connect-src 'self' https://*.supabase.co https://status.camerfirma.com https://api.json.pe http://localhost:4000 http://localhost:3000;
  frame-src 'self' blob: https://*.supabase.co;
  object-src 'self' blob: https://*.supabase.co;
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${upgradeInsecure}
`.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (!token && isProtectedRoute(pathname)) {
    const loginUrl = new URL(ROUTES.AFTER_LOGOUT, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.AFTER_LOGIN, request.url));
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (isProd) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};