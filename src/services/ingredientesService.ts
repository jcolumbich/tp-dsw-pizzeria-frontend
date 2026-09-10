import type { Ingrediente } from "../types";

const BASE_URL = "http://localhost:3000/api/ingredientes";

export async function obtenerIngredientes(): Promise<Ingrediente[]> {
  const response = await fetch(BASE_URL);
  const json = await response.json();
  return json.data;
}


export async function obtenerIngredientePorId(id: number): Promise<Ingrediente> {
  const response = await fetch(`http://localhost:3000/api/ingredientes/${id}`);
  const json = await response.json();
  return json.data;
}

export async function crearIngrediente(nombre: string, stock: number): Promise<Ingrediente> {
  const response = await fetch("http://localhost:3000/api/ingredientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, stock }),
  });
  const json = await response.json();
  return json.data;
}