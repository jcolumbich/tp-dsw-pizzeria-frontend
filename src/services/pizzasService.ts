import type { Pizza } from "../types";

const BASE_URL = "http://localhost:3000/api/pizzas";

export async function obtenerPizzas(): Promise<Pizza[]> {
  const response = await fetch(BASE_URL);
  const json = await response.json();
  return json.data;
}

export async function obtenerPizzaPorId(id: number): Promise<Pizza> {
  const response = await fetch(`http://localhost:3000/api/pizzas/${id}`);
  const json = await response.json();
  return json.data;
}