import { z } from 'zod';

export const crearPizzaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre admite hasta 100 caracteres'),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  vegetariana: z.boolean(),
  disponible: z.boolean(),
});