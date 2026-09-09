import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Pedido } from "../types";
import { obtenerPedidos } from "../services/pedidosService";
import "./Listas.css";

function ListaPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    obtenerPedidos().then(setPedidos);
  }, []);

  return (
    <div className="contenedor-pagina">
      <h1>Pedidos</h1>
      <ul className="lista-items">
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            <Link to={`/pedidos/${pedido.id}`}>
              Pedido #{pedido.id} — Cliente #{pedido.cliente} — Total: ${pedido.total} — Estado: {pedido.estado}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaPedidos;