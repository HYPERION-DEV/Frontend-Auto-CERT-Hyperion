// src/components/auth/AuthGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isProtectedRoute } from '@/config/routes';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evita desajustes de hidratación entre servidor y cliente
  if (!mounted) {
    return null;
  }

  // Si la ruta no es protegida o ya pasó la validación del Middleware en el servidor, renderiza directo
  return <>{children}</>;
}