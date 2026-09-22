import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Pedido } from '../../interfaces/pedido';
import { ESTADOS_PEDIDO } from '../../interfaces/pedido';
import { getPedidos } from '../../services/pedidoService';

export default function PedidoList() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('Activos');

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setCargando(true);

        const estadoBackend = filtroEstado !== 'Activos' && filtroEstado !== '' ? filtroEstado : undefined;
        const data = await getPedidos(estadoBackend);

        const pedidosFiltrados = filtroEstado === 'Activos'
          ? data.filter((pedido) => pedido.estado !== 'Cancelado')
          : data;

        const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => new Date(b.dia).getTime() - new Date(a.dia).getTime());

        setPedidos(pedidosOrdenados);
        setError(null);
      } catch (err) {
        setError('No se pudo conectar con el servidor para obtener los pedidos.');
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    void cargarPedidos();
  }, [filtroEstado]);

  const calcularTotalItems = (pedido: Pedido) => {
    return pedido.detalles.reduce((acc, detalle) => acc + detalle.cantidad, 0);
  };

  const pedidosPorDia = pedidos.reduce<Record<string, Pedido[]>>((grupos, pedido) => {
    const fecha = new Date(pedido.dia).toLocaleDateString('es-AR');
    if (!grupos[fecha]) grupos[fecha] = [];
    grupos[fecha].push(pedido);
    return grupos;
  }, {});

  const obtenerTituloFecha = (fecha: string) => {
    const hoy = new Date().toLocaleDateString('es-AR');
    const ayerFecha = new Date();
    ayerFecha.setDate(ayerFecha.getDate() - 1);
    const ayer = ayerFecha.toLocaleDateString('es-AR');

    if (fecha === hoy) return `Hoy — ${fecha}`;
    if (fecha === ayer) return `Ayer — ${fecha}`;
    return fecha;
  };

  return (
    <div className="ingredientes-container">
      <h2>Pedidos</h2>

      <div className="form-group filtro-container">
        <label>Filtrar por estado:</label>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="form-input"
        >
          <option value="Activos">Activos (sin cancelados)</option>
          <option value="">Todos los estados</option>

          {ESTADOS_PEDIDO.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {cargando ? (
        <p>Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <div className="crear-ingrediente-form">
          {filtroEstado === 'Activos' ? (
            <p>No hay pedidos activos.</p>
          ) : filtroEstado ? (
            <p>No hay pedidos en estado “{filtroEstado}”.</p>
          ) : (
            <p>No hay pedidos registrados.</p>
          )}
        </div>
      ) : (
        <div className="pedidos-por-dia">
          {Object.entries(pedidosPorDia).map(([fecha, pedidosDelDia]) => (
            <section key={fecha} className="grupo-pedidos">
              <h3 className="grupo-pedidos-fecha">{obtenerTituloFecha(fecha)}</h3>

              <table className="ingredientes-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Hora</th>
                    <th>Cliente</th>
                    <th>Ítems</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosDelDia.map((pedido) => (
                    <tr key={pedido.id} className={pedido.estado === 'Cancelado' ? 'pedido-cancelado' : ''}>
                      <td>#{pedido.id}</td>

                      <td>
                        {new Date(pedido.dia).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td>
                        {pedido.cliente
                          ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}`
                          : 'Sin cliente'}
                      </td>

                      <td>{calcularTotalItems(pedido)}</td>

                      <td>${pedido.total.toFixed(2)}</td>

                      <td>
                        <span className={`badge-estado estado-${pedido.estado.toLowerCase().replaceAll(' ', '-')}`}>
                          {pedido.estado}
                        </span>
                      </td>

                      <td>
                        <Link to={`/pedidos/${pedido.id}`} className="nav-link">
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}