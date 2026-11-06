// frontend-hyperion/src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Validación de Magic Bytes para PDF: %PDF (25 50 44 46)
function isRealPdf(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  );
}

const dniResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    documentoDetectado: { type: Type.BOOLEAN },
    cuiDni: { type: Type.STRING, description: 'Número de DNI de 8 dígitos' },
    nombres: { type: Type.STRING, description: 'Nombres tal cual figuran en el DNI' },
    primerApellido: { type: Type.STRING, description: 'Primer apellido / Apellido paterno' },
    segundoApellido: { type: Type.STRING, description: 'Segundo apellido / Apellido materno' },
    fechaNacimiento: { type: Type.STRING, description: 'Fecha de nacimiento en formato DD/MM/YYYY' },
    nacionalidad: { type: Type.STRING, description: 'Nacionalidad (ej. Peruana)' },
  },
  required: ['documentoDetectado', 'cuiDni', 'nombres', 'primerApellido', 'segundoApellido'],
};

export async function POST(request: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Configuración de servidor incompleta.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const inputDni = ((formData.get('documentNumber') as string) || '').trim();

    if (!file) {
      return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Verificación Estricta de Integridad Binaria (Magic Bytes)
    if (!isRealPdf(buffer)) {
      return NextResponse.json(
        { error: 'El archivo adjunto no es un PDF legítimo válido.' },
        { status: 400 }
      );
    }

    // 2. Almacenamiento Seguro en Supabase (Bucket Privado)
    const storagePath = `requests/${Date.now()}-${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('biometric-documents')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Error en almacenamiento seguro: ${uploadError.message}`);
    }

    // 3. Generación de URL Firmada con TTL Corto (15 minutos)
    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from('biometric-documents')
      .createSignedUrl(storagePath, 900);

    if (signError || !signedData?.signedUrl) {
      throw new Error('No se pudo generar el enlace de visualización seguro.');
    }

    // 4. Extracción Documental con Inteligencia Artificial
    const ai = new GoogleGenAI({ apiKey });
    const base64Pdf = buffer.toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Pdf,
          },
        },
        {
          text: 'Analiza la imagen del DNI en el PDF. Extrae estrictamente los datos reales visibles en la tarjeta: CUI/DNI, nombres exactos, primer apellido, segundo apellido y fecha de nacimiento.',
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: dniResponseSchema,
        temperature: 0.0,
      },
    });

    const responseText = response.text || '{}';
    const extractedData = JSON.parse(responseText);
    const detectedDni = (extractedData.cuiDni || '').replace(/\D/g, '');

    const isMatch = detectedDni !== '' && detectedDni === inputDni;
    const certStatus = isMatch ? 'En Revisión' : 'Rechazado';
    const certProgress = isMatch ? '1/1' : '0/1';

    return NextResponse.json({
      success: true,
      fileUrl: signedData.signedUrl,
      storagePath,
      verification: {
        status: certStatus,
        progress: certProgress,
        inputDni,
        detectedDni,
        isMatch,
        extractedDetails: extractedData,
      },
    });
  } catch (error: any) {
    console.error('Error en API Upload:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno durante la verificación' },
      { status: 500 }
    );
  }
}