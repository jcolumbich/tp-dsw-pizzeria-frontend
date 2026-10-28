import type { Pagina } from '../interfaces/listado';
import { fetchAutenticado, getAuthHeaders, errorRespuesta } from './httpCliente';
import { API_URL } from '../config';

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
    throw new Error('El servidor no devolviÃ³ un listado paginado. ActualizÃ¡ tambiÃ©n el backend.');
  }
  return body;
}
