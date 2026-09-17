'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { 
  Plus, Search, RefreshCw, FileText, Eye, CheckCircle2, XCircle, Loader2, AlertCircle, 
  User,
  Building2
} from 'lucide-react';

export default function CertificatesListPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCertificates = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.getCertificates();
      setCertificates(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Error al obtener la lista de certificados.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filteredCertificates = certificates.filter((cert) => {
    const codeMatch = cert.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const dniMatch = cert.applicantDocNum?.includes(searchTerm);
    const nameMatch = `${cert.applicantNames} ${cert.applicantSurname1}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return codeMatch || dniMatch || nameMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mis Certificados</h1>
          <p className="text-xs text-slate-500">Gestión e historial de solicitudes de certificados digitales.</p>
        </div>

        <Link
          href="/certificates/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#00668c] hover:bg-[#005270] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Solicitar Nuevo Certificado</span>
        </Link>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, DNI o nombre..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00b8b8]"
          />
        </div>

        <button
          onClick={fetchCertificates}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Tabla de Resultados */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-[#00668c] animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Cargando registros desde PostgreSQL...</p>
        </div>
      ) : error ? (
        <div className="bg-pink-50 p-6 rounded-2xl border border-pink-200 text-center space-y-2 text-pink-700 text-xs font-semibold">
          <AlertCircle className="h-6 w-6 mx-auto" />
          <p>{error}</p>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <FileText className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No se encontraron solicitudes</h3>
          <p className="text-xs text-slate-400">Prueba con otro término de búsqueda o crea una nueva solicitud.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Código</th>
                  <th className="p-4">Titular</th>
                  <th className="p-4">Documento</th>
                  <th className="p-4">Tipo Entidad</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Progreso</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCertificates.map((cert) => {
                  const isCompany = cert.entityType === 'EMPRESA';
                  const isRejected = cert.status === 'RECHAZADO';
                  // Nombres completos limpios de la persona
                  const personName = `${cert.applicantNames || ''} ${cert.applicantSurname1 || ''}`.trim();
                  
                  // SI ES EMPRESA MOSTRAR OBLIGATORIAMENTE Y ÚNICAMENTE LA RAZÓN SOCIAL
                  const displayTitle = isCompany 
                    ? (cert.companyName && cert.companyName !== 'N/A' ? cert.companyName : 'Razón Social No Asignada')
                    : personName;
                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-[#00668c]">{cert.code}</td>
                        <td className="p-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          {isCompany ? <Building2 className="h-3.5 w-3.5 text-[#00668c] shrink-0" /> : <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                          <span className="truncate max-w-[250px]" title={displayTitle}>
                            {displayTitle}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{cert.applicantDocNum}</td>
                      <td className="p-4 font-medium">{cert.entityType === 'PERSONA_NATURAL' ? 'Persona Natural' : 'Empresa'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isRejected 
                            ? 'bg-pink-50 text-pink-600 border border-pink-200' 
                            : 'bg-teal-50 text-[#00b8b8] border border-[#00b8b8]/20'
                        }`}>
                          {isRejected ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                          {cert.status === 'EN_REVISION' ? 'En Revisión' : cert.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold">{cert.progress}</td>
                      <td className="p-4 text-slate-400">
                        {new Date(cert.createdAt).toLocaleDateString('es-PE')}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/certificates/${cert.id}`}
                          className="p-1.5 inline-flex text-slate-400 hover:text-[#00668c] hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          title="Ver Detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}