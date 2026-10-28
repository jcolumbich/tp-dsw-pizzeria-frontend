export interface Pizza {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  vegetariana: boolean;
  disponible: boolean;
  imagen?: string | null;
}

export type NuevaPizza = Omit<Pizza, 'id' | 'imagen'>;
export type ActualizarPizza = Partial<NuevaPizza>;