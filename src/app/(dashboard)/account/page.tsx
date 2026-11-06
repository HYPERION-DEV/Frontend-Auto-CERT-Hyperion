'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  FileText, 
  Award, 
  MapPin, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Edit2, 
  Loader2, 
  Hammer, 
  X 
} from 'lucide-react';
import { api } from '@/services/api';

interface UserProfile {
  id?: string;
  names?: string;
  surnames?: string;
  name?: string;
  email: string;
  phone?: string;
  country?: string;
  role?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalFeature, setModalFeature] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getUserProfile();
        if (res && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.warn('No se pudo cargar el perfil vía API:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const displayName = user
    ? (user.names || user.name || user.email)
    : 'USUARIO';

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Mi cuenta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Grid de Accesos */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Órdenes */}
          <div 
            onClick={() => setModalFeature('Sus órdenes')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Sus órdenes</h3>
              <p className="text-xs text-slate-500 mt-1">Siga o verifique sus órdenes</p>
            </div>
          </div>

          {/* Facturas */}
          <div 
            onClick={() => setModalFeature('Sus facturas')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Sus facturas</h3>
              <p className="text-xs text-slate-500 mt-1">Siga, descargue o pague sus facturas</p>
            </div>
          </div>

          {/* Certificados -> Redirige a /certificates */}
          <Link 
            href="/certificates"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Certificados</h3>
              <p className="text-xs text-slate-500 mt-1">Ver sus certificados disponibles</p>
            </div>
          </Link>

          {/* Direcciones */}
          <div 
            onClick={() => setModalFeature('Direcciones')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Direcciones</h3>
              <p className="text-xs text-slate-500 mt-1">Agregue, elimine o modifique sus direcciones</p>
            </div>
          </div>

          {/* Conexión y seguridad */}
          <div 
            onClick={() => setModalFeature('Conexión y seguridad')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer sm:col-span-2"
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Conexión y seguridad</h3>
              <p className="text-xs text-slate-500 mt-1">Configure sus parámetros de conexión y 2FA</p>
            </div>
          </div>

        </div>

        {/* Columna Derecha: Tarjeta Dinámica del Titular */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs">Cargando datos del titular...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-lg uppercase shadow-sm">
                    {userInitial}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-sm uppercase">
                      {displayName}
                    </h2>
                    {user?.role && (
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{user?.country || 'Perú'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{user?.phone || 'Sin teléfono registrado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{user?.email || 'Sin correo asociado'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setModalFeature('Edición de perfil')}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:underline pt-2"
                >
                  <Edit2 className="h-3 w-3" />
                  Editar información
                </button>
              </>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Tu contacto</h3>
            <p className="text-xs font-semibold text-slate-700">Mesa de Operaciones Hyperion</p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>operaciones@hyperion.com.pe</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>+51 923 948 904</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Estamos trabajando en ello */}
      {modalFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-slate-100 relative">
            <button 
              onClick={() => setModalFeature(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hammer className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              Estamos trabajando en ello
            </h3>
            
            <p className="text-sm text-slate-500 mt-2">
              El módulo de <span className="font-semibold text-slate-700">{modalFeature}</span> se encuentra actualmente en desarrollo y estará disponible próximamente.
            </p>

            <button
              onClick={() => setModalFeature(null)}
              className="mt-6 w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}