'use client';

import React, { useState } from 'react';
import { X, Send, CheckSquare, Square, ShieldCheck, Loader2 } from 'lucide-react';

interface CamerfirmaConfirmationModalProps {
  isOpen: boolean;
  certificate: any;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function CamerfirmaConfirmationModal({
  isOpen,
  certificate,
  onClose,
  onConfirm,
}: CamerfirmaConfirmationModalProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleOpenAndAutofill = async () => {
    setIsProcessing(true);
    try {
      // 🎯 Llama al backend (Puppeteer procesa todo silenciosamente de fondo)
      await onConfirm(); 
      onClose();
    } catch (err: any) {
      alert(`Error al ejecutar la automatización: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00668c] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Confirmar Envío a Camerfirma</h2>
              <p className="text-[11px] text-slate-400">Expediente: {certificate.code || certificate.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 block text-xs">Resumen de datos a procesar:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><strong className="text-slate-500">Titular:</strong> {certificate.applicantNames} {certificate.applicantSurname1}</div>
              <div><strong className="text-slate-500">DNI:</strong> {certificate.applicantDocNum}</div>
              <div><strong className="text-slate-500">Ubicación:</strong> {certificate.department}, {certificate.district}</div>
              <div><strong className="text-slate-500">Código Postal:</strong> {certificate.postalCode || '11003'}</div>
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer pt-2 select-none">
            <button
              type="button"
              onClick={() => setIsChecked(!isChecked)}
              className="text-[#00668c] hover:text-[#005270] transition-colors shrink-0 mt-0.5"
            >
              {isChecked ? <CheckSquare className="h-5 w-5 text-[#00668c]" /> : <Square className="h-5 w-5 text-slate-400" />}
            </button>
            <span className="text-[11px] font-medium text-slate-700 leading-tight">
              Confirmo que los datos extraídos son correctos y autorizo la autogestión de la presolicitud en Camerfirma.
            </span>
          </label>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleOpenAndAutofill}
            disabled={!isChecked || isProcessing}
            className="px-5 py-2.5 bg-[#00668c] hover:bg-[#005270] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Procesar en Segundo Plano</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}