import type { IngredientePizza, NuevoIngredientePizza } from '../interfaces/ingredientePizza';
import { getAuthHeaders } from './httpCliente.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  message?: string;
  data: T;
}

export async function getIngredientesDePizza(pizzaId: number): Promise<IngredientePizza[]> {
  const response = await fetch(`${API_URL}/ingrediente-pizza/pizza/${pizzaId}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error(`Error al obtener la composición de la pizza: ${response.status}`);
  const body: ApiResponse<IngredientePizza[]> = await response.json();
  return body.data;
}

export async function agregarIngredienteAPizza(datos: NuevoIngredientePizza): Promise<IngredientePizza> {
  const response = await fetch(`${API_URL}/ingrediente-pizza`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(datos),
  });
  if (!response.ok) throw new Error(`Error al agregar ingrediente a la pizza: ${response.status}`);
  const body: ApiResponse<IngredientePizza> = await response.json();
  return body.data;
}

export async function actualizarCantidad(
  pizzaId: number,
  ingredienteId: number,
  cantidad: number
): Promise<IngredientePizza> {
  const response = await fetch(`${API_URL}/ingrediente-pizza/${pizzaId}/${ingredienteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ cantidad }),
  });
  if (!response.ok) throw new Error(`Error al actualizar cantidad: ${response.status}`);
  const body: ApiResponse<IngredientePizza> = await response.json();
  return body.data;
}

export async function quitarIngredienteDePizza(pizzaId: number, ingredienteId: number): Promise<void> {
  const response = await fetch(`${API_URL}/ingrediente-pizza/${pizzaId}/${ingredienteId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error(`Error al quitar ingrediente: ${response.status}`);
}