import type { Pedido } from "../types";

const BASE_URL = "http://localhost:3000/api/pedidos";

export async function obtenerPedidos(): Promise<Pedido[]> {
  const response = await fetch(BASE_URL);
  const json = await response.json();
  return json.data;
}

interface ItemPedidoInput {
  pizzaId: number;
  cantidad: number;
}

export async function crearPedido(
  clienteId: number,
  items: ItemPedidoInput[]
): Promise<Pedido> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clienteId, retiro: false, items }),
  });
  const json = await response.json();
  return json.data;
}