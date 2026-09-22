import type { RespuestaLogin } from '../interfaces/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  message?: string;
  data: T;
}

export async function login(email: string, contrasenia: string): Promise<RespuestaLogin> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, contrasenia }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'No se pudo iniciar sesión');
  }

  const body: ApiResponse<RespuestaLogin> = await response.json();
  return body.data;
}