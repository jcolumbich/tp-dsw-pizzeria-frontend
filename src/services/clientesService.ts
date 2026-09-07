import type { Cliente } from "../types";

const BASE_URL = "http://localhost:3000/api/clientes";

export async function obtenerClientes(): Promise<Cliente[]> {
  const response = await fetch(BASE_URL);
  const json = await response.json();
  return json.data;
}