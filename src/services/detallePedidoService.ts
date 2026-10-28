import type { Pedido } from '../interfaces/pedido';
import { fetchAutenticado, getAuthHeaders } from './httpCliente.ts';

import { API_URL } from '../config';

interface DetalleResponse<T> {
  message?: string;
  data: T;
  pedido?: Pedido;
}

export async function agregarItemAPedido(
  pedidoId: number,
  pizzaId: number,
  cantidad: number
): Promise<Pedido | undefined> {
  const response = await fetchAutenticado(`${API_URL}/detalle-pedido`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ pedidoId, pizzaId, cantidad }),
  });
  if (!response.ok) throw new Error(`Error al agregar el Ã­tem: ${response.status}`);
  const body: DetalleResponse<unknown> = await response.json();
  return body.pedido;
}

export async function actualizarCantidadItem(
  pedidoId: number,
  pizzaId: number,
  cantidad: number
): Promise<Pedido | undefined> {
  const response = await fetchAutenticado(`${API_URL}/detalle-pedido/${pedidoId}/${pizzaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ cantidad }),
  });
  if (!response.ok) throw new Error(`Error al actualizar el Ã­tem: ${response.status}`);
  const body: DetalleResponse<unknown> = await response.json();
  return body.pedido;
}

export async function eliminarItemDePedido(
  pedidoId: number,
  pizzaId: number
): Promise<Pedido | undefined> {
  const response = await fetchAutenticado(`${API_URL}/detalle-pedido/${pedidoId}/${pizzaId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error(`Error al eliminar el Ã­tem: ${response.status}`);
  const body: DetalleResponse<unknown> = await response.json();
  return body.pedido;
}
