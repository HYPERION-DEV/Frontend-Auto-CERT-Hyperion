// frontend-hyperion/src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setOnSessionExpired } from '@/services/api';
import { SessionExpiredModal } from '@/components/auth/SessionExpiredModal';

interface AuthContextType {
  isSessionExpired: boolean;
}

const AuthContext = createContext<AuthContextType>({ isSessionExpired: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const triggerExpiredModal = () => {
    setIsSessionExpired(true);
    // Limpiamos la cookie de expiración cliente al activarse
    document.cookie = 'session_exp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  useEffect(() => {
    // 1. Escuchador reactivo para peticiones HTTP 401 de la API
    setOnSessionExpired(() => {
      triggerExpiredModal();
    });

    // 2. TEMPORIZADOR PASIVO SINCRONIZADO CON LA COOKIE
    const getSessionExpFromCookie = () => {
      const match = document.cookie.match(/(?:^|; )session_exp=([^;]*)/);
      return match ? parseInt(match[1], 10) : null;
    };

    const expTime = getSessionExpFromCookie();

    if (expTime) {
      const timeRemaining = expTime - Date.now();

      if (timeRemaining <= 0) {
        // La cookie ya venció
        triggerExpiredModal();
      } else {
        // Programamos el disparo exacto cuando la cookie expire
        const timer = setTimeout(() => {
          triggerExpiredModal();
        }, timeRemaining);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isSessionExpired }}>
      {children}
      {/* Modal flotante global */}
      <SessionExpiredModal isOpen={isSessionExpired} />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);