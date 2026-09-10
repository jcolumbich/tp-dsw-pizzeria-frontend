import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { PedidoDetalle } from "../types";
import { obtenerPedidoPorId } from "../services/pedidosService";
import "./Listas.css";
import "./Detalles.css";

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
      <Link to="/pedidos" className="detalle-volver">← Volver a Pedidos</Link>
      <h1>Pedido #{pedido.id}</h1>
      <div className="detalle-card">
        <dl className="detalle-datos">
          <div className="detalle-fila">
            <dt>Cliente</dt>
            <dd>{pedido.cliente.nombre}</dd>
          </div>
          <div className="detalle-fila">
            <dt>Estado</dt>
            <dd>
              <span className="detalle-badge">{pedido.estado}</span>
            </dd>
          </div>
          <div className="detalle-fila detalle-fila--total">
            <dt>Total</dt>
            <dd>${pedido.total}</dd>
          </div>
        </dl>
      </div>

      <h2 className="detalle-seccion-titulo">Items</h2>
      <ul className="detalle-items">
        {pedido.detalles.map((item, index) => (
          <li key={index} className="detalle-item">
            <span className="detalle-item-nombre">{item.pizza.nombre}</span>
            <span className="detalle-item-datos">
              <span>
                Cantidad: <strong>{item.cantidad}</strong>
              </span>
              <span>
                Subtotal: <strong>${item.pizza.precio * item.cantidad}</strong>
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DetallePedido;