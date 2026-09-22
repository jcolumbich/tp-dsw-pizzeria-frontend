import type { Ingrediente } from './ingrediente';

export interface IngredientePizza {
  pizza: { id: number };
  ingrediente: Ingrediente;
  cantidad: number;
}

export interface NuevoIngredientePizza {
  pizzaId: number;
  ingredienteId: number;
  cantidad: number;
}