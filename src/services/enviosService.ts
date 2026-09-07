import type { Envio } from "../types";

const BASE_URL = "http://localhost:3000/api/envios";

export async function crearEnvio(
  pedido: number,
  costo: number,
  monto_propina: number
): Promise<Envio> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pedidoId: pedido, costo, monto_propina }),
  });
  const json = await response.json();
  return json.data;
}