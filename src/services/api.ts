// frontend-hyperion/src/services/api.ts

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyDniPayload {
  file: File;
  fileRuc?: File;
  fileVigencia?: File;
  documentNumber: string;
  email: string;
  phone: string;
  entityType?: 'PERSONA_NATURAL' | 'EMPRESA';
  planType?: string;
  companyRuc?: string;
  companyName?: string;
  rucType?: string;
}

export interface VerifyCompanyPayload {
  fileDni: File;
  fileRuc?: File;
  fileVigencia?: File;
  ruc: string;
  razonSocial: string;
  repLegalDni: string;
  email: string;
  phone: string;
  entityType: 'company';
  planType: string;
}

type SessionExpiredHandler = () => void;
let onSessionExpiredCallback: SessionExpiredHandler | null = null;

export const setOnSessionExpired = (callback: SessionExpiredHandler) => {
  onSessionExpiredCallback = callback;
};

// 📌 INTERCEPTOR CENTRAL: Procesa las respuestas e intercepta 401 (Sesión Expirada)
async function handleResponse(res: Response) {
  // 1. SI EL BACKEND RESPONDE 401 (TOKEN EXPIRADO)
  if (res.status === 401) {
    if (onSessionExpiredCallback) {
      onSessionExpiredCallback(); // Invocación inmediata del Modal Global
    } else if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=true';
    }
    // Retornamos una promesa que no se resuelve como éxito ni como error explotable en las páginas
    return new Promise(() => {}); 
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data.error || 'Ocurrió un error en la solicitud.');
  }

  return data;
}

export const api = {
  // 1. Autenticación: Login
  async login(payload: LoginPayload) {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  // 1.1 Autenticación: Logout (DESTRUYE LA COOKIE AUTH_TOKEN)
  async logout() {
    const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    return handleResponse(res);
  },

  // 2. Verificación de expedientes (DNI o Empresa)
  async verifyDni(payload: VerifyDniPayload) {
    const isEmpresa = payload.entityType === 'EMPRESA';
    const formData = new FormData();

    if (isEmpresa) {
      // Endpoint para solicitudes de Empresa
      formData.append('fileDni', payload.file);
      if (payload.fileRuc) formData.append('fileRuc', payload.fileRuc);
      if (payload.fileVigencia) formData.append('fileVigencia', payload.fileVigencia);

      formData.append('documentNumber', payload.documentNumber);
      formData.append('email', payload.email);
      formData.append('phone', payload.phone);
      formData.append('companyRuc', payload.companyRuc || '');
      formData.append('companyName', payload.companyName || '');

      const res = await fetch(`${BACKEND_URL}/api/verify/company`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return handleResponse(res);
    } else {
      // Endpoint para Persona Natural
      formData.append('file', payload.file);
      formData.append('documentNumber', payload.documentNumber);
      formData.append('email', payload.email);
      formData.append('phone', payload.phone);
      formData.append('entityType', 'PERSONA_NATURAL');
      formData.append('planType', payload.planType || 'ONE_SHOT');

      const res = await fetch(`${BACKEND_URL}/api/verify/dni`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return handleResponse(res);
    }
  },

  // 3. Carga individual de documentos
  async uploadSingleDocument(requestId: string, category: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const res = await fetch(`${BACKEND_URL}/api/certificates/${requestId}/documents`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    return handleResponse(res);
  },

  // 4. Obtención del listado de certificados
  async getCertificates() {
    const res = await fetch(`${BACKEND_URL}/api/certificates`, {
      method: 'GET',
      credentials: 'include',
    });

    return handleResponse(res);
  },

  // 5. Consulta del detalle de un certificado por ID
  async getCertificateById(id: string) {
    const res = await fetch(`${BACKEND_URL}/api/certificates/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return handleResponse(res);
  },

  // 6. Reemplazar documento rechazado
  async replaceDocument(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BACKEND_URL}/api/certificates/${id}/replace-document`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });

    return handleResponse(res);
  },

  // 7. Consulta externa de RUC
  async lookupRuc(ruc: string) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sunat/ruc/${ruc}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await handleResponse(res);
      return { ok: true, data };
    } catch (error: any) {
      console.error('Error al invocar API de RUC:', error);
      return { ok: false, data: { found: false, message: error.message || 'Error de red o conexión.' } };
    }
  },
};