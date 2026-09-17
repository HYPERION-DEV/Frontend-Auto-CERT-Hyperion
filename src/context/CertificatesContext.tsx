'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CertificateItem {
  id: string;
  code: string;
  type: string;
  createdDate: string;
  status: 'En Revisión' | 'Pendiente' | 'Rechazado' | 'Emitido';
  progress: '0/1' | '1/1';
  docType: 'DNI' | 'CE';
  dniPdfUrl?: string;
  email?: string;
  phone?: string;
  ocrData?: {
    documentNumber: string;
    pdfDetectedDni: string;
    cui?: string; // <-- AÑADIR ESTA LÍNEA
    names: string;
    firstSurname: string;
    secondSurname: string;
    birthDate: string;
    nationality: string;
    isMatch: boolean;
  };
}

interface CertificatesContextType {
  certificates: CertificateItem[];
  addCertificate: (newCert: Partial<CertificateItem>) => void;
}

const CertificatesContext = createContext<CertificatesContextType | undefined>(undefined);

export function CertificatesProvider({ children }: { children: React.ReactNode }) {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('hyperion_certificates');
    if (saved) setCertificates(JSON.parse(saved));
  }, []);

  const addCertificate = (newCertData: Partial<CertificateItem>) => {
    const newCode = `CERT-2026-09-0${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    
    const newCert: CertificateItem = {
      id: Math.floor(100 + Math.random() * 900).toString(),
      code: newCode,
      type: newCertData.type || 'Persona Natural',
      createdDate: today,
      status: newCertData.status || 'Pendiente',
      progress: newCertData.progress || '0/1',
      docType: newCertData.docType || 'DNI',
      dniPdfUrl: newCertData.dniPdfUrl || '',
      email: newCertData.email || '',
      phone: newCertData.phone || '',
      ocrData: newCertData.ocrData || {
        documentNumber: '',
        pdfDetectedDni: '',
        cui: '',
        names: '',
        firstSurname: '',
        secondSurname: '',
        birthDate: '',
        nationality: 'Peruana',
        isMatch: false,
      },
    };

    const updated = [newCert, ...certificates];
    setCertificates(updated);
    localStorage.setItem('hyperion_certificates', JSON.stringify(updated));
  };

  return (
    <CertificatesContext.Provider value={{ certificates, addCertificate }}>
      {children}
    </CertificatesContext.Provider>
  );
}

export function useCertificates() {
  const context = useContext(CertificatesContext);
  if (!context) throw new Error('useCertificates debe usarse dentro de CertificatesProvider');
  return context;
}