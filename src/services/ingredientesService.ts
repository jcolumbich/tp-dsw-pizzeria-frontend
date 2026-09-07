import type { Ingrediente } from "../types";

const BASE_URL = "http://localhost:3000/api/ingredientes";

export async function obtenerIngredientes(): Promise<Ingrediente[]> {
  const response = await fetch(BASE_URL);
  const json = await response.json();
  return json.data;
}


