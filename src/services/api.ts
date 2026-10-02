const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
export interface LookupDniResponse {
  ok: boolean;
  message?: string;
  data?: {
    nombreCompleto?: string;
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
  };
}
const API_JSON_TOKEN = process.env.NEXT_PUBLIC_API_JSON_TOKEN || '72f4a7f38b710a7687193ca840f9aaa5e5944e8aaf34b6d339602bf8a370';
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
  useTempEmail?: boolean; // 👈 AGREGAR ESTA LÍNEA
  entityType: 'PERSONA_NATURAL' | 'EMPRESA';
  planType: string;
  companyRuc?: string;
  companyName?: string;
  rucType?: string;
}

export interface ValidateDocumentsPayload {
  formData: {
    ruc?: string;
    dni?: string;
    razonSocial?: string;
    representanteLegal?: string;
  };
  extractedData: Array<{
    documentType: string;
    fileName: string;
    extractedFields: {
      ruc?: string;
      dni?: string;
      razonSocial?: string;
      representanteLegal?: string;
    };
  }>;
}

type SessionExpiredHandler = () => void;
let onSessionExpiredCallback: SessionExpiredHandler | null = null;

export const setOnSessionExpired = (callback: SessionExpiredHandler) => {
  onSessionExpiredCallback = callback;
};

// Error personalizado para identificar expiración de sesión
export class SessionExpiredError extends Error {
  constructor() {
    super('SESION_EXPIRADA');
    this.name = 'SessionExpiredError';
  }
}

// Interceptor central
async function handleResponse(res: Response) {
  if (res.status === 401) {
    if (onSessionExpiredCallback) {
      onSessionExpiredCallback();
    } else if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=true';
    }
    throw new SessionExpiredError();
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch { }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Error en la solicitud: ${res.statusText}`);
  }

  return data;
}

export const api = {
  // 1. Autenticación
  async login(payload: LoginPayload) {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async logout() {
    const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // 2. Verificación y Registro Unificado
  verifyDni: async (payload: VerifyDniPayload) => {
    const formData = new FormData();
    const isEmpresa = payload.entityType === 'EMPRESA';

    const endpoint = isEmpresa
      ? `${BACKEND_URL}/api/verify/company`
      : `${BACKEND_URL}/api/verify/dni`;

    if (isEmpresa) {
      formData.append('fileDni', payload.file);
      if (payload.fileRuc) formData.append('fileRuc', payload.fileRuc);
      if (payload.fileVigencia) formData.append('fileVigencia', payload.fileVigencia);

      formData.append('documentNumber', payload.documentNumber);
      formData.append('email', payload.email);
      formData.append('phone', payload.phone);
      if (payload.useTempEmail !== undefined) {
        formData.append('useTempEmail', String(payload.useTempEmail));
      }
      formData.append('companyRuc', payload.companyRuc || '');
      formData.append('companyName', payload.companyName || '');
      formData.append('planType', payload.planType);
    } else {
      formData.append('file', payload.file);
      formData.append('documentNumber', payload.documentNumber);
      formData.append('email', payload.email);
      formData.append('phone', payload.phone);
      if (payload.useTempEmail !== undefined) {
        formData.append('useTempEmail', String(payload.useTempEmail));
      }
      formData.append('entityType', payload.entityType);
      formData.append('planType', payload.planType);
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    return handleResponse(res);
  },
  // Alias para la creación de solicitudes (apunta a verifyDni/company o directo)
  async createCertificate(payload: VerifyDniPayload) {
    return this.verifyDni(payload);
  },

  // 3. Carga individual
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

  // 4. Listado
  async getCertificates() {
    const res = await fetch(`${BACKEND_URL}/api/certificates`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // 5. Detalle
  async getCertificateById(id: string) {
    const res = await fetch(`${BACKEND_URL}/api/certificates/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // 6. Reemplazo
  async replaceDocument(id: string, fileOrFormData: File | FormData, documentType?: string) {
    let bodyData: FormData;

    if (fileOrFormData instanceof FormData) {
      bodyData = fileOrFormData;
    } else {
      bodyData = new FormData();
      bodyData.append('file', fileOrFormData);
      if (documentType) bodyData.append('documentType', documentType);
    }

    const res = await fetch(`${BACKEND_URL}/api/certificates/${id}/replace-document`, {
      method: 'POST',
      body: bodyData,
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // 7. Consulta RUC
  async lookupRuc(ruc: string) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sunat/ruc/${ruc}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await handleResponse(res);
      return { ok: true, data };
    } catch (error: any) {
      if (error instanceof SessionExpiredError) throw error;
      console.error('Error al invocar API de RUC:', error);
      return { ok: false, data: { found: false, message: error.message || 'Error de conexión.' } };
    }
  },

  async syncBiocamerClient(certificateId: string) {
    const res = await fetch(`${BACKEND_URL}/api/certificates/${certificateId}/sync-biocamer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return handleResponse(res);
  },

  checkBiocamerStatus: async (id: string) => {
    const response = await fetch(`${BACKEND_URL}/api/certificates/${id}/check-biocamer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  autofillCamerfirma: async (certificateId: string) => {
    const response = await fetch(`${BACKEND_URL}/api/certificates/${certificateId}/autofill-camerfirma`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // 8. Validación Previa
  async validateDocuments(payload: ValidateDocumentsPayload) {
    const res = await fetch(`${BACKEND_URL}/api/certificates/validate-documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  // 9. Re-procesar OCR con Gemini (sin volver a subir archivo)
  async reprocessCertificate(id: string) {
    const res = await fetch(`${BACKEND_URL}/api/certificates/${id}/reprocess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return handleResponse(res);
  },
  checkEmails: async (certificateId: string) => {
    const res = await fetch(`${BACKEND_URL}/api/certificates/${certificateId}/check-emails`, {
      method: 'POST',
      credentials: 'include', // 👈 VITAL: envía las cookies de sesión (auth_token)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${res.status}: No autorizado o fallo de servidor.`);
    }

    return await res.json();
  },
  lookupDni: async (dni: string): Promise<LookupDniResponse> => {
    try {
      const response = await fetch('https://api.json.pe/api/dni', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_JSON_TOKEN}`,
        },
        body: JSON.stringify({ dni }),
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        return {
          ok: true,
          data: {
            nombreCompleto: result.data.nombre_completo,
            nombres: result.data.nombres,
            apellidoPaterno: result.data.apellido_paterno,
            apellidoMaterno: result.data.apellido_materno,
          },
        };
      }

      return { ok: false, message: result.message || 'No se encontró información' };
    } catch (error: any) {
      return { ok: false, message: error.message || 'Error de conexión con la API DNI' };
    }
  },
};

export default api;