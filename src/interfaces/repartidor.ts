export interface Repartidor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  contrasenia: string;
  nivel_permisos: number;
  estado: boolean;
  matricula: string;
  monto_propina_total: number;
}

export type NuevoRepartidor = Omit<Repartidor, 'id'>;
export type ActualizarRepartidor = Partial<NuevoRepartidor>;