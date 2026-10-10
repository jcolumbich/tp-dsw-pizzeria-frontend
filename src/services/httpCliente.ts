let tokenActual: string | null = null;
export function setAuthToken(token: string | null): void {
  tokenActual = token;
}
export function getAuthHeaders(): HeadersInit {
  return tokenActual
    ? { Authorization: `Bearer ${tokenActual}` }
    : {};
}
export async function errorRespuesta(respuesta: Response, mensajePredeterminado: string): Promise<Error & { status: number }> {
  const datos = await respuesta.json().catch(() => null);
  const mensaje = datos?.errores?.[0]?.mensaje ?? datos?.message ?? mensajePredeterminado;
  return Object.assign(new Error(mensaje), { status: respuesta.status });
}
export async function fetchAutenticado(
  url: string,
  opciones?: RequestInit
): Promise<Response> {
  const tokenDeLaSolicitud = tokenActual;
  const respuesta = await fetch(url, opciones);
  if (
    respuesta.status === 401 &&
    tokenDeLaSolicitud &&
    tokenDeLaSolicitud === tokenActual
  ) {
    window.dispatchEvent(new Event('sesion-expirada'));
  }
  return respuesta;
}