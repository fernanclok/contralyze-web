import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/app/lib/session';
import axios from 'axios';

export async function GET() {
  try {
    // Obtener la sesión del usuario desde la cookie
    const session = await getSession();

    // Si no hay sesión, retornar un error
    if (!session) {
      return NextResponse.json(
        { error: 'No se encontró sesión de usuario' },
        { status: 401 }
      );
    }

    // Intentar obtener información adicional del usuario desde el backend
    const token = (await cookies()).get('access_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'No se encontró token de autenticación' },
        { status: 401 }
      );
    }

    try {
      // Llamar a la API del backend para obtener información completa del usuario
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${session.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Si obtenemos información del usuario incluyendo departamento, la retornamos
      if (response.data) {
        return NextResponse.json({
          id: session.id,
          role: session.role,
          firstName: session.userFirstName,
          lastName: session.userLastName,
          department: response.data.department || null,
          // Añadimos cualquier otra información relevante del usuario
          ...response.data
        });
      }
    } catch (backendError) {
      console.error('Error al obtener información extendida del usuario:', backendError);
      // Si falla, continuamos con la información básica
    }

    // Retornar la información básica del usuario (sin departamento)
    return NextResponse.json({
      id: session.id,
      role: session.role,
      firstName: session.userFirstName,
      lastName: session.userLastName,
      department: null // No tenemos información de departamento
    });
  } catch (error) {
    console.error('Error al obtener la información del usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener la información del usuario' },
      { status: 500 }
    );
  }
} 