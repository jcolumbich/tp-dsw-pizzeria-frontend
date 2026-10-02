import { z } from 'zod';

export const crearRepartidorSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre admite hasta 100 caracteres'),
  apellido: z.string().trim().min(1, 'El apellido es requerido').max(100, 'El apellido admite hasta 100 caracteres'),
  email: z.string().trim().toLowerCase().max(254, 'El email admite hasta 254 caracteres').pipe(z.email('El formato del email no es válido')),
  contrasenia: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128, 'La contraseña admite hasta 128 caracteres').refine(
    (valor) => valor.trim().length > 0,
    { message: 'La contraseña no puede contener solamente espacios' }
  ),
  nivel_permisos: z.literal(1),
  estado: z.literal(true),
  matricula: z.string().trim().toUpperCase().min(1, 'La matrícula es requerida').max(50, 'La matrícula admite hasta 50 caracteres'),
  monto_propina_total: z.literal(0),
});

export const editarRepartidorSchema = crearRepartidorSchema.pick({
  nombre: true,
  apellido: true,
  matricula: true,
}).extend({
  estado: z.boolean(),
});