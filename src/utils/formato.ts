import type { Pedido } from '../interfaces/pedido';

export function obtenerPropinaPedido(pedido: Pedido): number {
  return pedido.retiro ? 0 : pedido.envio?.monto_propina ?? pedido.monto_propina ?? 0;
}

export function calcularTotalPedido(pedido: Pedido): number {
  const costoEnvio = pedido.retiro ? 0 : pedido.envio?.costo ?? 0;
  return pedido.total + obtenerPropinaPedido(pedido) + costoEnvio;
}

export function formatearPrecio(valor: number): string {
  return `$${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(valor)}`;
}