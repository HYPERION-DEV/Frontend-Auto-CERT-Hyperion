'use client';

import React, { useState } from 'react';
import { Play, CheckSquare, X, ExternalLink, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';

interface CertificateActionsModalProps {
  certificate: any;
}

export default function CertificateActionsModal({ certificate }: CertificateActionsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const applicantFullName = `${certificate.applicantNames || ''} ${certificate.applicantSurname1 || ''} ${certificate.applicantSurname2 || ''}`.trim() || 'Titular Persona Natural';

  const handleStartAutomation = async () => {
    setStatus('running');
    setErrorMessage('');

    try {
      // Invocación directa a la API backend encargada de ejecutar la inyección vía Puppeteer
      const response = await api.autofillCamerfirma(certificate.id);

      if (response?.success) {
        setStatus('success');
      } else {
        throw new Error(response?.message || 'No se pudo completar el autocompletado en Camerfirma.');
      }
    } catch (err: any) {
      console.error('✕ [Camerfirma Injection Error]:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Error al conectar con el servicio de autocompletado.');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <>
      {/* Botón Principal de Invocación */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3.5 px-6 bg-gradient-to-r from-[#00668c] to-teal-700 hover:from-[#005270] hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
      >
        <Play className="h-4 w-4 fill-current text-white" />
        <span>Autocompletar Formulario en Camerfirma</span>
      </button>

      {/* Modal Split-View */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm font-sans">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            
            {/* Header del Modal */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-[#00668c]" />
                <span className="text-sm font-bold text-slate-800">Consola de Inyección Camerfirma</span>
              </div>
              <button
                onClick={handleClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cuerpo Dividido */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
              
              {/* LADO IZQUIERDO: Panel de Control y Configuración */}
              <div className="p-6 bg-slate-50 border-r border-slate-200 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumen de Datos del Expediente</h3>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div><span className="text-slate-400 font-medium">Titular:</span> <strong className="text-slate-800">{applicantFullName}</strong></div>
                    <div><span className="text-slate-400 font-medium">Nº Documento:</span> <strong className="text-slate-800">{certificate.applicantDocNum}</strong></div>
                    <div><span className="text-slate-400 font-medium">Email:</span> <strong className="text-slate-800">{certificate.applicantEmail}</strong></div>
                    <div><span className="text-slate-400 font-medium">Ubigeo:</span> <strong className="text-slate-800">{certificate.department || 'ICA'} / {certificate.province || 'ICA'} / {certificate.district || 'PARCONA'}</strong></div>
                    <div><span className="text-slate-400 font-medium">Código Postal:</span> <strong className="text-slate-800">{certificate.postalCode || '11003'}</strong></div>
                  </div>

                  {/* Checkbox de Términos y Condiciones */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#00668c] transition-colors shadow-sm">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 text-[#00668c] rounded border-slate-300 focus:ring-[#00668c]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 block">Aceptar Términos y Condiciones</span>
                        <span className="text-slate-500 text-[11px]">Activa automáticamente el cuadro de Política de Privacidad en el formulario de Camerfirma.</span>
                      </div>
                    </label>
                  </div>

                  {/* Alertas de Estado */}
                  {status === 'success' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>¡Formulario autocompletado y sincronizado con éxito!</span>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="p-3 bg-pink-50 border border-pink-200 text-pink-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-pink-600 shrink-0" />
                      <span>{errorMessage || 'Ocurrió un error durante la ejecución.'}</span>
                    </div>
                  )}
                </div>

                {/* Acciones del Modal */}
                <div className="pt-6 space-y-3">
                  <button
                    onClick={handleStartAutomation}
                    disabled={status === 'running'}
                    className="w-full py-3 bg-[#00668c] hover:bg-[#005270] disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {status === 'running' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Inyectando datos en Camerfirma...</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        <span>Llenar Datos Automáticamente</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* LADO DERECHO: Indicadores Visuales */}
              <div className="p-8 bg-slate-900 text-white flex flex-col items-center justify-center text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <ExternalLink className="h-8 w-8 text-[#00b8b8]" />
                </div>
                <div className="max-w-xs space-y-2">
                  <h4 className="font-bold text-sm text-slate-100">Sincronización Automatizada</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Al presionar "Llenar Datos Automáticamente", el backend ingresará a la plataforma de Camerfirma y rellenará el formulario del cliente (incluyendo la cascada de Ubigeo y selección de documento).
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}