import { z } from 'zod';

const idSchema = z.number().int().positive('Debe seleccionar un registro válido').max(Number.MAX_SAFE_INTEGER);

export const crearPedidoSchema = z.object({
  retiro: z.boolean(),
  monto_propina: z.number().min(0, 'La propina debe ser mayor o igual a 0').multipleOf(0.01, 'La propina admite hasta dos decimales').default(0),
  clienteId: idSchema,
  items: z.array(z.object({
    pizzaId: idSchema,
    cantidad: z.number().int().positive('La cantidad debe ser un entero positivo').max(100, 'La cantidad máxima por pizza es 100'),
  })).min(1, 'Agregá al menos una pizza al pedido').max(50, 'El pedido admite hasta 50 ítems').refine(
    (items) => new Set(items.map((item) => item.pizzaId)).size === items.length,
    { message: 'No puede repetir una pizza: indique su cantidad en un único ítem' }
  ),
}).refine((datos) => !datos.retiro || datos.monto_propina === 0, {
  message: 'La propina para el repartidor solo está disponible en pedidos con envío',
  path: ['monto_propina'],
});

export const asignarEnvioSchema = z.object({
  repartidorId: idSchema,
  costo: z.number().min(0, 'El costo del envío debe ser mayor o igual a 0'),
});