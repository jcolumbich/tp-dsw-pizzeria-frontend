import type { FiltrosPersona, Pagina } from '../interfaces/listado';
import { obtenerPagina } from './listadoService';
import type {Repartidor, NuevoRepartidor,ActualizarRepartidor,} from '../interfaces/repartidor';
import { fetchAutenticado, getAuthHeaders } from './httpCliente.ts';

import { API_URL } from '../config';

interface ApiResponse<T> {
  message?: string;
  data: T;
}

export async function getRepartidores(filtros: FiltrosPersona = {}, signal?: AbortSignal): Promise<Pagina<Repartidor>> {
  return obtenerPagina<Repartidor>('repartidores', filtros, signal);
}
export async function crearRepartidor(
  nuevoRepartidor: NuevoRepartidor
): Promise<Repartidor> {
  const response = await fetchAutenticado(`${API_URL}/repartidores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(nuevoRepartidor),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message || `Error al crear repartidor: ${response.status}`
    );
  }

  const body: ApiResponse<Repartidor> = await response.json();
  return body.data;
}

export async function actualizarRepartidor(
  id: number,
  cambios: ActualizarRepartidor
): Promise<Repartidor> {
  const response = await fetchAutenticado(`${API_URL}/repartidores/${id}`, {
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
  const response = await fetchAutenticado(`${API_URL}/repartidores/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Error al eliminar repartidor ${id}: ${response.status}`);
  }
}
