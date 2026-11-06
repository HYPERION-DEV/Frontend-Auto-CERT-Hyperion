'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Send, 
  User, 
  Building2, 
  MapPin, 
  Mail, 
  FileCheck, 
  AlertCircle,
  Phone,
  Edit2,
  Loader2
} from 'lucide-react';

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
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPostal, setLoadingPostal] = useState(false);
  const [postalCode, setPostalCode] = useState<string>('');

  const department = certificate?.department || '';
  const province = certificate?.province || '';
  const district = (certificate?.district || '').replace(/\s+/g, ' ').trim();

  // Consulta dinámica a la base de datos
  useEffect(() => {
    if (!isOpen || !certificate) return;

    // Si ya tiene un código válido y coherente, usarlo
    const isIca = department.toUpperCase().includes('ICA');
    if (certificate.postalCode && !(certificate.postalCode === '11003' && !isIca)) {
      setPostalCode(certificate.postalCode);
      return;
    }

    // Si no está registrado o contenía 11003 por defecto, consultarlo a la BD
    const fetchPostalCode = async () => {
      setLoadingPostal(true);
      try {
        const query = new URLSearchParams({
          department,
          province,
          district,
        }).toString();

        const res = await fetch(`/api/postal-codes?${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.postalCode) {
            setPostalCode(data.postalCode);
            return;
          }
        }
        // Respaldo de seguridad si aún no se corrió el seed
        setPostalCode(department.toUpperCase().includes('LIMA') ? '15311' : '15001');
      } catch (err) {
        console.error('Error obteniendo código postal desde BD:', err);
        setPostalCode('15001');
      } finally {
        setLoadingPostal(false);
      }
    };

    fetchPostalCode();
  }, [isOpen, certificate, department, province, district]);

  if (!isOpen || !certificate) return null;

  const isCompany = certificate.entityType === 'EMPRESA';
  const firstNames = certificate.applicantNames || '';
  const surname1 = certificate.applicantSurname1 || '';
  const surname2 = certificate.applicantSurname2 || '';
  const docNum = certificate.applicantDocNum || '';
  const phone = certificate.applicantPhone || 'No registrado';

  const injectedEmail = certificate.useTempEmail !== false
    ? `${docNum}@hyperion.com.pe`
    : (certificate.applicantEmail || 'No registrado');

  const address = certificate.address || 'Domicilio fiscal / particular registrado';

  const docs = certificate.documents || [];
  const dniDoc = docs.find((d: any) => d.category === 'DNI_FRONT_BACK');
  const rucDoc = docs.find((d: any) => d.category === 'FICHA_RUC');
  const vigenciaDoc = docs.find((d: any) => d.category === 'VIGENCIA_PODER');

  const handleExecute = async () => {
    if (!hasConfirmed) return;
    setIsSubmitting(true);
    try {
      certificate.postalCode = postalCode;
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Cabecera */}
        <div className="px-6 py-4 bg-[#0a2540] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-[#00c2cb] rounded-xl border border-[#00c2cb]/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Confirmar Envío a Camerfirma</h2>
              <p className="text-[11px] text-slate-300">Expediente: <span className="font-mono text-cyan-300 font-semibold">{certificate.code || certificate.id}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 divide-y divide-slate-100">
          
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-blue-900">
            <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Verifique que los datos extraídos de la base de datos coincidan con los requerimientos de la Entidad de Certificación antes de autorizar la inyección en segundo plano.
            </p>
          </div>

          {/* 1. Datos Personales */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <User className="h-4 w-4 text-[#00668c]" />
              <span>1. Identidad del Titular {isCompany ? '(Representante Legal)' : ''}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Tipo y Documento:</span>
                <span className="font-mono font-bold text-slate-800">{certificate.applicantDocType || 'DNI'}: {docNum}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Nombres completos:</span>
                <span className="font-semibold text-slate-800">{firstNames || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Primer Apellido (Paterno):</span>
                <span className="font-semibold text-slate-800">{surname1 || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Segundo Apellido (Materno):</span>
                <span className="font-semibold text-slate-800">{surname2 || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Teléfono / Celular:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3 text-slate-400" />
                  {phone}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Email en Formulario:</span>
                <span className="font-mono font-bold text-indigo-700 flex items-center gap-1 mt-0.5 truncate" title={injectedEmail}>
                  <Mail className="h-3 w-3 text-indigo-500" />
                  {injectedEmail}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Domicilio y Código Postal consultado en BD */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <MapPin className="h-4 w-4 text-[#00668c]" />
              <span>2. Domicilio y Código Postal (Base de Datos / SUNAT)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Departamento:</span>
                <span className="font-semibold text-slate-800">{department || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Provincia:</span>
                <span className="font-semibold text-slate-800">{province || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Distrito:</span>
                <span className="font-semibold text-slate-800">{district || 'N/A'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Dirección Registrada:</span>
                <span className="font-medium text-slate-800 truncate block" title={address}>{address}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Código Postal:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {loadingPostal ? (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00668c]" />
                      Consultando BD...
                    </span>
                  ) : (
                    <>
                      <input
                        type="text"
                        maxLength={5}
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-300 w-20 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Organización (si es Empresa) */}
          {isCompany && (
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <Building2 className="h-4 w-4 text-[#00668c]" />
                <span>3. Datos de la Organización (Persona Jurídica)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">RUC de la Empresa:</span>
                  <span className="font-mono font-bold text-slate-800">{certificate.companyRuc || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Cargo del Representante:</span>
                  <span className="font-semibold text-slate-800">REPRESENTANTE LEGAL</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Razón Social:</span>
                  <span className="font-bold text-slate-800">{certificate.companyName || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Documentos Adjuntos */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <FileCheck className="h-4 w-4 text-[#00668c]" />
              <span>{isCompany ? '4.' : '3.'} Archivos Digitales Adjuntos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-[11px] text-slate-700 font-medium">Documento de Identidad (DNI/CE)</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dniDoc ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-red-50 text-red-600'}`}>
                  {dniDoc ? 'Listo' : 'Faltante'}
                </span>
              </div>
              {isCompany && (
                <>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                    <span className="text-[11px] text-slate-700 font-medium">Ficha RUC SUNAT</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rucDoc ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-red-50 text-red-600'}`}>
                      {rucDoc ? 'Listo' : 'Faltante'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                    <span className="text-[11px] text-slate-700 font-medium">Vigencia de Poder SUNARP</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${vigenciaDoc ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-red-50 text-red-600'}`}>
                      {vigenciaDoc ? 'Listo' : 'Faltante'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Checkbox de Conformidad */}
          <div className="pt-4">
            <label className="flex items-start gap-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasConfirmed}
                onChange={(e) => setHasConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-amber-300 text-[#00668c] focus:ring-[#00668c]"
              />
              <span className="text-[11px] font-semibold text-amber-950 leading-relaxed">
                Confirmo que todos los datos y documentos mostrados son válidos y coinciden con el expediente. Autorizo el llenado e inyección automatizada en la plataforma de Camerfirma.
              </span>
            </label>
          </div>

        </div>

        {/* Botones de Acción */}
        <div className="p-4 border-t bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={!hasConfirmed || isSubmitting || loadingPostal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00668c] hover:bg-[#005270] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className={`h-4 w-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
            <span>{isSubmitting ? 'Procesando en Camerfirma...' : 'Procesar en Segundo Plano'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}