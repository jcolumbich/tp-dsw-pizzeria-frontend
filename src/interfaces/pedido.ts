import type { Pizza } from './pizza';
import type { Cliente } from './cliente';
import type { Repartidor } from './repartidor';
export interface ItemPedido {
  pizzaId: number;
  cantidad: number;
}
export interface NuevoPedido {
  retiro: boolean;
  medio_pago?: 'efectivo' | 'mercadopago';
  costo_envio?: number;
  checkout_id?: string;
  monto_propina?: number;
  clienteId: number;
  items: ItemPedido[];
}
export interface DetallePedidoItem {
  pizza: Pizza;
  cantidad: number;
  precio_unitario?: number | null;
}
export interface EnvioPedido {
  id: number;
  costo: number;
  monto_propina: number;
}
export interface Pedido {
  checkoutUrl?: string;
  vence_pago?: string;
  id: number;
  dia: string;
  total: number;
  monto_propina?: number;
  retiro: boolean;
  medio_pago?: 'efectivo' | 'mercadopago';
  costo_envio?: number;
  checkout_id?: string;
  estado: string;
  detalles: DetallePedidoItem[];
  cliente?: Cliente;
  repartidor?: Repartidor;
  envio?: EnvioPedido;
}
export const ESTADOS_PEDIDO = ['Esperando pago', 'Pendiente', 'En preparación', 'En camino', 'Entregado', 'Cancelado'] as const;
export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];