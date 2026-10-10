import { describe, expect, it } from 'vitest';
import { calcularTotalPedido, formatearPrecioHistorico, subtotalDetalle } from './formato';
import type { Pedido, DetallePedidoItem } from '../interfaces/pedido';
import { importeSchema, stockSchema } from '../schemas/numero.schema';
describe('importes históricos y decimales', () => {
  it('el subtotal utiliza el precio del detalle aunque cambie el precio actual', () => {
    const detalle: DetallePedidoItem = { cantidad: 3, precio_unitario: 0.1, pizza: { id: 1, nombre: 'Prueba', precio: 99, disponible: true, vegetariana: true } };
    expect(subtotalDetalle(detalle)).toBe(0.3);
  });
  it('no inventa el precio de un pedido anterior', () => {
    const detalle: DetallePedidoItem = { cantidad: 3, precio_unitario: null, pizza: { id: 1, nombre: 'Prueba', precio: 99, disponible: true, vegetariana: true } };
    expect(subtotalDetalle(detalle)).toBeNull();
    expect(formatearPrecioHistorico(null)).toBe('No registrado');
  });
  it('suma pizzas, propina y envío sin residuos de punto flotante', () => {
    const pedido: Pedido = { id: 1, dia: '2026-10-10', estado: 'En camino', retiro: false, detalles: [], total: 0.1, monto_propina: 0.2, envio: { id: 1, costo: 0.3, monto_propina: 0.2 } };
    expect(calcularTotalPedido(pedido)).toBe(0.6);
  });
  it('la validación admite la misma precisión que el backend', () => {
    expect(importeSchema.safeParse(1.001).success).toBe(false);
    expect(stockSchema.safeParse(0.1234).success).toBe(true);
    expect(stockSchema.safeParse(0.12345).success).toBe(false);
  });
});