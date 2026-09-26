'use client';

import React, { useState } from 'react';
import { api } from '@/services/api';

interface CertificateActionsModalProps {
  isOpen: boolean;
  certificateId: string;
  documentType: string; // Categoría: DNI_FRONT_BACK, FICHA_RUC, VIGENCIA_PODER
  documentTypeName: string;
  onClose: () => void;
  onSuccess: () => void;
  onConfirmUpload?: (file: File) => Promise<void>; // 👈 Añadir esta propiedad opcional
}

export const CertificateActionsModal: React.FC<CertificateActionsModalProps> = ({
  isOpen,
  certificateId,
  documentType,
  documentTypeName,
  onClose,
  onSuccess
}: CertificateActionsModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReplacementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', documentType);

    try {
      // Enviar reemplazo que sube automáticamente a Supabase y re-valida
      const response = await api.replaceDocument(certificateId, formData);

      if (response.success || response.ok) {
        alert('Documento guardado en Supabase y verificado correctamente.');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(error.message || 'Error al intentar reemplazar el documento.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          Reemplazar Documento
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Seleccione el nuevo archivo para <span className="font-semibold text-gray-800">{documentTypeName}</span>. Se almacenará en el almacenamiento seguro y se actualizará la información.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleReplacementSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Seleccionar nuevo archivo
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 border rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedFile || loading}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Subiendo a Supabase...' : 'Confirmar y Reemplazar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificateActionsModal;