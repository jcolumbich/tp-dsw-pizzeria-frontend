import type { Cliente } from "../types";

const BASE_URL = "http://localhost:3000/api/clientes";

export async function obtenerClientes(): Promise<Cliente[]> {
  const response = await fetch(BASE_URL);
  const json = await response.json();
  return json.data;
}
export async function obtenerClientePorId(id: number): Promise<Cliente> {
  const response = await fetch(`http://localhost:3000/api/clientes/${id}`);
  const json = await response.json();
  return json.data;
}

export async function crearCliente(
  nombre: string,
  apellido: string,
  domicilio: string
): Promise<Cliente> {
  const response = await fetch("http://localhost:3000/api/clientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, apellido, domicilio }),
  });
  const json = await response.json();
  return json.data;
}