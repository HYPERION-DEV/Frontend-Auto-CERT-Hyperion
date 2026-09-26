'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import {
  Building2, User, Zap, Upload, FileCheck, Shield, Check, Loader2, AlertCircle, Calendar, Edit3, ArrowRight
} from 'lucide-react';

export default function NewCertificatePage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [entityType, setEntityType] = useState<'PERSONA_NATURAL' | 'EMPRESA'>('PERSONA_NATURAL');
  const [planType, setPlanType] = useState<'ONE_SHOT' | 'ANNUAL'>('ONE_SHOT');
  const [docType, setDocType] = useState<'DNI' | 'CE'>('DNI');

  // Formulario Persona Natural / Representante Legal
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');

  // Formulario Empresa
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [isSearchingRuc, setIsSearchingRuc] = useState(false);
  const [rucError, setRucError] = useState('');
  const [showManualRazonSocial, setShowManualRazonSocial] = useState(false);

  // Archivos Requeridos
  const [fileDni, setFileDni] = useState<File | null>(null);
  const [fileRuc, setFileRuc] = useState<File | null>(null);
  const [fileVigencia, setFileVigencia] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const isEmpresa = entityType === 'EMPRESA';

  // Validar formato PDF
  const handlePdfSelection = (file: File | null, setter: (f: File | null) => void) => {
    if (!file) {
      setter(null);
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Solo se permiten documentos en formato PDF.');
      setter(null);
      return;
    }
    setter(file);
  };

  // Consulta RUC SUNAT (OpenRUC)
  useEffect(() => {
    const cleanRuc = ruc.replace(/\D/g, '');

    if (cleanRuc.length === 11) {
      if (!cleanRuc.startsWith('10') && !cleanRuc.startsWith('20')) {
        setRucError('El RUC debe iniciar obligatoriamente con 10 o 20.');
        setRazonSocial('');
        setShowManualRazonSocial(false);
        return;
      }

      setRucError('');
      setIsSearchingRuc(true);

      api.lookupRuc(cleanRuc)
        .then(({ ok, data }) => {
          setIsSearchingRuc(false);

          if (ok && data?.found && data?.razonSocial) {
            setRazonSocial(data.razonSocial);
            setShowManualRazonSocial(false);
            setRucError('');
          } else {
            setRazonSocial('');
            setRucError('No encontramos ese RUC en SUNAT. Escriba la razón social manualmente.');
            setShowManualRazonSocial(true);
          }
        })
        .catch(() => {
          setIsSearchingRuc(false);
          setRazonSocial('');
          setRucError('No encontramos ese RUC en SUNAT. Escriba la razón social manualmente.');
          setShowManualRazonSocial(true);
        });
    } else {
      setRucError('');
      setRazonSocial('');
      setShowManualRazonSocial(false);
    }
  }, [ruc]);

  const handleFinish = async () => {
    setError('');

    // Validaciones
    if (!fileDni) {
      alert('Debes adjuntar obligatoriamente el Documento de Identidad (DNI/CE).');
      return;
    }

    if (isEmpresa) {
      if (!fileRuc || !fileVigencia) {
        alert('Para registro de Empresa debes adjuntar obligatoriamente la Ficha RUC y la Vigencia de Poder.');
        return;
      }
      if (!ruc.trim() || ruc.length !== 11) {
        alert('El RUC debe constar de 11 dígitos.');
        return;
      }
      if (!razonSocial.trim()) {
        alert('Ingresa la Razón Social de la empresa.');
        return;
      }
      if (!documentNumber.trim() || !email.trim() || !celular.trim()) {
        alert('Completa el DNI del Representante Legal, Email y Celular.');
        return;
      }
    } else {
      if (!documentNumber.trim() || !email.trim() || !celular.trim()) {
        alert('Completa todos los campos obligatorios del titular.');
        return;
      }
    }

    setIsUploading(true);

    try {
      // 🎯 Se usa diretamente api.verifyDni (el cual internamente conmuta a /api/verify/company si entityType es 'EMPRESA')
      const response = await api.verifyDni({
        file: fileDni,
        fileRuc: isEmpresa ? fileRuc || undefined : undefined,
        fileVigencia: isEmpresa ? fileVigencia || undefined : undefined,
        documentNumber: documentNumber.trim(),
        email: email.trim(),
        phone: celular.trim(),
        entityType: isEmpresa ? 'EMPRESA' : 'PERSONA_NATURAL',
        planType,
        companyRuc: isEmpresa ? ruc.trim() : undefined,
        companyName: isEmpresa ? razonSocial.trim() : undefined,
        rucType: isEmpresa ? (ruc.startsWith('20') ? 'Persona Jurídica' : 'Persona Natural con Negocio') : undefined,
      });

      const createdId = response?.data?.id || response?.id;
      if (createdId) {
        router.push(`/certificates/${createdId}`);
      } else {
        router.push('/certificates');
      }
    } catch (err: any) {
      if (err.name === 'SessionExpiredError' || err.message?.includes('401')) {
        return;
      }
      setError(err.message || 'Ocurrió un fallo al comunicarse con el servidor.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans">
      {/* Stepper Superior */}
      <div className="flex items-center justify-between relative px-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-10 -translate-y-1/2" />
        {[
          { num: 1, label: 'TIPO' },
          { num: 2, label: 'PLAN' },
          { num: 3, label: 'DATOS' },
          { num: 4, label: 'DOCUMENTOS' },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-1 bg-slate-50 px-2">
            <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-colors ${step >= s.num ? 'bg-[#00668c] text-white shadow-sm' : 'bg-slate-200 text-slate-500'
              }`}>
              {step > s.num ? <Check className="h-4 w-4" /> : s.num}
            </div>
            <span className={`text-[10px] font-bold tracking-wider ${step >= s.num ? 'text-[#00668c]' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[420px] flex flex-col justify-between">

        {error && (
          <div className="p-3 mb-4 bg-pink-50 border border-pink-200 rounded-xl flex items-center gap-2 text-pink-700 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Paso 1: Tipo de Entidad */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 text-center">¿Quién será el titular del certificado?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setEntityType('EMPRESA')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-3 ${isEmpresa ? 'border-[#00b8b8] bg-teal-50/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                <Building2 className="h-10 w-10 text-[#00668c]" />
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Empresa / Persona Jurídica</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Certificado con RUC para representantes legales y apoderados</p>
                </div>
              </div>

              <div
                onClick={() => setEntityType('PERSONA_NATURAL')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-3 ${!isEmpresa ? 'border-[#00b8b8] bg-teal-50/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                <User className="h-10 w-10 text-[#00668c]" />
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Persona Natural</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Certificado de identidad digital para uso personal con DNI/CE</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Selección de Plan */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <h2 className="text-xl font-bold text-slate-800">Seleccione su Plan de Firma</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              <div
                onClick={() => setPlanType('ONE_SHOT')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center space-y-2 ${planType === 'ONE_SHOT' ? 'border-[#00b8b8] bg-teal-50/20 shadow-sm' : 'border-slate-200'
                  }`}
              >
                <Zap className="h-7 w-7 text-amber-500 mx-auto" />
                <h3 className="font-bold text-sm text-slate-800">Uso Unico (One Shot)</h3>
                <p className="text-[11px] text-slate-400">Para firmas puntuales o un solo trámite</p>
              </div>

              <div
                onClick={() => setPlanType('ANNUAL')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center space-y-2 ${planType === 'ANNUAL' ? 'border-[#00b8b8] bg-teal-50/20 shadow-sm' : 'border-slate-200'
                  }`}
              >
                <Calendar className="h-7 w-7 text-[#00668c] mx-auto" />
                <h3 className="font-bold text-sm text-slate-800">Plan Anual</h3>
                <p className="text-[11px] text-slate-400">Validez completa de 1 año ilimitado</p>
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Datos de la Entidad o Persona */}
        {step === 3 && (
          <div className="space-y-4 max-w-md mx-auto w-full text-xs">
            {isEmpresa ? (
              <>
                <h2 className="text-lg font-bold text-slate-800 text-center">Datos de la Empresa y Representante</h2>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700">RUC de la empresa *</label>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Inicia en 10 ó 20
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={11}
                      value={ruc}
                      onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                      placeholder="20100047218"
                      className={`w-full p-2.5 bg-white border rounded-xl font-bold tracking-widest text-slate-800 focus:outline-none focus:ring-2 ${rucError ? 'border-pink-500 focus:ring-pink-500' : 'border-slate-200 focus:ring-[#00b8b8]'
                        }`}
                    />
                    {isSearchingRuc && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-[#00668c]" />
                    )}
                  </div>

                  {rucError && (
                    <div className="p-2.5 bg-pink-50 border border-pink-200 rounded-xl space-y-1">
                      <p className="text-[11px] text-pink-700 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {rucError}
                      </p>
                    </div>
                  )}

                  {razonSocial && !showManualRazonSocial && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Razón Social Encontrada</span>
                        <p className="font-bold text-slate-800">{razonSocial}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowManualRazonSocial(true)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-medium flex items-center gap-0.5"
                      >
                        <Edit3 className="h-3 w-3" /> Editar
                      </button>
                    </div>
                  )}

                  {showManualRazonSocial && (
                    <div className="pt-2">
                      <label className="block font-bold text-slate-700 mb-1">Razón Social *</label>
                      <input
                        type="text"
                        value={razonSocial}
                        onChange={(e) => setRazonSocial(e.target.value)}
                        placeholder="Escribe la Razón Social manualmente"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00b8b8]"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">DNI del Representante Legal *</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="DNI del Representante Legal"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email de contacto *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@empresa.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Celular *</label>
                    <input
                      type="text"
                      maxLength={9}
                      value={celular}
                      onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
                      placeholder="999888777"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-800 text-center">Datos del Titular</h2>

                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 font-bold mb-2">
                  <button
                    type="button"
                    onClick={() => setDocType('DNI')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${docType === 'DNI' ? 'bg-[#00668c] text-white' : 'text-slate-600'}`}
                  >
                    DNI
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocType('CE')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${docType === 'CE' ? 'bg-[#00668c] text-white' : 'text-slate-600'}`}
                  >
                    Carné de Extranjería
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número de Documento *</label>
                  <input
                    type="text"
                    maxLength={docType === 'DNI' ? 8 : 12}
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Número de Documento"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="titular@correo.com"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono / Celular *</label>
                  <input
                    type="text"
                    maxLength={9}
                    value={celular}
                    onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
                    placeholder="987654321"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-800"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Paso 4: Carga de Documentación */}
        {step === 4 && (
          <div className="space-y-6 max-w-lg mx-auto w-full font-sans">
            <div className="text-center space-y-1">
              <Shield className="h-8 w-8 text-[#00668c] mx-auto" />
              <h2 className="text-lg font-bold text-slate-800">
                {isEmpresa ? 'Adjunte los 3 Documentos Requeridos (PDF)' : 'Adjunte su Documento de Identidad (PDF)'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEmpresa
                  ? 'Archivos requeridos para la verificación de personería jurídica'
                  : 'Archivo requerido para la verificación de persona natural'}
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Documento 1: DNI */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  1. Documento de Identidad (DNI / CE) *
                </label>
                <div className="border-2 border-dashed border-[#00b8b8] rounded-2xl p-4 bg-slate-50 relative cursor-pointer hover:bg-teal-50/20 transition-colors text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handlePdfSelection(e.target.files?.[0] || null, setFileDni)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {fileDni ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                      <FileCheck className="h-5 w-5" />
                      <span>{fileDni.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Upload className="h-4 w-4 text-[#00668c]" />
                      <span className="font-semibold">Subir PDF del DNI / CE</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Documentos de Empresa */}
              {isEmpresa && (
                <>
                  {/* Documento 2: Ficha RUC */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      2. Ficha RUC SUNAT *
                    </label>
                    <div className="border-2 border-dashed border-[#00b8b8] rounded-2xl p-4 bg-slate-50 relative cursor-pointer hover:bg-teal-50/20 transition-colors text-center">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handlePdfSelection(e.target.files?.[0] || null, setFileRuc)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {fileRuc ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                          <FileCheck className="h-5 w-5" />
                          <span>{fileRuc.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                          <Upload className="h-4 w-4 text-[#00668c]" />
                          <span className="font-semibold">Subir PDF de Ficha RUC</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documento 3: Vigencia de Poder */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      3. Vigencia de Poder SUNARP *
                    </label>
                    <div className="border-2 border-dashed border-[#00b8b8] rounded-2xl p-4 bg-slate-50 relative cursor-pointer hover:bg-teal-50/20 transition-colors text-center">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handlePdfSelection(e.target.files?.[0] || null, setFileVigencia)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {fileVigencia ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                          <FileCheck className="h-5 w-5" />
                          <span>{fileVigencia.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                          <Upload className="h-4 w-4 text-[#00668c]" />
                          <span className="font-semibold">Subir PDF de Vigencia de Poder</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Botones de Navegación Inferiores */}
        <div className="flex items-center justify-between pt-6 border-t mt-6">
          <button
            onClick={() => setStep((p) => Math.max(p - 1, 1))}
            disabled={step === 1 || isUploading}
            className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            Anterior
          </button>

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 3) {
                  if (isEmpresa) {
                    if (!ruc || ruc.length !== 11) {
                      alert('Ingresa un RUC válido de 11 dígitos.');
                      return;
                    }
                    if (!razonSocial) {
                      alert('Debes ingresar la Razón Social.');
                      return;
                    }
                    if (!documentNumber) {
                      alert('Ingresa el DNI del Representante Legal.');
                      return;
                    }
                  } else {
                    if (!documentNumber || !email || !celular) {
                      alert('Completa Documento, Email y Celular.');
                      return;
                    }
                  }
                }
                setStep((p) => Math.min(p + 1, 4));
              }}
              className="px-5 py-2 bg-[#00668c] hover:bg-[#005270] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Siguiente</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isUploading || !fileDni || (isEmpresa && (!fileRuc || !fileVigencia))}
              className="px-6 py-2.5 bg-[#00b8b8] hover:bg-[#009b9b] text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando expediente...</span>
                </>
              ) : (
                'Completar y Guardar Certificado'
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}