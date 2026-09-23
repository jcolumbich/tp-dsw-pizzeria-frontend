export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  nivel_permisos: number;
  estado: boolean;
  domicilio: string;
}

export type NuevoCliente = Omit<Cliente, 'id'> & {
  contrasenia: string;
};

export type ActualizarCliente = Partial<
  Omit<NuevoCliente, 'nivel_permisos'>
>;