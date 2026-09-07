import { useState, useEffect } from "react";
import type { Pedido } from "../types";
import { obtenerPedidos } from "../services/pedidosService";

function ListaPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    obtenerPedidos().then(setPedidos);
  }, []);

  return (
    <div>
      <h1>Pedidos</h1>
      <ul>
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            Pedido #{pedido.id} — Cliente #{pedido.cliente} — Total: ${pedido.total} — Estado: {pedido.estado}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaPedidos;