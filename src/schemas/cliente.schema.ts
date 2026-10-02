import { z } from 'zod';

export const crearClienteSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre admite hasta 100 caracteres'),
  apellido: z.string().trim().min(1, 'El apellido es requerido').max(100, 'El apellido admite hasta 100 caracteres'),
  email: z.string().trim().toLowerCase().max(254, 'El email admite hasta 254 caracteres').pipe(z.email('El formato del email no es válido')),
  contrasenia: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128, 'La contraseña admite hasta 128 caracteres').refine(
    (valor) => valor.trim().length > 0,
    { message: 'La contraseña no puede contener solamente espacios' }
  ),
  nivel_permisos: z.literal(0),
  estado: z.literal(true),
  domicilio: z.string().trim().min(1, 'El domicilio es requerido').max(255, 'El domicilio admite hasta 255 caracteres'),
});

export const editarClienteSchema = crearClienteSchema.pick({
  nombre: true,
  apellido: true,
  domicilio: true,
}).extend({
  estado: z.boolean(),
});