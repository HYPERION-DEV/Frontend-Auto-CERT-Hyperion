import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

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
        { error: 'Configuración de servidor incompleta (API Key no encontrada)' },
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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    const ai = new GoogleGenAI({ apiKey });
    const base64Pdf = buffer.toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Pdf,
          },
        },
        {
          text: 'Analiza la imagen del DNI en el PDF. Extrae estrictamente los datos reales visibles en la tarjeta: CUI/DNI, nombres exactos, primer apellido, segundo apellido y fecha de nacimiento. No inventes ni asumas información.',
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
      fileUrl,
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