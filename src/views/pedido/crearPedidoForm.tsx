import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Pizza } from '../../interfaces/pizza';
import type { ItemPedido, Pedido } from '../../interfaces/pedido';
import { getPizzas, obtenerUrlImagenPizza } from '../../services/pizzaService';
import { crearPedido } from '../../services/pedidoService';
import { useAuth } from '../../context/authContext';
import { crearPedidoSchema } from '../../schemas/pedido.schema';
import { calcularTotalPedido, formatearPrecio, obtenerPropinaPedido } from '../../utils/formato';
import ControlCantidad from '../../components/ControlCantidad';
import AlertaError from '../../components/AlertaError';
import SelectorSegmentado from '../../components/SelectorSegmentado';
import { IconoCheck, IconoChevronArriba, IconoHoja, IconoX } from '../../components/iconos';
import './crearPedidoForm.css';

interface ItemCarrito extends ItemPedido {
  nombrePizza: string;
  precioUnitario: number;
}

type Modalidad = 'retiro' | 'envio';

const NOTA_ENVIO_ID = 'modalidad-nota';

export default function CrearPedidoForm() {
  const { usuario } = useAuth();

  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [retiro, setRetiro] = useState(false);
  const [propina, setPropina] = useState('0');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [resumenAbierto, setResumenAbierto] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [errorPedido, setErrorPedido] = useState<string | null>(null);
  const [pizzaNombreConError, setPizzaNombreConError] = useState<string | null>(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<Pedido | null>(null);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const tituloExitoRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let activo = true;

    const cargarPizzas = async () => {
      try {
        const pizzasData = await getPizzas();
        if (!activo) return;
        setPizzas(pizzasData);
        setErrorCarga(null);
      } catch (err) {
        if (activo) setErrorCarga('No se pudieron cargar las pizzas.');
        console.error(err);
      } finally {
        if (activo) setCargando(false);
      }
    };

    void cargarPizzas();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!resumenAbierto) return;

    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        setResumenAbierto(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', alPresionarTecla);
    return () => document.removeEventListener('keydown', alPresionarTecla);
  }, [resumenAbierto]);

  useEffect(() => {
    if (pedidoConfirmado) {
      tituloExitoRef.current?.focus();
    }
  }, [pedidoConfirmado]);

  const limpiarErrorPedido = () => {
    setErrorPedido(null);
    setPizzaNombreConError(null);
  };

  const cambiarCantidad = (pizza: Pizza, cambio: number) => {
    limpiarErrorPedido();

    setCarrito((anterior) => {
      const existente = anterior.find((item) => item.pizzaId === pizza.id);
      const cantidad = (existente?.cantidad ?? 0) + cambio;

      if (cantidad <= 0) {
        return anterior.filter((item) => item.pizzaId !== pizza.id);
      }

      if (cantidad > 100) return anterior;

      if (existente) {
        return anterior.map((item) =>
          item.pizzaId === pizza.id ? { ...item, cantidad } : item
        );
      }

      return [
        ...anterior,
        {
          pizzaId: pizza.id,
          cantidad,
          nombrePizza: pizza.nombre,
          precioUnitario: pizza.precio,
        },
      ];
    });
  };

  const quitarDelCarrito = (pizzaId: number) => {
    limpiarErrorPedido();
    setCarrito((anterior) => anterior.filter((item) => item.pizzaId !== pizzaId));
  };

  const total = carrito.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0);
  const propinaNumero = propina.trim() === '' ? 0 : Number(propina);
  const propinaResumen = !retiro && Number.isFinite(propinaNumero) && propinaNumero >= 0 ? propinaNumero : 0;
  const totalConPropina = total + propinaResumen;
  const unidadesEnCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const confirmarPedido = async () => {
    if (enviando || carrito.length === 0) return;
    limpiarErrorPedido();

    const resultado = crearPedidoSchema.safeParse({
      retiro,
      monto_propina: retiro ? 0 : propinaNumero,
      clienteId: usuario?.id,
      items: carrito.map(({ pizzaId, cantidad }) => ({ pizzaId, cantidad })),
    });

    if (!resultado.success) {
      setErrorPedido(resultado.error.issues[0]?.message ?? 'Revisá los datos del pedido');
      return;
    }

    try {
      setEnviando(true);
      const nuevo = await crearPedido(resultado.data);
      setPedidoConfirmado(nuevo);
      setCarrito([]);
      setRetiro(false);
      setPropina('0');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo registrar el pedido.';
      setErrorPedido(mensaje);
      const coincidencia = mensaje.match(/"([^"]+)"/);
      setPizzaNombreConError(coincidencia ? coincidencia[1] : null);
    } finally {
      setEnviando(false);
    }
  };

  if (pedidoConfirmado) {
    return (
      <div className="pedido-nuevo">
        <main className="pagina pagina--simple">
          <section className="exito" aria-labelledby="exito-titulo">
            <div className="exito__sello" aria-hidden="true">
              <IconoCheck />
            </div>
            <p className="eyebrow">Pedido recibido</p>
            <h1 className="titulo-pagina" id="exito-titulo" tabIndex={-1} ref={tituloExitoRef}>
              ¡Listo! Ya tenemos tu pedido
            </h1>
            <p className="bajada">Podés seguir su estado desde Mis pedidos.</p>

            <div className="recibo">
              <dl className="recibo__datos">
                <div>
                  <dt>Estado</dt>
                  <dd>
                    <span className="tag tag--pendiente">{pedidoConfirmado.estado}</span>
                  </dd>
                </div>
                <div>
                  <dt>Modalidad</dt>
                  <dd>{pedidoConfirmado.retiro ? 'Retiro en el local' : 'Envío a domicilio'}</dd>
                </div>
              </dl>

              {!pedidoConfirmado.retiro && (
                <p className="modalidad__nota">
                  Lo enviamos al domicilio registrado en tu cuenta.
                </p>
              )}

              <ul className="lineas">
                {pedidoConfirmado.detalles.map((detalle) => (
                  <li className="linea linea--fija" key={detalle.pizza.id}>
                    <span className="linea__cantidad">
                      <span className="sr-only">Cantidad: </span>
                      {detalle.cantidad}
                    </span>
                    <span className="linea__info">
                      <span className="linea__nombre">{detalle.pizza.nombre}</span>
                      <span className="linea__unitario">{formatearPrecio(detalle.pizza.precio)} c/u</span>
                    </span>
                    <span className="linea__subtotal">
                      {formatearPrecio(detalle.pizza.precio * detalle.cantidad)}
                    </span>
                  </li>
                ))}
              </ul>

              {!pedidoConfirmado.retiro && (
                <>
                  <p>Pizzas: {formatearPrecio(pedidoConfirmado.total)}</p>
                  <p>Propina: {formatearPrecio(obtenerPropinaPedido(pedidoConfirmado))}</p>
                  <p className="modalidad__nota">El costo del envío se confirma más adelante.</p>
                </>
              )}
              <p className="resumen__total">
                <span>{pedidoConfirmado.retiro ? 'Total' : 'Total sin envío'}</span>
                <span className="resumen__total-valor">{formatearPrecio(calcularTotalPedido(pedidoConfirmado))}</span>
              </p>
            </div>

            <Link className="btn btn--primario btn--bloque" to="/mis-pedidos">
              Ir a Mis pedidos
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="pedido-nuevo">
      <main className={`pagina${errorPedido ? ' pagina--con-alerta' : ''}`}>
        <div className="encabezado">
          <p className="eyebrow">Nuevo pedido</p>
          <h1 className="titulo-pagina">Armá tu pedido</h1>
          <p className="bajada">Elegí las pizzas y la cantidad de cada una. Confirmás al final.</p>
        </div>

        <div className="pedido">
          <section className="carta" aria-labelledby="carta-titulo">
            <div className="carta__cabecera">
              <h2 className="titulo-seccion" id="carta-titulo">
                Nuestra carta
              </h2>
              {!cargando && pizzas.length > 0 && (
                <p className="carta__cuenta">
                  {pizzas.length} {pizzas.length === 1 ? 'pizza' : 'pizzas'}
                </p>
              )}
            </div>

            {errorCarga && <AlertaError titulo="No pudimos cargar la carta" mensaje={errorCarga} />}

            {cargando ? (
              <>
                <p className="sr-only" role="status">
                  Cargando la carta…
                </p>
                <ul className="carta__lista" aria-busy="true" aria-hidden="true">
                  {Array.from({ length: 4 }).map((_, indice) => (
                    <li key={indice}>
                      <div className="pizza-card pizza-card--cargando">
                        <div className="pizza-card__media"></div>
                        <div className="pizza-card__cuerpo">
                          <span className="esqueleto esqueleto--titulo"></span>
                          <span className="esqueleto esqueleto--tag"></span>
                          <div className="pizza-card__pie">
                            <span className="esqueleto esqueleto--precio"></span>
                            <span className="esqueleto esqueleto--boton"></span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : pizzas.length === 0 ? (
              !errorCarga && (
                <div className="vacio">
                  <p className="vacio__titulo">Por ahora no hay pizzas en la carta</p>
                  <p>Volvé a pasar en un rato para hacer tu pedido.</p>
                </div>
              )
            ) : (
              <ul className="carta__lista">
                {pizzas.map((pizza) => {
                  const cantidad = carrito.find((item) => item.pizzaId === pizza.id)?.cantidad ?? 0;

                  return (
                    <li key={pizza.id}>
                      <article
                        className={`pizza-card${cantidad > 0 ? ' pizza-card--en-pedido' : ''}${
                          !pizza.disponible ? ' pizza-card--no-disponible' : ''
                        }`}
                      >
                        <div className="pizza-card__media" aria-hidden="true">
                          {pizza.imagen ? (
                            <img src={obtenerUrlImagenPizza(pizza)!} alt="" loading="lazy" className="pizza-imagen-pedido" />
                          ) : (
                            <span className="pizza-card__inicial">{pizza.nombre.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="pizza-card__cuerpo">
                          <h3 className="pizza-card__nombre">{pizza.nombre}</h3>

                          {(pizza.vegetariana || !pizza.disponible) && (
                            <p className="pizza-card__tags">
                              {!pizza.disponible && <span className="tag tag--no-disponible">No disponible</span>}
                              {pizza.vegetariana && (
                                <span className="tag tag--vegetariana">
                                  <IconoHoja />
                                  Vegetariana
                                </span>
                              )}
                            </p>
                          )}

                          <div className="pizza-card__pie">
                            <p className="pizza-card__precio">{formatearPrecio(pizza.precio)}</p>
                            <ControlCantidad
                              cantidad={cantidad}
                              nombre={pizza.nombre}
                              onCambiar={(delta) => cambiarCantidad(pizza, delta)}
                              deshabilitado={!pizza.disponible || enviando}
                            />
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <aside className={`resumen${resumenAbierto ? ' is-open' : ''}`} aria-labelledby="resumen-titulo">
            <div className="resumen__panel">
              <button
                type="button"
                className="resumen__toggle"
                aria-expanded={resumenAbierto}
                aria-controls="resumen-detalle"
                onClick={() => setResumenAbierto((abierto) => !abierto)}
                ref={toggleRef}
              >
                <span className="resumen__toggle-texto">
                  <span className="resumen__toggle-titulo">
                    {carrito.length === 0
                      ? 'Tu pedido está vacío'
                      : `Tu pedido · ${unidadesEnCarrito} ${unidadesEnCarrito === 1 ? 'pizza' : 'pizzas'}`}
                  </span>
                  <span className="resumen__toggle-detalle">
                    {retiro ? 'Retiro en el local' : 'Envío a domicilio'}
                  </span>
                </span>
                <span className="resumen__toggle-accion">
                  Detalle
                  <IconoChevronArriba className="icono resumen__chevron" />
                </span>
              </button>

              {errorPedido && (
                <AlertaError className="resumen__alerta" mensaje={errorPedido} />
              )}

              <div className="resumen__detalle" id="resumen-detalle">
                <h2 className="titulo-seccion resumen__titulo" id="resumen-titulo">
                  Tu pedido
                </h2>

                {carrito.length === 0 ? (
                  <p className="resumen__vacio">
                    <strong>Todavía no elegiste nada</strong>
                    Sumá pizzas desde la carta y las vas a ver acá.
                  </p>
                ) : (
                  <ul className="lineas">
                    {carrito.map((item) => {
                      const tieneError =
                        !!pizzaNombreConError &&
                        item.nombrePizza.toLowerCase() === pizzaNombreConError.toLowerCase();

                      return (
                        <li className={`linea${tieneError ? ' linea--error' : ''}`} key={item.pizzaId}>
                          <span className="linea__cantidad">
                            <span className="sr-only">Cantidad: </span>
                            {item.cantidad}
                          </span>
                          <span className="linea__info">
                            <span className="linea__nombre">{item.nombrePizza}</span>
                            <span className="linea__unitario">
                              {tieneError ? 'No disponible' : `${formatearPrecio(item.precioUnitario)} c/u`}
                            </span>
                          </span>
                          <span className="linea__subtotal">
                            {formatearPrecio(item.precioUnitario * item.cantidad)}
                          </span>
                          <button
                            type="button"
                            className="btn-icono"
                            aria-label={`Quitar ${item.nombrePizza} del pedido`}
                            onClick={() => quitarDelCarrito(item.pizzaId)}
                            disabled={enviando}
                          >
                            <IconoX />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <SelectorSegmentado<Modalidad>
                  nombre="modalidad"
                  leyenda="¿Cómo lo recibís?"
                  opciones={[
                    { valor: 'retiro', etiqueta: 'Retiro en el local' },
                    {
                      valor: 'envio',
                      etiqueta: 'Envío a domicilio',
                      describedBy: !retiro ? NOTA_ENVIO_ID : undefined,
                    },
                  ]}
                  valorSeleccionado={retiro ? 'retiro' : 'envio'}
                  onCambiar={(valor) => {
                    setRetiro(valor === 'retiro');
                    if (valor === 'retiro') setPropina('0');
                    limpiarErrorPedido();
                  }}
                  deshabilitado={enviando}
                >
                  {!retiro && (
                    <p className="modalidad__nota" id={NOTA_ENVIO_ID}>
                      Lo enviamos al domicilio registrado en tu cuenta.
                    </p>
                  )}
                </SelectorSegmentado>

                {!retiro && (
                  <div className="form-group">
                    <label htmlFor="propina-pedido">Propina para el repartidor (opcional)</label>
                    <input
                      id="propina-pedido"
                      className="form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={propina}
                      onChange={(e) => {
                        setPropina(e.target.value);
                        limpiarErrorPedido();
                      }}
                      disabled={enviando}
                      aria-describedby="propina-nota"
                    />
                    <p className="modalidad__nota" id="propina-nota">
                      Podés dejarla en $0. El costo del envío se confirma más adelante.
                    </p>
                    <p>Pizzas: {formatearPrecio(total)}</p>
                    <p>Propina: {formatearPrecio(propinaResumen)}</p>
                  </div>
                )}

                <p className="resumen__total">
                  <span>{retiro ? 'Total' : 'Total sin envío'}</span>
                  <span className="resumen__total-valor">{formatearPrecio(totalConPropina)}</span>
                </p>
              </div>

              <div className="resumen__accion">
                <button
                  type="button"
                  className={`btn btn--primario btn--bloque${enviando ? ' btn--cargando' : ''}`}
                  disabled={enviando || carrito.length === 0}
                  aria-busy={enviando}
                  onClick={() => void confirmarPedido()}
                >
                  {enviando && <span className="spinner" aria-hidden="true"></span>}
                  {enviando ? 'Enviando' : 'Confirmar pedido'}
                  {!enviando && carrito.length > 0 && (
                    <span className="btn__total">{formatearPrecio(totalConPropina)}</span>
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}