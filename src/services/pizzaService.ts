import type { Pizza, NuevaPizza, ActualizarPizza } from '../interfaces/pizza';
import { fetchAutenticado, getAuthHeaders } from './httpCliente.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  message?: string;
  data: T;
}

export async function getPizzas(): Promise<Pizza[]> {
  const response = await fetchAutenticado(`${API_URL}/pizzas`, {
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener pizzas: ${response.status}`);
  }

  const body: ApiResponse<Pizza[]> = await response.json();
  return body.data;
}

export async function crearPizza(
  nueva: NuevaPizza,
  imagen?: File
): Promise<Pizza> {
  const headers = new Headers(getAuthHeaders());
  let contenido: string | FormData;

  if (imagen) {
    const formulario = new FormData();
    formulario.append('datos', JSON.stringify(nueva));
    formulario.append('imagen', imagen);
    contenido = formulario;
  } else {
    headers.set('Content-Type', 'application/json');
    contenido = JSON.stringify(nueva);
  }

  const response = await fetchAutenticado(`${API_URL}/pizzas`, {
    method: 'POST',
    headers,
    body: contenido,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.errores?.[0]?.mensaje ??
      error?.message ??
      `Error al crear pizza: ${response.status}`
    );
  }

  const body: ApiResponse<Pizza> = await response.json();
  return body.data;
}

export async function actualizarPizza(
  id: number,
  cambios: ActualizarPizza,
  imagen?: File
): Promise<Pizza> {
  const headers = new Headers(getAuthHeaders());
  let contenido: string | FormData;

  if (imagen) {
    const formulario = new FormData();
    formulario.append('datos', JSON.stringify(cambios));
    formulario.append('imagen', imagen);
    contenido = formulario;
  } else {
    headers.set('Content-Type', 'application/json');
    contenido = JSON.stringify(cambios);
  }

  const response = await fetchAutenticado(`${API_URL}/pizzas/${id}`, {
    method: 'PUT',
    headers,
    body: contenido,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.errores?.[0]?.mensaje ??
      error?.message ??
      `Error al actualizar pizza ${id}: ${response.status}`
    );
  }

  const body: ApiResponse<Pizza> = await response.json();
  return body.data;
}

export async function eliminarPizza(id: number): Promise<void> {
  const response = await fetchAutenticado(`${API_URL}/pizzas/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    throw new Error(`Error al eliminar pizza ${id}: ${response.status}`);
  }
}

export function obtenerUrlImagenPizza(pizza: Pizza): string | null {
  if (!pizza.imagen) return null;

  const urlApi = new URL(API_URL, window.location.origin);
  const urlImagen = new URL(pizza.imagen, urlApi);

  return urlImagen.href;
}