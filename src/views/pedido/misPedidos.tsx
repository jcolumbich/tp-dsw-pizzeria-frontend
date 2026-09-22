import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Pedido } from '../../interfaces/pedido';
import { getPedidos } from '../../services/pedidoService';

type FiltroPedido = 'Activos' | 'Cancelados' | 'Todos';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtro, setFiltro] = useState<FiltroPedido>('Activos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setCargando(true);
        const data = await getPedidos();
        const pedidosOrdenados = [...data].sort((a, b) => new Date(b.dia).getTime() - new Date(a.dia).getTime());
        setPedidos(pedidosOrdenados);
        setError(null);
      } catch (err) {
        setError('No se pudieron cargar tus pedidos.');
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    void cargarPedidos();
  }, []);

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtro === 'Activos') return pedido.estado !== 'Cancelado';
    if (filtro === 'Cancelados') return pedido.estado === 'Cancelado';
    return true;
  });

  const pedidosPorDia = pedidosFiltrados.reduce<Record<string, Pedido[]>>((grupos, pedido) => {
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

  if (cargando) return <p>Cargando tus pedidos...</p>;

  if (error) {
    return <div className="error-message">⚠️ {error}</div>;
  }

  return (
    <div className="ingredientes-container">
      <div className="header-actions">
        <h2>Mis pedidos</h2>
        <Link to="/pedidos/nuevo" className="btn-submit">Nuevo pedido</Link>
      </div>

      <div className="filtros-pedidos">
        <button
          type="button"
          className={`filtro-pedido-btn ${filtro === 'Activos' ? 'activo' : ''}`}
          onClick={() => setFiltro('Activos')}
        >
          Activos
        </button>

        <button
          type="button"
          className={`filtro-pedido-btn ${filtro === 'Cancelados' ? 'activo' : ''}`}
          onClick={() => setFiltro('Cancelados')}
        >
          Cancelados
        </button>

        <button
          type="button"
          className={`filtro-pedido-btn ${filtro === 'Todos' ? 'activo' : ''}`}
          onClick={() => setFiltro('Todos')}
        >
          Todos
        </button>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="crear-ingrediente-form">
          {filtro === 'Activos' && <p>No tenés pedidos activos.</p>}
          {filtro === 'Cancelados' && <p>No tenés pedidos cancelados.</p>}
          {filtro === 'Todos' && <p>Todavía no realizaste ningún pedido.</p>}

          {filtro !== 'Cancelados' && (
            <Link to="/pedidos/nuevo" className="btn-submit">Realizar pedido</Link>
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
                    <th>Estado</th>
                    <th>Entrega</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosDelDia.map((pedido) => (
                    <tr key={pedido.id} className={pedido.estado === 'Cancelado' ? 'pedido-cancelado' : ''}>
                      <td>#{pedido.id}</td>
                      <td>{new Date(pedido.dia).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <span className={`badge-estado estado-${pedido.estado.toLowerCase().replaceAll(' ', '-')}`}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td>{pedido.retiro ? 'Retiro en el local' : 'Envío a domicilio'}</td>
                      <td>${pedido.total.toFixed(2)}</td>
                      <td>
                        <Link to={`/mis-pedidos/${pedido.id}`} className="nav-link">Ver detalle</Link>
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