import type { Cliente, NuevoCliente, ActualizarCliente } from '../interfaces/cliente';
import { getAuthHeaders } from './httpCliente.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

export async function getClientes(): Promise<Cliente[]> {
  const response = await fetch(`${API_URL}/clientes`, {
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    const mensaje = await obtenerMensajeError(response, `Error al obtener clientes: ${response.status}`);
    throw new Error(mensaje);
  }

  const body: ApiResponse<Cliente[]> = await response.json();
  return body.data;
}

export async function crearCliente(nuevo: NuevoCliente): Promise<Cliente> {
  const response = await fetch(`${API_URL}/clientes`, {
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
  const response = await fetch(`${API_URL}/clientes/${id}`, {
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
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    const mensaje = await obtenerMensajeError(response, `Error al eliminar cliente ${id}: ${response.status}`);
    throw new Error(mensaje);
  }
}