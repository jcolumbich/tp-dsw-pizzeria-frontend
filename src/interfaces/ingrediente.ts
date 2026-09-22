export interface Ingrediente {
  id: number;
  nombre: string;
  stock: number;
}

export type NuevoIngrediente = Omit<Ingrediente, 'id'>;
export type ActualizarIngrediente = Partial<NuevoIngrediente>;