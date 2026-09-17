'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { CertificatesProvider } from '@/context/CertificatesContext';
import { 
  Menu, User, Phone, Mail, X, Search, ChevronDown, 
  Grid, UserCheck, LogOut, Loader2 
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.logout();
      setIsUserMenuOpen(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthGuard>
      <CertificatesProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
          {/* Topbar Persistente */}
          <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm flex items-center justify-between px-4 sm:px-8 py-2.5">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-md transition-colors"
                title="Abrir contacto"
              >
                <Menu className="h-6 w-6 text-slate-700" />
              </button>
              
              <Link href="/certificates" className="flex items-center gap-2.5">
                <Image 
                  src="/logo-hyperion.png" 
                  alt="Hyperion Digital Security Logo" 
                  width={36} 
                  height={36} 
                  className="object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-base font-extrabold text-[#00668c] tracking-tight leading-none">HYPERION</span>
                  <span className="text-[9px] font-bold text-[#00b8b8] tracking-widest leading-none mt-0.5">DIGITAL SECURITY</span>
                </div>
              </Link>
            </div>

            {/* MENÚ DE USUARIO DESPLEGABLE */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 px-2 hover:bg-slate-100 rounded-full border border-slate-300 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                  <User className="h-4 w-4" />
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>

              {/* Menú Flotante */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-20 text-xs text-slate-700 font-medium space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                    <Link 
                      href="/certificates" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 hover:text-[#00668c] transition-colors"
                    >
                      <Grid className="h-4 w-4 text-indigo-600" />
                      <span>Aplicaciones</span>
                    </Link>

                    <Link 
                      href="/account" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 hover:text-[#00668c] transition-colors"
                    >
                      <UserCheck className="h-4 w-4 text-indigo-600" />
                      <span>Mi cuenta</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1" />

                    <button 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-pink-50 text-pink-600 transition-colors font-medium text-left cursor-pointer disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin text-pink-600" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Drawer Flotante Lateral */}
          {isDrawerOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
              <div className="relative w-80 max-w-full bg-white h-full shadow-2xl flex flex-col z-10 p-4">
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="mt-8 mb-4 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00b8b8]"
                  />
                </div>

                <div className="space-y-4 my-6 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>+51 962 444 275</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>soporte@hyperion.pe</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t">
                  <button className="w-full py-2.5 bg-[#00668c] text-white font-medium rounded-lg hover:bg-[#005270] transition-colors">
                    Contáctanos
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contenido Dinámico */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>

          <footer className="py-4 text-center text-xs text-slate-400 border-t bg-white">
            Hyperion Digital Security © 2026 — Lima, Perú
          </footer>
        </div>
      </CertificatesProvider>
    </AuthGuard>
  );
}