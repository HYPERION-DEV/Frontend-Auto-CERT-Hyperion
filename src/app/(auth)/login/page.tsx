'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Mail, Lock, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Invocar inicio de sesión (El backend inyectará las cookies auth_token y session_exp)
      await api.login({ email, password });
      
      // 2. Redirección limpia al dashboard
      window.location.href = '/certificates';
    } catch (err: any) {
      setError(err.message || 'Error en las credenciales o problema de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Image 
          src="/logo-hyperion.png" 
          alt="Hyperion Digital Security" 
          width={64} 
          height={64} 
          className="mx-auto object-contain"
          priority
        />
        <div>
          <h1 className="text-2xl font-extrabold text-[#00668c] tracking-tight">HYPERION</h1>
          <p className="text-[10px] font-bold text-[#00b8b8] tracking-widest uppercase">Digital Security</p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          
          {/* Alerta si proviene de una sesión expirada por URL */}
          {isExpired && !error && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Tu sesión ha expirado. Inicia sesión para continuar.</span>
            </div>
          )}

          {/* Alerta de Error de credenciales */}
          {error && (
            <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl flex items-center gap-2 text-pink-700 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@empresa.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00b8b8] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00b8b8] transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-[#00668c] focus:ring-[#00b8b8]" />
                <span>Recordarme</span>
              </label>
              <a href="#" className="font-medium text-[#00668c] hover:underline">
                ¿Olvidó su contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-semibold text-white bg-[#00668c] hover:bg-[#005270] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b8b8] transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">O bien</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <KeyRound className="h-4 w-4 text-[#00b8b8]" />
            <span>Usa una llave de acceso</span>
          </button>

        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-[#00b8b8]" />
          <span>Infraestructura PKI Segura</span>
        </div>
      </div>
    </div>
  );
}