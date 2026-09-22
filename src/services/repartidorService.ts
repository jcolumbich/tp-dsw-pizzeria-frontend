import type {
  Repartidor,
  NuevoRepartidor,
  ActualizarRepartidor,
} from '../interfaces/repartidor';
import { getAuthHeaders } from './httpCliente.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  message?: string;
  data: T;
}

export async function getRepartidores(): Promise<Repartidor[]> {
  const response = await fetch(`${API_URL}/repartidores`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
  const body = await response.json().catch(() => null);
  throw new Error(body?.message || `Error al crear repartidor: ${response.status}`);
 }
  const body: ApiResponse<Repartidor[]> = await response.json();
  return body.data;
}

export async function crearRepartidor(nuevoRepartidor: NuevoRepartidor): Promise<Repartidor> {
  const response = await fetch(`${API_URL}/repartidores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(nuevoRepartidor),
  });
  if (!response.ok) throw new Error(`Error al crear repartidor: ${response.status}`);
  const body: ApiResponse<Repartidor> = await response.json();
  return body.data;
}

export async function actualizarRepartidor(
  id: number,
  cambios: ActualizarRepartidor
): Promise<Repartidor> {
  const response = await fetch(`${API_URL}/repartidores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(cambios),
  });
  if (!response.ok) {
  const body = await response.json().catch(() => null);
  throw new Error(body?.message || `Error al actualizar repartidor ${id}: ${response.status}`);
 }
  const body: ApiResponse<Repartidor> = await response.json();
  return body.data;
}

export async function eliminarRepartidor(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/repartidores/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Error al eliminar repartidor ${id}: ${response.status}`);
  }
}