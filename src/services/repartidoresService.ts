import type { Repartidor } from "../types";

const BASE_URL = "http://localhost:3000/api/repartidores";

export async function obtenerRepartidores(): Promise<Repartidor[]> {
  const response = await fetch(BASE_URL);
  const json = await response.json();
  return json.data;
}

export async function obtenerRepartidorPorId(id: number): Promise<Repartidor> {
  const response = await fetch(`http://localhost:3000/api/repartidores/${id}`);
  const json = await response.json();
  return json.data;
}
export async function crearRepartidor(
  nombre: string,
  apellido: string,
  matricula: string
): Promise<Repartidor> {
  const response = await fetch("http://localhost:3000/api/repartidores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, apellido, matricula }),
  });
  const json = await response.json();
  return json.data;
}