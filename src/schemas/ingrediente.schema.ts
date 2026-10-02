import { z } from 'zod';

export const crearIngredienteSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre admite hasta 100 caracteres'),
  stock: z.number().min(0, 'El stock debe ser un número mayor o igual a 0'),
});