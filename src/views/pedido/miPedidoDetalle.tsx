import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Pedido } from '../../interfaces/pedido';
import { getPedidoById } from '../../services/pedidoService';

export default function MiPedidoDetalle() {
  const { id } = useParams<{ id: string }>();
  const pedidoId = Number(id);

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarPedido();
  }, [pedidoId]);

  const cargarPedido = async () => {
    try {
      setCargando(true);
      const data = await getPedidoById(pedidoId);
      setPedido(data);
      setError(null);
    } catch (err) {
      setError('No se pudo cargar el pedido.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <p>Cargando pedido...</p>;

  if (error || !pedido) {
    return <div className="error-message">⚠️ {error ?? 'Pedido no encontrado.'}</div>;
  }

  return (
    <div className="ingredientes-container">
      <Link to="/mis-pedidos" className="nav-link">← Volver a Mis pedidos</Link>

      <h2>Pedido #{pedido.id}</h2>

      <div className="crear-ingrediente-form">
        <h3>Datos generales</h3>
        <p><strong>Fecha:</strong> {new Date(pedido.dia).toLocaleString()}</p>
        <p><strong>Estado:</strong> {pedido.estado}</p>
        <p><strong>Entrega:</strong> {pedido.retiro ? 'Retiro en el local' : 'Envío a domicilio'}</p>
        <p><strong>Total:</strong> ${pedido.total.toFixed(2)}</p>
      </div>

      {!pedido.retiro && (
        <div className="crear-ingrediente-form">
          <h3>Envío</h3>

          {pedido.envio ? (
            <>
              <p><strong>Costo del envío:</strong> ${pedido.envio.costo.toFixed(2)}</p>

              {pedido.repartidor && (
                <p><strong>Repartidor:</strong> {pedido.repartidor.nombre} {pedido.repartidor.apellido}</p>
              )}
            </>
          ) : (
            <p>El envío todavía no fue asignado.</p>
          )}
        </div>
      )}

      <h3>Productos</h3>

      <table className="ingredientes-table">
        <thead>
          <tr>
            <th>Pizza</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.detalles.map((detalle) => (
            <tr key={detalle.pizza.id}>
              <td>{detalle.pizza.nombre}</td>
              <td>{detalle.cantidad}</td>
              <td>${detalle.pizza.precio.toFixed(2)}</td>
              <td>${(detalle.cantidad * detalle.pizza.precio).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {pedido.estado === 'Cancelado' && (
        <div className="error-message">
          Este pedido fue cancelado y se conserva como registro histórico.
        </div>
      )}
    </div>
  );
}