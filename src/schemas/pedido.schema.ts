import { z } from 'zod';

const idSchema = z.number().int().positive('Debe seleccionar un registro válido').max(Number.MAX_SAFE_INTEGER);

export const crearPedidoSchema = z.object({
  retiro: z.boolean(),
  clienteId: idSchema,
  items: z.array(z.object({
    pizzaId: idSchema,
    cantidad: z.number().int().positive('La cantidad debe ser un entero positivo').max(100, 'La cantidad máxima por pizza es 100'),
  })).min(1, 'Agregá al menos una pizza al pedido').max(50, 'El pedido admite hasta 50 ítems').refine(
    (items) => new Set(items.map((item) => item.pizzaId)).size === items.length,
    { message: 'No puede repetir una pizza: indique su cantidad en un único ítem' }
  ),
});

export const asignarEnvioSchema = z.object({
  repartidorId: idSchema,
  costo: z.number().min(0, 'El costo del envío debe ser mayor o igual a 0'),
});