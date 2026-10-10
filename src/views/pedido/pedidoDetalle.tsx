import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Pedido } from '../../interfaces/pedido';
import type { Repartidor } from '../../interfaces/repartidor';
import { actualizarEstadoPedido, asignarEnvio, getPedidoById } from '../../services/pedidoService';
import { getRepartidores } from '../../services/repartidorService';
import { asignarEnvioSchema } from '../../schemas/pedido.schema';
import { calcularTotalPedido, formatearPrecio, obtenerPropinaPedido } from '../../utils/formato';

export default function PedidoDetalle() {
  const { id } = useParams<{ id: string }>();
  const pedidoId = Number(id);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [repartidorId, setRepartidorId] = useState<number | ''>('');
  const [costo, setCosto] = useState('0');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setCargando(true);
      setError(null);
      setPedido(null);

      try {
        if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
          throw new Error('El ID del pedido debe ser un entero positivo válido.');
        }

        const [datos, lista] = await Promise.all([
          getPedidoById(pedidoId),
          getRepartidores().catch(() => []),
        ]);

        if (activo) {
          setPedido(datos);
          setRepartidores(lista.filter((r) => r.estado));
          setRepartidorId('');
          setCosto('0');
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el pedido.');
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    void cargar();
    return () => { activo = false; };
  }, [pedidoId]);

  const cambiarEstado = async (estado: 'En preparación' | 'Cancelado' | 'Entregado') => {
    if (!pedido || guardando) return;
    if (estado === 'Cancelado' && !window.confirm('¿Cancelar este pedido? Se repondrá su stock.')) return;
    if (estado === 'Entregado' && !window.confirm('¿Confirmás que este pedido ya fue entregado al cliente?')) return;

    try {
      setGuardando(true);
      setError(null);
      setPedido(await actualizarEstadoPedido(pedido.id, estado));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el pedido.');
    } finally {
      setGuardando(false);
    }
  };

  const guardarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pedido || guardando) return;
    setError(null);

    const resultado = asignarEnvioSchema.safeParse({
      repartidorId: repartidorId === '' ? undefined : repartidorId,
      costo: costo.trim() === '' ? undefined : Number(costo),
    });

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message ?? 'Revisá los datos del envío');
      return;
    }

    try {
      setGuardando(true);
      const datos = resultado.data;
      setPedido(await asignarEnvio(pedido.id, datos.repartidorId, datos.costo));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo asignar el envío.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <p>Cargando pedido...</p>;
  if (!pedido) return <div className="error-message">⚠️ {error ?? 'Pedido no encontrado.'}</div>;

  return (
    <div className="ingredientes-container">
      <Link to="/pedidos" className="nav-link">← Volver a Pedidos</Link>
      <h2>Pedido #{pedido.id}</h2>

      {error && <div className="error-message" role="alert">⚠️ {error}</div>}
      {pedido.estado === 'Cancelado' && (
        <div className="error-message">
          Pedido dado de baja. Se conserva como registro histórico.
        </div>
      )}

      <div className="crear-ingrediente-form">
        <h3>Datos generales</h3>
        <p><strong>Fecha:</strong> {new Date(pedido.dia).toLocaleString('es-AR')}</p>
        <p>
          <strong>Cliente:</strong>{' '}
          {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : 'Sin cliente'}
        </p>
        <p><strong>Entrega:</strong> {pedido.retiro ? 'Retiro en el local' : 'Envío a domicilio'}</p>
        <p><strong>Estado:</strong> {pedido.estado}</p>
        <p><strong>Pizzas:</strong> {formatearPrecio(pedido.total)}</p>
        {!pedido.retiro && <p><strong>Propina:</strong> {formatearPrecio(obtenerPropinaPedido(pedido))}</p>}
        <p>
          <strong>{!pedido.retiro && !pedido.envio ? 'Total sin envío:' : 'Total:'}</strong>{' '}
          {formatearPrecio(calcularTotalPedido(pedido))}
        </p>

        {pedido.estado === 'Pendiente' && (
          <button
            type="button"
            className="btn-submit"
            disabled={guardando}
            onClick={() => void cambiarEstado('En preparación')}
          >
            Confirmar pedido
          </button>
        )}

        {((pedido.retiro && pedido.estado === 'En preparación') ||
          (!pedido.retiro && pedido.estado === 'En camino' && pedido.envio && pedido.repartidor)) && (
          <button
            type="button"
            className="btn-submit"
            disabled={guardando}
            onClick={() => void cambiarEstado('Entregado')}
          >
            {guardando ? 'Guardando...' : 'Marcar como entregado'}
          </button>
        )}

        {pedido.estado !== 'Cancelado' && pedido.estado !== 'Entregado' && (
          <button
            type="button"
            className="btn-submit btn-eliminar"
            disabled={guardando}
            onClick={() => void cambiarEstado('Cancelado')}
          >
            Cancelar pedido
          </button>
        )}
      </div>

      {!pedido.retiro && (
        <div className="crear-ingrediente-form">
          <h3>Envío</h3>

          {pedido.envio && pedido.repartidor ? (
            <p>
              {pedido.repartidor.nombre} {pedido.repartidor.apellido}
              {' '}— Costo: ${pedido.envio.costo.toFixed(2)}
            </p>
          ) : pedido.estado === 'En preparación' ? (
            <form className="form" onSubmit={(e) => void guardarEnvio(e)} noValidate>
              <div className="form-group">
                <label htmlFor="repartidor-pedido">Repartidor</label>
                <select
                  id="repartidor-pedido"
                  className="form-input"
                  value={repartidorId}
                  onChange={(e) => setRepartidorId(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={guardando}
                  required
                >
                  <option value="">Seleccioná un repartidor</option>
                  {repartidores.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} {r.apellido} — {r.matricula}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-small">
                <label htmlFor="costo-pedido">Costo del envío</label>
                <input
                  id="costo-pedido"
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                  disabled={guardando}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  className="btn-submit"
                  type="submit"
                  disabled={guardando || repartidores.length === 0}
                >
                  Asignar envío
                </button>
              </div>

              {repartidores.length === 0 && <p>No hay repartidores disponibles.</p>}
            </form>
          ) : (
            <p>
              {pedido.estado === 'Pendiente'
                ? 'Confirmá el pedido antes de asignar un envío.'
                : 'No hay envío asignado.'}
            </p>
          )}
        </div>
      )}

      <h3>Ítems del pedido</h3>
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
    </div>
  );
}