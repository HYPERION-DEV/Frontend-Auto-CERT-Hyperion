'use client';

import { useState } from 'react';

export default function ReplaceDocumentButton({ requestId, onComplete }: { requestId: string, onComplete: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadAndReextract = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona un nuevo archivo de DNI.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`/api/certificates/${requestId}/replace-document`, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        alert('¡Documento re-evaluado con éxito!');
        onComplete(); // Recarga la vista del certificado con los datos actualizados
      } else {
        alert(`Error: ${result.error || 'No se pudo validar el documento.'}`);
      }
    } catch (err) {
      alert('Ocurrió un error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-md bg-gray-50">
      <label className="text-sm font-bold text-gray-700">Seleccionar nuevo documento (DNI PDF):</label>
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
        className="text-sm"
      />
      
      <button
        onClick={handleUploadAndReextract}
        disabled={!selectedFile || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Re-extrayendo datos con IA...' : 'Reemplazar y Actualizar Datos'}
      </button>
    </div>
  );
}