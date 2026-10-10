import { z } from 'zod';
import { stockSchema } from './numero.schema';
export const crearIngredienteSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre admite hasta 100 caracteres'),
  stock: stockSchema,
});