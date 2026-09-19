'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import CertificateActionsModal from '@/components/CertificateActionsModal';
import {
  FileText, Eye, RefreshCw, MessageSquare,
  CheckCircle2, ShieldCheck, X, ExternalLink, ArrowLeft, User, AlertTriangle, Loader2, Upload, Building2, UserPlus
} from 'lucide-react';

export default function CertificateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const paramId = resolvedParams.id;

  const [certData, setCertData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [isSyncingBiocamer, setIsSyncingBiocamer] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Visor PDF
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<any>(null);

  const fetchCertificateDetail = async (silent = false) => {
    if (!paramId || paramId === 'undefined' || paramId === 'new') {
      setError('Identificador de certificado no válido.');
      setIsLoading(false);
      return;
    }

    if (!silent) setIsLoading(true);
    setError('');
    try {
      const response = await api.getCertificateById(paramId);
      setCertData(response.data);
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar la información del certificado.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificateDetail();
  }, [paramId]);

  // CONDICIONES DE ESTADO DE IDENTIDAD
  const isIdentityApproved = certData?.identityStatus === 'APPROVED' || certData?.identityVerified === true;
  const isIdentityRegistered = certData?.identityStatus === 'REGISTERED';

  // POLLING AUTOMÁTICO: Si está registrado en BioCamer pero pendiente de biometría
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isIdentityRegistered && !isIdentityApproved) {
      interval = setInterval(async () => {
        try {
          const res = await api.checkBiocamerStatus(certData.id);
          if (res.data?.identityStatus === 'APPROVED') {
            await fetchCertificateDetail(true);
          }
        } catch {
          // Ignorar fallos de red en polling de fondo
        }
      }, 15000); // Consulta cada 15 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isIdentityRegistered, isIdentityApproved, certData?.id]);

  const handleSingleFileUpload = async (category: string, file: File) => {
    setUploadingCategory(category);
    try {
      await api.uploadSingleDocument(certData.id, category, file);
      await fetchCertificateDetail(true);
    } catch (err: any) {
      alert(err.message || 'Error al subir el archivo');
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleRegisterInBiocamer = async () => {
    setIsSyncingBiocamer(true);
    try {
      const res = await api.syncBiocamerClient(certData.id);
      alert('✓ DNI registrado con éxito en BioCamer.');

      if (res.redirectUrl) {
        window.open(res.redirectUrl, '_blank');
      }

      await fetchCertificateDetail(true);
    } catch (err: any) {
      alert(`Error: ${err.message || 'No se pudo registrar el DNI en BioCamer.'}`);
    } finally {
      setIsSyncingBiocamer(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const res = await api.checkBiocamerStatus(certData.id);
      if (res.data?.identityStatus === 'APPROVED') {
        alert('¡Identidad Aprobada! Se han habilitado las siguientes etapas.');
      } else {
        alert('Identidad pendiente: El cliente aún no ha completado el escaneo biométrico.');
      }
      await fetchCertificateDetail(true);
    } catch (err: any) {
      alert(err.message || 'Error al consultar estado');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 font-sans">
        <Loader2 className="h-8 w-8 text-[#00668c] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Cargando expediente del certificado...</p>
      </div>
    );
  }

  if (error || !certData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-pink-200 rounded-2xl text-center space-y-4 font-sans shadow-sm">
        <AlertTriangle className="h-10 w-10 text-pink-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Error al cargar la solicitud</h2>
        <p className="text-xs text-slate-500">{error || 'El certificado no existe.'}</p>
        <Link href="/certificates" className="inline-flex items-center gap-2 px-4 py-2 bg-[#00668c] text-white text-xs font-bold rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a Mis Certificados</span>
        </Link>
      </div>
    );
  }

  const isCompany = certData.entityType === 'EMPRESA';
  const certId = certData.code || certData.id;
  const isRejected = certData.status === 'RECHAZADO';

  const documentsList = certData.documents || [];
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

  const requiredDocTypes = isCompany
    ? [
      { key: 'DNI_FRONT_BACK', label: 'DNI del Representante Legal', desc: 'PDF - Max 10MB' },
      { key: 'FICHA_RUC', label: 'Ficha RUC SUNAT', desc: 'PDF - Max 10MB' },
      { key: 'VIGENCIA_PODER', label: 'Vigencia de Poder SUNARP', desc: 'PDF - Max 10MB' },
    ]
    : [
      { key: 'DNI_FRONT_BACK', label: 'Documento de Identidad (DNI / CE)', desc: 'PDF - Max 10MB' },
    ];

  const totalRequiredDocs = requiredDocTypes.length;
  const uploadedCount = requiredDocTypes.filter(req =>
    documentsList.some((d: any) => d.category === req.key)
  ).length;

  const progressText = `${uploadedCount}/${totalRequiredDocs}`;
  const progressPercentage = (uploadedCount / totalRequiredDocs) * 100;
  const applicantFullName = `${certData.applicantNames || ''} ${certData.applicantSurname1 || ''} ${certData.applicantSurname2 || ''}`.trim() || 'Titular Persona Natural';
  const headerTitle = isCompany ? (certData.companyName || 'Empresa Sin Razón Social') : applicantFullName;

  const activeDocUrl = selectedDocForPreview?.fileUrl
    ? (selectedDocForPreview.fileUrl.startsWith('http') ? selectedDocForPreview.fileUrl : `${backendBaseUrl}${selectedDocForPreview.fileUrl}`)
    : '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link className="hover:underline" href="/certificates">Certificados</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{certId}</span>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00668c] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            {isCompany ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{certId}</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{headerTitle}</p>
          </div>
        </div>

        <div className="w-full md:w-80 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-500">Progreso de documentos</span>
            <span className="text-slate-800 font-bold">{progressText}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isRejected ? 'bg-pink-500' : 'bg-[#00b8b8]'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-end pt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isRejected ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-teal-50 text-[#00b8b8] border-[#00b8b8]/20'
              }`}>
              {certData.status === 'EN_REVISION' ? 'En Revisión' : certData.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#00668c]" />
                <h2 className="font-bold text-slate-800 text-sm">Documentos Requeridos</h2>
              </div>
              <button 
                onClick={handleCheckStatus} 
                disabled={isCheckingStatus}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>{isCheckingStatus ? 'Verificando...' : 'Consultar estado'}</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {requiredDocTypes.map((item) => {
                const docFound = documentsList.find((d: any) => d.category === item.key);
                const isUploadingThis = uploadingCategory === item.key;

                return (
                  <div key={item.key} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${docFound ? (isRejected ? 'bg-pink-50 text-pink-500' : 'bg-teal-50 text-[#00b8b8]') : 'bg-slate-100 text-slate-400'}`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{item.label}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">{docFound ? docFound.fileName : item.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      {docFound ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${isRejected ? 'bg-pink-100 text-pink-600' : 'bg-teal-100 text-[#00b8b8]'}`}>
                          <CheckCircle2 className="h-3 w-3" />
                          {isRejected ? 'Rechazado' : 'Subido'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-50 text-pink-500 border border-pink-200">
                          Pendiente
                        </span>
                      )}

                      {(!docFound || isRejected || docFound?.status === 'RECHAZADO') && (
                        <label className="relative flex items-center gap-1.5 px-3 py-1.5 bg-[#00668c] hover:bg-[#005270] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm">
                          {isUploadingThis ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          <span>{docFound ? 'Reemplazar' : 'Subir'}</span>
                          <input
                            type="file"
                            accept=".pdf"
                            disabled={isUploadingThis}
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleSingleFileUpload(item.key, e.target.files[0]);
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer hidden"
                          />
                        </label>
                      )}

                      {docFound && (
                        <button
                          onClick={() => {
                            setSelectedDocForPreview(docFound);
                            setIsPreviewOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#00668c] hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          title="Previsualizar PDF"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isIdentityApproved ? 'bg-teal-100 text-[#00b8b8]' : 'bg-amber-100 text-amber-600'}`}>
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Validación de Identidad</h3>
                    <p className="text-[11px] text-slate-400">
                      {isCompany ? 'DNI Rep. Legal' : 'DNI / CE'}: {certData.applicantDocNum}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold ${isIdentityApproved ? 'text-[#00b8b8]' : 'text-amber-600'}`}>
                    {isIdentityApproved ? 'Identidad Aprobada' : isIdentityRegistered ? 'Registrado en BioCamer' : 'Pendiente de Registro'}
                  </span>

                  {!isIdentityApproved && !isIdentityRegistered && (
                    <button
                      onClick={handleRegisterInBiocamer}
                      disabled={isSyncingBiocamer}
                      className="px-3 py-1.5 bg-[#00668c] hover:bg-[#005270] text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSyncingBiocamer ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Registrando...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Registrar en BioCamer</span>
                        </>
                      )}
                    </button>
                  )}

                  {isIdentityRegistered && !isIdentityApproved && (
                    <a
                      href="https://biocamer.com/hyperion"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#00b8b8] hover:bg-[#009a9a] text-white font-bold text-xs rounded-xl shadow-sm transition-colors inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Validación Biométrica</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
            <button className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-emerald-200 transition-colors">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <span>Solicitar Soporte</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <User className="h-4 w-4 text-[#00668c]" />
                <span>Datos del Titular</span>
              </div>
              <span className="px-2.5 py-0.5 bg-[#00668c] text-white text-[10px] font-bold rounded-full uppercase">
                {isCompany ? 'Empresa' : 'Persona Natural'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {isCompany ? (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">RUC:</span>
                    <span className="font-bold text-slate-800">{certData.companyRuc || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Razón Social:</span>
                    <span className="font-bold text-slate-800 text-right max-w-[180px] truncate">{certData.companyName || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">DNI / CE:</span>
                    <span className="font-bold text-slate-800">{certData.applicantDocNum}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Nombres:</span>
                    <span className="font-bold text-slate-800 text-right">{certData.applicantNames || 'N/A'}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Email:</span>
                <span className="font-medium text-slate-700 text-right truncate max-w-[180px]">{certData.applicantEmail}</span>
              </div>
            </div>
          </div>

          {/* RENDERIZADO CONDICIONAL DEL MODAL DE AUTOCOMPLETADO */}
          {isIdentityApproved && (
            <div className="pt-2">
              <CertificateActionsModal certificate={certData} />
            </div>
          )}

          <Link className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200" href="/certificates">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a Mis Certificados</span>
          </Link>
        </div>
      </div>

      {/* Modal Visor PDF */}
      {isPreviewOpen && selectedDocForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-700">{selectedDocForPreview.fileName || 'Previsualización de Documento'}</span>
              <button onClick={() => setIsPreviewOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-800 relative overflow-hidden">
              <iframe src={`${activeDocUrl}#toolbar=1`} className="w-full h-full border-0 bg-white" title="PDF" />
            </div>
            <div className="p-4 border-t bg-white flex items-center justify-between text-xs">
              <a href={activeDocUrl} target="_blank" rel="noreferrer" className="text-[#00668c] font-semibold flex items-center gap-1 hover:underline">
                <ExternalLink className="h-4 w-4" />
                <span>Abrir PDF en nueva pestaña</span>
              </a>
              <button onClick={() => setIsPreviewOpen(false)} className="px-5 py-2 bg-pink-500 text-white font-semibold rounded-xl">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}