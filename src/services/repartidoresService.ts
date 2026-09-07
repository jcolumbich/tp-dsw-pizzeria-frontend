import type { Repartidor } from "../types";

const BASE_URL = "http://localhost:3000/api/repartidores";

export async function obtenerRepartidores(): Promise<Repartidor[]> {
  const response = await fetch(BASE_URL);
  const json = await response.json();
  return json.data;
}