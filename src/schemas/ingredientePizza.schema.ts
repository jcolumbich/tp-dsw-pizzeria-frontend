import { z } from 'zod';

const idSchema = z.number().int().positive('Debe seleccionar un registro válido').max(Number.MAX_SAFE_INTEGER);

export const ingredientePizzaSchema = z.object({
  pizzaId: idSchema,
  ingredienteId: idSchema,
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
});