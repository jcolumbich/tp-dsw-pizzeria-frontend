export interface Repartidor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  nivel_permisos: number;
  estado: boolean;
  matricula: string;
  monto_propina_total: number;
}

export type NuevoRepartidor = Omit<Repartidor, 'id'> & {
  contrasenia: string;
};

export type ActualizarRepartidor = Partial<
  Omit<NuevoRepartidor, 'nivel_permisos' | 'monto_propina_total'>
>;