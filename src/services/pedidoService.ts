import type { NuevoPedido, Pedido } from '../interfaces/pedido';
import { getAuthHeaders } from './httpCliente.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  message?: string;
  data: T;
}

export async function getPedidos(estado?: string): Promise<Pedido[]> {
  const query = estado ? `?estado=${encodeURIComponent(estado)}` : '';
  const response = await fetch(`${API_URL}/pedidos${query}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error(`Error al obtener pedidos: ${response.status}`);
  const body: ApiResponse<Pedido[]> = await response.json();
  return body.data;
}

export async function getPedidoById(id: number): Promise<Pedido> {
  const response = await fetch(`${API_URL}/pedidos/${id}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error(`Error al obtener el pedido ${id}: ${response.status}`);
  const body: ApiResponse<Pedido> = await response.json();
  return body.data;
}

export async function crearPedido(nuevo: NuevoPedido): Promise<Pedido> {
  const response = await fetch(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(nuevo),
  });
  if (!response.ok) throw new Error(`Error al crear el pedido: ${response.status}`);
  const body: ApiResponse<Pedido> = await response.json();
  return body.data;
}

export async function actualizarEstadoPedido(id: number, estado: string): Promise<Pedido> {
  const response = await fetch(`${API_URL}/pedidos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) throw new Error(`Error al actualizar el estado del pedido ${id}: ${response.status}`);
  const body: ApiResponse<Pedido> = await response.json();
  return body.data;
}

export async function asignarEnvio(id: number, repartidorId: number, costo: number): Promise<Pedido> {
  const response = await fetch(`${API_URL}/pedidos/${id}/asignar-envio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ repartidorId, costo }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Error al asignar el envío al pedido ${id}`);
  }
  const body: ApiResponse<Pedido> = await response.json();
  return body.data;
}
