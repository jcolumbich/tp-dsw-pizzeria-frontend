import type { Pedido, DetallePedidoItem } from '../interfaces/pedido';
export function obtenerPropinaPedido(pedido: Pedido): number {
  return pedido.retiro ? 0 : pedido.envio?.monto_propina ?? pedido.monto_propina ?? 0;
}
export function calcularTotalPedido(pedido: Pedido): number {
  const costoEnvio = pedido.retiro ? 0 : pedido.costo_envio ?? pedido.envio?.costo ?? 0;
  return (Math.round(pedido.total * 100) + Math.round(obtenerPropinaPedido(pedido) * 100) + Math.round(costoEnvio * 100)) / 100;
}
export function subtotalDetalle(detalle: DetallePedidoItem): number | null {
  return detalle.precio_unitario == null ? null : Math.round(detalle.precio_unitario * 100) * detalle.cantidad / 100;
}
export function formatearPrecioHistorico(valor: number | null | undefined): string {
  return valor == null ? 'No registrado' : formatearPrecio(valor);
}
export function formatearPrecio(valor: number): string {
  return `$${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(valor)}`;
}