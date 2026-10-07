import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Pedido } from '../../interfaces/pedido';
import { getPedidoById } from '../../services/pedidoService';
import { formatearPrecio } from '../../utils/formato';
import AlertaError from '../../components/AlertaError';
import { IconoCancelado, IconoCheck, IconoVolver } from '../../components/iconos';
import { claseEstado, formatearFechaPedido, notaSeguimiento, pasosSeguimiento } from './estadoPedido';
import './crearPedidoForm.css';
import './misPedidos.css';

type EstadoCarga = 'cargando' | 'ok' | 'error' | 'no-encontrado';

export default function MiPedidoDetalle() {
  const { id } = useParams<{ id: string }>();
  const pedidoId = Number(id);

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [estadoCarga, setEstadoCarga] = useState<EstadoCarga>('cargando');

  const cargarPedido = async () => {
    try {
      setEstadoCarga('cargando');
      const data = await getPedidoById(pedidoId);
      setPedido(data);
      setEstadoCarga('ok');
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      setEstadoCarga(status === 404 || status === 403 ? 'no-encontrado' : 'error');
    }
  };

  useEffect(() => {
    const temporizador = setTimeout(() => void cargarPedido(), 0);
    return () => clearTimeout(temporizador);
  }, [pedidoId]);

  if (estadoCarga === 'cargando') {
    return (
      <div className="pedido-nuevo mis-pedidos">
        <main className="pagina pagina--simple">
          <Link className="volver" to="/mis-pedidos">
            <IconoVolver />
            Mis pedidos
          </Link>
          <p className="sr-only" role="status">
            Cargando el pedido…
          </p>
          <div className="encabezado" aria-hidden="true">
            <span className="esqueleto" style={{ width: 240, maxWidth: '70%', height: 40 }}></span>
            <span className="esqueleto esqueleto--linea" style={{ marginTop: 16 }}></span>
          </div>
          <div className="detalle" aria-busy="true" aria-hidden="true">
            <div className="panel panel--cargando detalle__seguimiento">
              <span className="esqueleto esqueleto--titulo"></span>
              <span className="esqueleto esqueleto--linea"></span>
              <span className="esqueleto esqueleto--linea"></span>
              <span className="esqueleto esqueleto--linea"></span>
            </div>
            <div className="panel panel--cargando detalle__items">
              <span className="esqueleto esqueleto--titulo"></span>
              <span className="esqueleto esqueleto--linea" style={{ width: '80%' }}></span>
              <span className="esqueleto esqueleto--linea" style={{ width: '70%' }}></span>
              <span className="esqueleto esqueleto--precio" style={{ alignSelf: 'flex-end' }}></span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (estadoCarga === 'no-encontrado') {
    return (
      <div className="pedido-nuevo mis-pedidos">
        <main className="pagina pagina--simple">
          <Link className="volver" to="/mis-pedidos">
            <IconoVolver />
            Mis pedidos
          </Link>
          <div className="vacio">
            <h1 className="vacio__titulo">No encontramos este pedido</h1>
            <p>Puede que el número no exista o que no sea un pedido tuyo.</p>
            <p className="vacio__accion">
              <Link className="btn btn--primario" to="/mis-pedidos">
                Volver a Mis pedidos
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (estadoCarga === 'error' || !pedido) {
    return (
      <div className="pedido-nuevo mis-pedidos">
        <main className="pagina pagina--simple">
          <Link className="volver" to="/mis-pedidos">
            <IconoVolver />
            Mis pedidos
          </Link>
          <div className="encabezado">
            <h1 className="titulo-pagina">Detalle del pedido</h1>
          </div>
          <AlertaError
            className="alerta--pagina"
            titulo="No pudimos cargar este pedido"
            mensaje="Revisá tu conexión y volvé a intentar."
            accion={
              <button type="button" className="btn btn--secundario btn--s" onClick={() => void cargarPedido()}>
                Reintentar
              </button>
            }
          />
        </main>
      </div>
    );
  }

  const pasos = pasosSeguimiento(pedido.retiro);
  const indiceActual = pasos.indexOf(pedido.estado);

  return (
    <div className="pedido-nuevo mis-pedidos">
      <main className="pagina pagina--simple">
        <Link className="volver" to="/mis-pedidos">
          <IconoVolver />
          Mis pedidos
        </Link>

        <div className="encabezado">
          <div className="encabezado__fila">
            <h1 className="titulo-pagina">Pedido #{pedido.id}</h1>
            <span className={`tag tag--${claseEstado(pedido.estado)}`}>
              <span className="sr-only">Estado: </span>
              {pedido.estado}
            </span>
          </div>
          <ul className="encabezado__meta">
            <li>
              <time dateTime={pedido.dia}>{formatearFechaPedido(pedido.dia)}</time>
            </li>
            <li>{pedido.retiro ? 'Retiro en el local' : 'Envío a domicilio'}</li>
          </ul>
        </div>

        <div className="detalle">
          <section className="panel detalle__seguimiento" aria-labelledby="seguimiento-titulo">
            <h2 className="titulo-seccion panel__titulo" id="seguimiento-titulo">
              Seguimiento
            </h2>

            {pedido.estado === 'Cancelado' ? (
              <div className="estado-cancelado">
                <IconoCancelado />
                <div>
                  <p className="estado-cancelado__titulo">Pedido cancelado</p>
                  <p>Este pedido se canceló y no sigue en curso.</p>
                </div>
              </div>
            ) : (
              <>
                <ol className="seguimiento">
                  {pasos.map((paso, indice) => {
                    const hecho = indiceActual >= 0 && indice < indiceActual;
                    const actual = indice === indiceActual;
                    return (
                      <li
                        key={paso}
                        className={`seguimiento__paso${hecho ? ' seguimiento__paso--hecho' : ''}${actual ? ' seguimiento__paso--actual' : ''}`}
                        aria-current={actual ? 'step' : undefined}
                      >
                        <span className="seguimiento__marca" aria-hidden="true">
                          {hecho && <IconoCheck />}
                        </span>
                        <span className="seguimiento__texto">
                          <span className="seguimiento__nombre">{paso}</span>
                          {actual ? (
                            <span className="seguimiento__detalle">Estado actual</span>
                          ) : (
                            <span className="sr-only">{hecho ? 'Completado' : 'Todavía no'}</span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                <p className="panel__nota">{notaSeguimiento(pedido.estado, pedido.retiro)}</p>
              </>
            )}
          </section>

          <section className="panel detalle__items" aria-labelledby="items-titulo">
            <h2 className="titulo-seccion panel__titulo" id="items-titulo">
              Pizzas
            </h2>
            <ul className="lineas">
              {pedido.detalles.map((detalle) => (
                <li className="linea linea--fija" key={detalle.pizza.id}>
                  <span className="linea__cantidad">
                    <span className="sr-only">Cantidad: </span>
                    {detalle.cantidad}
                  </span>
                  <span className="linea__info">
                    <span className="linea__nombre">{detalle.pizza.nombre}</span>
                    <span className="linea__unitario">{formatearPrecio(detalle.pizza.precio)} c/u</span>
                  </span>
                  <span className="linea__subtotal">{formatearPrecio(detalle.pizza.precio * detalle.cantidad)}</span>
                </li>
              ))}
            </ul>
            <p className="resumen__total">
              <span>Total</span>
              <span className="resumen__total-valor">{formatearPrecio(pedido.total)}</span>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
