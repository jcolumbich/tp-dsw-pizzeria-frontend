export interface Pizza {
  id: number;
  nombre: string;
  precio: number;
  vegetariana: boolean;
  disponible: boolean;
}

export type NuevaPizza = Omit<Pizza, 'id'>;
export type ActualizarPizza = Partial<NuevaPizza>;