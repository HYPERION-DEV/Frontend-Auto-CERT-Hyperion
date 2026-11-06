// frontend-hyperion/src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 1. Obtener el token de la cookie HttpOnly
  const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // 2. Si tienes el backend en el puerto 4000 o similar:
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${backendUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: request.headers.get('cookie') || '',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ user: null }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Si el backend no expone /api/auth/me, responde 200 con sesión vacía en lugar de romper
    return NextResponse.json({ user: null }, { status: 200 });
  }
}