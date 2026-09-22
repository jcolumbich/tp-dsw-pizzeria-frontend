import type { Pizza, NuevaPizza, ActualizarPizza } from '../interfaces/pizza';
import { getAuthHeaders } from './httpCliente.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  message?: string;
  data: T;
}

export async function getPizzas(): Promise<Pizza[]> {
  const response = await fetch(`${API_URL}/pizzas`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error(`Error al obtener pizzas: ${response.status}`);
  const body: ApiResponse<Pizza[]> = await response.json();
  return body.data;
}

export async function crearPizza(nueva: NuevaPizza): Promise<Pizza> {
  const response = await fetch(`${API_URL}/pizzas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(nueva),
  });
  if (!response.ok) throw new Error(`Error al crear pizza: ${response.status}`);
  const body: ApiResponse<Pizza> = await response.json();
  return body.data;
}

export async function actualizarPizza(id: number, cambios: ActualizarPizza): Promise<Pizza> {
  const response = await fetch(`${API_URL}/pizzas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(cambios),
  });
  if (!response.ok) throw new Error(`Error al actualizar pizza ${id}: ${response.status}`);
  const body: ApiResponse<Pizza> = await response.json();
  return body.data;
}

export async function eliminarPizza(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/pizzas/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error(`Error al eliminar pizza ${id}: ${response.status}`);
}