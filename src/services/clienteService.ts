import type { FiltrosPersona, Pagina } from '../interfaces/listado.ts';
import { obtenerPagina } from './listadoService.ts';
import type { Cliente, NuevoCliente, ActualizarCliente } from '../interfaces/cliente';
import { fetchAutenticado, getAuthHeaders } from './httpCliente.ts';

import { API_URL } from '../config';

interface ApiResponse<T> {
  message?: string;
  data: T;
}

interface ApiError {
  message?: string;
}

async function obtenerMensajeError(response: Response, mensajePredeterminado: string): Promise<string> {
  const body: ApiError | null = await response.json().catch(() => null);
  return body?.message || mensajePredeterminado;
}

export async function getClientes(filtros: FiltrosPersona = {}, signal?: AbortSignal): Promise<Pagina<Cliente>> {
  return obtenerPagina<Cliente>('clientes', filtros, signal);
}
export async function crearCliente(nuevo: NuevoCliente): Promise<Cliente> {
  const response = await fetchAutenticado(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(nuevo),
  });

  if (!response.ok) {
    const mensaje = await obtenerMensajeError(response, `Error al crear cliente: ${response.status}`);
    throw new Error(mensaje);
  }

  const body: ApiResponse<Cliente> = await response.json();
  return body.data;
}

export async function actualizarCliente(id: number, cambios: ActualizarCliente): Promise<Cliente> {
  const response = await fetchAutenticado(`${API_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(cambios),
  });

  if (!response.ok) {
    const mensaje = await obtenerMensajeError(response, `Error al actualizar cliente ${id}: ${response.status}`);
    throw new Error(mensaje);
  }

  const body: ApiResponse<Cliente> = await response.json();
  return body.data;
}

export async function eliminarCliente(id: number): Promise<void> {
  const response = await fetchAutenticado(`${API_URL}/clientes/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    const mensaje = await obtenerMensajeError(response, `Error al eliminar cliente ${id}: ${response.status}`);
    throw new Error(mensaje);
  }
}
