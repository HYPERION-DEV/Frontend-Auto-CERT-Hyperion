// frontend-hyperion/src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setOnSessionExpired } from '@/services/api';
import { SessionExpiredModal } from '@/components/auth/SessionExpiredModal';

interface AuthContextType {
  isSessionExpired: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isSessionExpired: false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const triggerExpiredModal = () => {
    setIsSessionExpired(true);
    // Limpiamos la cookie de expiración cliente al activarse
    document.cookie = 'session_exp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const logout = async () => {
    // Limpiar cookies de sesión en el cliente
    document.cookie = 'session_exp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
  };

  useEffect(() => {
    // 1. Escuchador reactivo para peticiones HTTP 401 interceptadas en la API
    setOnSessionExpired(() => {
      triggerExpiredModal();
    });

    // 2. Temporizador pasivo sincronizado con la cookie session_exp
    const getSessionExpFromCookie = () => {
      const match = document.cookie.match(/(?:^|; )session_exp=([^;]*)/);
      return match ? parseInt(match[1], 10) : null;
    };

    const expTime = getSessionExpFromCookie();

    if (expTime) {
      const timeRemaining = expTime - Date.now();

      if (timeRemaining <= 0) {
        triggerExpiredModal();
      } else {
        const timer = setTimeout(() => {
          triggerExpiredModal();
        }, timeRemaining);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isSessionExpired, logout }}>
      {children}
      <SessionExpiredModal isOpen={isSessionExpired} />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);