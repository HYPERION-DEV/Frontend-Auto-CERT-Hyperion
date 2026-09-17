import React from 'react';
import { ShoppingBag, FileText, Award, MapPin, ShieldCheck, Mail, Phone, Edit2 } from 'lucide-react';

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Mi cuenta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Grid de Accesos Rápidos */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Sus órdenes</h3>
              <p className="text-xs text-slate-500 mt-1">Siga o verifique sus órdenes</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Sus facturas</h3>
              <p className="text-xs text-slate-500 mt-1">Siga, descargue o pague sus facturas</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Certificados</h3>
              <p className="text-xs text-slate-500 mt-1">Ver sus certificados disponibles</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Direcciones</h3>
              <p className="text-xs text-slate-500 mt-1">Agregue, elimine o modifique sus direcciones</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer sm:col-span-2">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Conexión y seguridad</h3>
              <p className="text-xs text-slate-500 mt-1">Configure sus parámetros de conexión</p>
            </div>
          </div>

        </div>

        {/* Columna Derecha: Tarjetas de Perfil y Contacto Asignado */}
        <div className="space-y-6">
          
          {/* Datos del Titular */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-600 text-white font-bold flex items-center justify-center text-lg">
                A
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">ARTEAGA CHOQUE, PIERO RAUL</h2>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>Perú</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>+51062686225</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>piero.arteaga@ibr.com.pe</span>
              </div>
            </div>

            <button className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:underline pt-2">
              <Edit2 className="h-3 w-3" />
              Editar información
            </button>
          </div>

          {/* Ejecutivo Asignado */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Tu contacto</h3>
            <p className="text-xs font-semibold text-slate-700">Victoria</p>
            
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>vhidalgo@certifirme.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>+51 962 444 275</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}