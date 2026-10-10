import { z } from 'zod';
import { importeSchema } from './numero.schema';
export const crearPizzaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre admite hasta 100 caracteres'),
  precio: importeSchema,
  vegetariana: z.boolean(),
  disponible: z.boolean(),
});