// En desarrollo Vite redirige /api al backend local.
// En produccion VITE_API_URL apunta a la API publicada.
const configurada = import.meta.env.VITE_API_URL?.trim();

if (!configurada && import.meta.env.PROD) {
  throw new Error('Falta VITE_API_URL para conectar el frontend con el backend.');
}

export const API_URL = (configurada || '/api').replace(/\/+$/, '');