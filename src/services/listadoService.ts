import type { Pagina } from '../interfaces/listado';
import { fetchAutenticado, getAuthHeaders, errorRespuesta } from './httpCliente';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function obtenerPagina<T>(recurso: string, filtros: object, signal?: AbortSignal): Promise<Pagina<T>> {
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') parametros.set(clave, String(valor));
  }
  const respuesta = await fetchAutenticado(`${API_URL}/${recurso}?${parametros}`, {
    headers: getAuthHeaders(), signal,
  });
  if (!respuesta.ok) throw await errorRespuesta(respuesta, 'No se pudo cargar el listado');
  const body: Pagina<T> = await respuesta.json();
  if (!Array.isArray(body.data) || !body.paginacion) {
    throw new Error('El servidor no devolvió un listado paginado. Actualizá también el backend.');
  }
  return body;
}
