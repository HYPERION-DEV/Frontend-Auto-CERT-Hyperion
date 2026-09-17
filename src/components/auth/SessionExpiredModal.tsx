// frontend-hyperion/src/components/auth/SessionExpiredModal.tsx
'use client';

import React from 'react';
import { Lock, LogIn } from 'lucide-react';

interface Props {
  isOpen: boolean;
}

export function SessionExpiredModal({ isOpen }: Props) {
  if (!isOpen) return null;

  const handleRedirectToLogin = () => {
    window.location.href = '/login?expired=true';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <Lock className="h-7 w-7 text-amber-600" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-extrabold text-slate-800">Sesión Finalizada por Seguridad</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tu token de acceso ha expirado por inactividad. Ingresa tus credenciales nuevamente para continuar.
          </p>
        </div>

        <button
          onClick={handleRedirectToLogin}
          className="w-full py-3 bg-[#00668c] hover:bg-[#005270] text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          <span>Iniciar Sesión Nuevamente</span>
        </button>
      </div>
    </div>
  );
}