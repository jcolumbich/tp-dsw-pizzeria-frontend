import {
  errorRespuesta,
  fetchAutenticado,
  getAuthHeaders,
} from './httpCliente';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
).replace(/\/$/, '');

export interface EstadoPago {
  estado: string;
  importe: number | null;
  puedePagar: boolean;
  estadoPedido: string;
  medioPago: 'efectivo' | 'mercadopago' | null;
  retiro: boolean;
}

async function solicitar<T>(
  ruta: string,
  body?: unknown,
): Promise<T> {
  const response = await fetchAutenticado(
    `${API_URL}/pagos${ruta}`,
    {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw await errorRespuesta(
      response,
      'No se pudo consultar el pago',
    );
  }

  const resultado: { data: T } = await response.json();

  return resultado.data;
}

export function obtenerEstadoPago(pedidoId: number) {
  return solicitar<EstadoPago>(`/pedido/${pedidoId}`);
}

export function verificarPago(
  pedidoId: number,
  paymentId: string,
) {
  return solicitar<EstadoPago>(
    `/pedido/${pedidoId}/verificar`,
    { paymentId },
  );
}