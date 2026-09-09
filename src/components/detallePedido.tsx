import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { PedidoDetalle } from "../types";
import { obtenerPedidoPorId } from "../services/pedidosService";
import "./Listas.css";

function DetallePedido() {
  const { id } = useParams();
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);

  useEffect(() => {
    obtenerPedidoPorId(Number(id)).then(setPedido);
  }, [id]);

  if (!pedido) {
    return <p className="contenedor-pagina">Cargando...</p>;
  }

  return (
    <div className="contenedor-pagina">
      <Link to="/pedidos">← Volver a Pedidos</Link>
      <h1>Pedido #{pedido.id}</h1>
      <p>Cliente: {pedido.cliente.nombre}</p>
      <p>Estado: {pedido.estado}</p>
      <p>Total: ${pedido.total}</p>

      <h2>Items</h2>
      <ul className="lista-items">
        {pedido.detalles.map((item, index) => (
          <li key={index}>
            {item.pizza.nombre} — Cantidad: {item.cantidad} — Subtotal: $
            {item.pizza.precio * item.cantidad}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DetallePedido;