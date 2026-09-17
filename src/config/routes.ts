// frontend-hyperion/src/config/routes.ts

export const ROUTES = {
  PUBLIC: ['/login', '/register', '/forgot-password'],
  PROTECTED: [
    '/certificates',
    '/certificates/new',
    '/account',
  ],
  PROTECTED_DYNAMIC: [
    /^\/certificates\/[^\/]+$/, // Protege /certificates/:id
  ],
  AFTER_LOGIN: '/certificates',
  AFTER_LOGOUT: '/login',
};

export function isProtectedRoute(pathname: string): boolean {
  const isStatic = ROUTES.PROTECTED.includes(pathname);
  if (isStatic) return true;

  return ROUTES.PROTECTED_DYNAMIC.some((regex) => regex.test(pathname));
}

export function isPublicRoute(pathname: string): boolean {
  return ROUTES.PUBLIC.includes(pathname);
}