export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  contrasenia: string;
  nivel_permisos: number;
  estado: boolean;
  domicilio: string;
}

export type NuevoCliente = Omit<Cliente, 'id'>;
export type ActualizarCliente = Partial<NuevoCliente>;