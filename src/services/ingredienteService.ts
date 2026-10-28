import type {Ingrediente,NuevoIngrediente,ActualizarIngrediente,} from '../interfaces/ingrediente';
import { fetchAutenticado, getAuthHeaders, errorRespuesta } from './httpCliente.ts';
import { API_URL } from '../config';
interface ApiResponse<T> {
  message?: string;
  data: T;
}
export async function getIngredientes(): Promise<Ingrediente[]> {
  const response = await fetchAutenticado(`${API_URL}/ingredientes`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    throw await errorRespuesta(response, `Error al obtener ingredientes: ${response.status}`);
  }
  const body: ApiResponse<Ingrediente[]> = await response.json();
  return body.data;
}
export async function getIngredienteById(id: number): Promise<Ingrediente> {
  const response = await fetchAutenticado(`${API_URL}/ingredientes/${id}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    throw await errorRespuesta(response, `Error al obtener el ingrediente ${id}: ${response.status}`);
  }
  const body: ApiResponse<Ingrediente> = await response.json();
  return body.data;
}
export async function crearIngrediente(
  nuevoIngrediente: NuevoIngrediente
): Promise<Ingrediente> {
  const response = await fetchAutenticado(`${API_URL}/ingredientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(nuevoIngrediente),
  });
  if (!response.ok) {
    throw await errorRespuesta(response, `Error al crear ingrediente: ${response.status}`);
  }
  const body: ApiResponse<Ingrediente> = await response.json();
  return body.data;
}
export async function actualizarIngrediente(
  id: number,
  cambios: ActualizarIngrediente
): Promise<Ingrediente> {
  const response = await fetchAutenticado(`${API_URL}/ingredientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(cambios),
  });
  if (!response.ok) {
    throw await errorRespuesta(response, `Error al actualizar ingrediente ${id}: ${response.status}`);
  }
  const body: ApiResponse<Ingrediente> = await response.json();
  return body.data;
}
export async function eliminarIngrediente(id: number): Promise<void> {
  const response = await fetchAutenticado(`${API_URL}/ingredientes/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    throw await errorRespuesta(response, `Error al eliminar ingrediente ${id}: ${response.status}`);
  }
}
