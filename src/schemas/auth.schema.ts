import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().max(254, 'El email admite hasta 254 caracteres').pipe(
  z.email('El formato del email no es válido')
);

export const loginSchema = z.object({
  email: emailSchema,
  contrasenia: z.string().min(1, 'La contraseña es requerida').max(128, 'La contraseña admite hasta 128 caracteres'),
});

export const registroSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre admite hasta 100 caracteres'),
  apellido: z.string().trim().min(1, 'El apellido es requerido').max(100, 'El apellido admite hasta 100 caracteres'),
  email: emailSchema,
  contrasenia: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(128, 'La contraseña admite hasta 128 caracteres').refine(
    (valor) => valor.trim().length > 0,
    { message: 'La contraseña no puede contener solamente espacios' }
  ),
  confirmarContrasenia: z.string(),
  domicilio: z.string().trim().min(1, 'El domicilio es requerido').max(255, 'El domicilio admite hasta 255 caracteres'),
}).refine(
  (datos) => datos.contrasenia === datos.confirmarContrasenia,
  { message: 'Las contraseñas no coinciden', path: ['confirmarContrasenia'] }
);