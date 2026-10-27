import { useListado } from '../../hooks/useListado';
import Paginacion from '../../components/Paginacion';
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPedidos } from '../../services/pedidoService';
import { calcularTotalPedido, formatearPrecio } from '../../utils/formato';
import AlertaError from '../../components/AlertaError';
import { IconoFlechaDerecha } from '../../components/iconos';
import { ESTADOS_FILTRO, claseEstado, formatearFechaPedido } from './estadoPedido';
import './crearPedidoForm.css';
import './misPedidos.css';

export default function MisPedidos() {
  const [filtro, setFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const { data: pedidos, paginacion, cargando, error, recargar } = useListado(getPedidos, {
    pagina, limite: 10, estado: filtro === 'todos' ? undefined : filtro,
  });
  const cambiarFiltro = (valor: string) => { setFiltro(valor); setPagina(1); };

  return (
    <div className="pedido-nuevo mis-pedidos">
      <main className="pagina pagina--simple">
        <div className="encabezado encabezado--con-accion">
          <div>
            <p className="eyebrow">Tu cuenta</p>
            <h1 className="titulo-pagina">Mis pedidos</h1>
          </div>
          <Link className="btn btn--primario" to="/pedidos/nuevo">
            Nuevo pedido
          </Link>
        </div>

            <fieldset className="filtros">
              <legend className="sr-only">Filtrar por estado</legend>
              <div className="chips">
                <input
                  className="chip__input"
                  type="radio"
                  name="estado"
                  id="filtro-todos"
                  checked={filtro === 'todos'}
                  onChange={() => cambiarFiltro('todos')}
                />
                <label className="chip" htmlFor="filtro-todos">
                  Todos
                </label>
                {ESTADOS_FILTRO.map((opcion) => (
                  <Fragment key={opcion.valor}>
                    <input
                      className="chip__input"
                      type="radio"
                      name="estado"
                      id={`filtro-${encodeURIComponent(opcion.valor)}`}
                      checked={filtro === opcion.valor}
                      onChange={() => cambiarFiltro(opcion.valor)}
                    />
                    <label className="chip" htmlFor={`filtro-${encodeURIComponent(opcion.valor)}`}>
                      {opcion.etiqueta}
                    </label>
                  </Fragment>
                ))}
              </div>
            </fieldset>
            <p className="filtros__cuenta" role="status">
              {cargando ? 'Cargando…' : `${paginacion?.total ?? 0} pedidos`}
            </p>

        {cargando ? (
          <>
            <p className="sr-only" role="status">
              Cargando tus pedidos…
            </p>
            <ul className="pedidos" aria-busy="true" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, indice) => (
                <li key={indice}>
                  <div className="pedido-card pedido-card--cargando">
                    <span className="esqueleto esqueleto--titulo"></span>
                    <span className="esqueleto esqueleto--linea"></span>
                    <span className="esqueleto esqueleto--linea"></span>
                    <span className="esqueleto esqueleto--tag"></span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : error ? (
          <AlertaError
            className="alerta--pagina"
            titulo="No pudimos cargar tus pedidos"
            mensaje="Revisá tu conexión y volvé a intentar."
            accion={
              <button type="button" className="btn btn--secundario btn--s" onClick={() => recargar()}>
                Reintentar
              </button>
            }
          />
        ) : pedidos.length === 0 && filtro === 'todos' && pagina === 1 ? (
          <div className="vacio">
            <p className="vacio__titulo">Todavía no hiciste ningún pedido</p>
            <p>Cuando hagas el primero, vas a poder seguirlo desde acá.</p>
            <p className="vacio__accion">
              <Link className="btn btn--primario" to="/pedidos/nuevo">
                Hacer mi primer pedido
              </Link>
            </p>
          </div>
        ) : (
          <>

            {pedidos.length === 0 ? (
              <div className="vacio">
                <p className="vacio__titulo">No tenés pedidos en ese estado</p>
                <p>Probá con otro estado o mirá todos tus pedidos.</p>
                <p className="vacio__accion">
                  <button type="button" className="btn btn--secundario" onClick={() => cambiarFiltro('todos')}>
                    Ver todos
                  </button>
                </p>
              </div>
            ) : (
              <>
                <div className="pedidos__cabecera" aria-hidden="true">
                  <span>Número</span>
                  <span>Fecha</span>
                  <span>Modalidad</span>
                  <span>Pizzas</span>
                  <span>Estado</span>
                  <span>Total</span>
                  <span></span>
                </div>
                <ul className="pedidos">
                  {pedidos.map((pedido) => {
                    const unidades = pedido.detalles.reduce((acc, detalle) => acc + detalle.cantidad, 0);
                    return (
                      <li key={pedido.id}>
                        <Link className="pedido-card" to={`/mis-pedidos/${pedido.id}`}>
                          <span className="pedido-card__numero">
                            <span className="sr-only">Pedido </span>#{pedido.id}
                          </span>
                          <time className="pedido-card__fecha" dateTime={pedido.dia}>
                            {formatearFechaPedido(pedido.dia)}
                          </time>
                          <span className="pedido-card__modalidad">
                            {pedido.retiro ? 'Retiro en el local' : 'Envío a domicilio'}
                          </span>
                          <span className="pedido-card__items">
                            {unidades} {unidades === 1 ? 'pizza' : 'pizzas'}
                          </span>
                          <span className="pedido-card__estado">
                            <span className={`tag tag--${claseEstado(pedido.estado)}`}>{pedido.estado}</span>
                          </span>
                          <span className="pedido-card__total">
                            <span className="sr-only">Total </span>
                            {formatearPrecio(calcularTotalPedido(pedido))}
                            {!pedido.retiro && pedido.costo_envio == null && !pedido.envio && <span className="sr-only"> sin costo de envío</span>}
                          </span>
                          <IconoFlechaDerecha className="icono pedido-card__flecha" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </>
        )}
        <Paginacion datos={paginacion} cambiarPagina={setPagina} deshabilitada={cargando} />
      </main>
    </div>
  );
}