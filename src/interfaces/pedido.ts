import type { Pizza } from './pizza';
import type { Cliente } from './cliente';
import type { Repartidor } from './repartidor';

export interface ItemPedido {
  pizzaId: number;
  cantidad: number;
}

export interface NuevoPedido {
  retiro: boolean;
  monto_propina?: number;
  clienteId: number;
  items: ItemPedido[];
}

export interface DetallePedidoItem {
  pizza: Pizza;
  cantidad: number;
}

export interface EnvioPedido {
  id: number;
  costo: number;
  monto_propina: number;
}

export interface Pedido {
  id: number;
  dia: string;
  total: number;
  monto_propina?: number;
  retiro: boolean;
  estado: string;
  detalles: DetallePedidoItem[];
  cliente?: Cliente;
  repartidor?: Repartidor;
  envio?: EnvioPedido;
}

export const ESTADOS_PEDIDO = ['Pendiente', 'En preparación', 'En camino', 'Entregado', 'Cancelado'] as const;
export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];