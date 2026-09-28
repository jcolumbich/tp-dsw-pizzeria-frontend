import { useEffect, useState } from 'react';
import type { Cliente } from '../../interfaces/cliente';
import type { Pizza } from '../../interfaces/pizza';
import type { ItemPedido, Pedido } from '../../interfaces/pedido';
import { getClientes } from '../../services/clienteService';
import { getPizzas } from '../../services/pizzaService';
import { crearPedido } from '../../services/pedidoService';
import { getIngredientesDePizza } from '../../services/ingredientePizzaService';
import { obtenerFotoPizza } from '../../services/fotosPizza';
import { useAuth } from '../../context/authContext';
import './crearPedidoForm.css';

interface ItemCarrito extends ItemPedido {
  nombrePizza: string;
  precioUnitario: number;
}

export default function CrearPedidoForm() {
  const { usuario } = useAuth();
  const esAdmin = (usuario?.nivel_permisos ?? 0) >= 1;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [ingredientes, setIngredientes] = useState<Record<number, string>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState<number | ''>('');
  const [retiro, setRetiro] = useState(false);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  const [enviando, setEnviando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<Pedido | null>(null);

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        if (esAdmin) {
          const [clientesData, pizzasData] = await Promise.all([
            getClientes(),
            getPizzas(),
          ]);

          if (!activo) return;

          const disponibles = pizzasData.filter((pizza) => pizza.disponible);
          setClientes(clientesData);
          setPizzas(disponibles);

          const composiciones = await Promise.allSettled(
            disponibles.map((pizza) => getIngredientesDePizza(pizza.id))
          );

          if (!activo) return;

          const nombres: Record<number, string> = {};

          composiciones.forEach((resultado, indice) => {
            if (resultado.status === 'fulfilled' && resultado.value.length > 0) {
              nombres[disponibles[indice].id] = resultado.value
                .map((item) => item.ingrediente.nombre)
                .join(', ');
            }
          });

          setIngredientes(nombres);
        } else {
          const pizzasData = await getPizzas();
          if (!activo) return;

          setPizzas(pizzasData.filter((pizza) => pizza.disponible));
        }

        setError(null);
      } catch (err) {
        if (activo) {
          setError('No se pudieron cargar los datos necesarios para el pedido.');
        }
        console.error(err);
      } finally {
        if (activo) setCargando(false);
      }
    };

    void cargarDatos();

    return () => {
      activo = false;
    };
  }, [esAdmin]);

  const cambiarCantidad = (pizza: Pizza, cambio: number) => {
    setPedidoConfirmado(null);

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

  const totalEstimado = carrito.reduce(
    (total, item) => total + item.precioUnitario * item.cantidad,
    0
  );

  const confirmarPedido = async () => {
    if (esAdmin && clienteId === '') {
      setError('Elegí un cliente.');
      return;
    }

    if (carrito.length === 0) {
      setError('Agregá al menos una pizza al pedido.');
      return;
    }

    try {
      setError(null);
      setEnviando(true);

      const nuevo = await crearPedido({
        retiro,
        clienteId: esAdmin ? Number(clienteId) : (usuario?.id ?? 0),
        items: carrito.map(({ pizzaId, cantidad }) => ({
          pizzaId,
          cantidad,
        })),
      });

      setPedidoConfirmado(nuevo);
      setCarrito([]);
      setClienteId('');
      setRetiro(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo registrar el pedido.'
      );
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <p>Cargando pizzas...</p>;

  return (
    <div className="ingredientes-container pedido-nuevo">
      <header className="pedido-encabezado">
        <span className="pedido-etiqueta">
          DUE PAFFUTELLI · NUEVO PEDIDO
        </span>
        <h2>Elegí tus pizzas</h2>
        <p>Sumá las pizzas que quieras con los botones de cada tarjeta.</p>
      </header>

      {error && (
        <div className="error-message" role="alert">
          ⚠️ {error}
        </div>
      )}

      {pedidoConfirmado && (
        <div className="crear-ingrediente-form" role="status">
          <h3>✅ Pedido #{pedidoConfirmado.id} registrado</h3>
          <p>
            Total: <strong>${pedidoConfirmado.total}</strong> — Estado:{' '}
            {pedidoConfirmado.estado}
          </p>
        </div>
      )}

      <div className="crear-ingrediente-form pedido-datos">
        <h3>Datos del pedido</h3>

        <div className="form">
          {esAdmin ? (
            <div className="form-group">
              <label htmlFor="cliente-pedido">Cliente:</label>
              <select
                id="cliente-pedido"
                value={clienteId}
                onChange={(e) =>
                  setClienteId(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                className="form-input"
              >
                <option value="">Seleccioná un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.apellido}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>Cliente:</label>
              <p style={{ margin: 0, fontWeight: 600 }}>
                {usuario?.nombre} {usuario?.apellido}
              </p>
            </div>
          )}

          <div className="form-group-small">
            <label>
              <input
                type="checkbox"
                checked={retiro}
                onChange={(e) => setRetiro(e.target.checked)}
              />{' '}
              Retiro en el local
            </label>
          </div>
        </div>
      </div>

      <h3 className="pedido-carta-titulo">Nuestra carta</h3>

      {pizzas.length === 0 ? (
        <p>No hay pizzas disponibles.</p>
      ) : (
        <div className="pedido-pizzas-grid">
          {pizzas.map((pizza) => {
            const cantidad =
              carrito.find((item) => item.pizzaId === pizza.id)?.cantidad ?? 0;
            const foto = obtenerFotoPizza(pizza.id);

            return (
              <article className="pedido-pizza-card" key={pizza.id}>
                <div className="pedido-pizza-imagen">
                  {foto ? (
                    <img src={foto} alt={`Pizza ${pizza.nombre}`} />
                  ) : (
                    <div
                      className="pedido-pizza-sin-foto"
                      aria-label="Foto pendiente"
                    >
                      🍕
                      <span>Foto de la pizza</span>
                    </div>
                  )}
                </div>

                <div className="pedido-pizza-contenido">
                  <div className="pedido-pizza-info">
                    <h4>{pizza.nombre}</h4>
                    <strong>${Number(pizza.precio).toFixed(2)}</strong>
                  </div>

                  <p className="pedido-pizza-ingredientes">
                    {ingredientes[pizza.id]
                      ? `Ingredientes: ${ingredientes[pizza.id]}`
                      : esAdmin
                        ? 'Ingredientes no cargados o no disponibles'
                        : 'Consultá los ingredientes en el local'}
                  </p>

                  <div
                    className="pedido-pizza-controles"
                    aria-label={`Cantidad de ${pizza.nombre}`}
                  >
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(pizza, -1)}
                      disabled={cantidad === 0 || enviando}
                      aria-label={`Quitar una ${pizza.nombre}`}
                    >
                      −
                    </button>

                    <output aria-live="polite">{cantidad}</output>

                    <button
                      type="button"
                      onClick={() => cambiarCantidad(pizza, 1)}
                      disabled={cantidad >= 100 || enviando}
                      aria-label={`Agregar una ${pizza.nombre}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="crear-ingrediente-form pedido-resumen">
        <div>
          <h3>Tu pedido</h3>

          {carrito.length === 0 ? (
            <p>Todavía no elegiste pizzas.</p>
          ) : (
            <ul>
              {carrito.map((item) => (
                <li key={item.pizzaId}>
                  <span>
                    {item.cantidad} × {item.nombrePizza}
                  </span>
                  <strong>
                    ${(item.precioUnitario * item.cantidad).toFixed(2)}
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pedido-resumen-total">
          <strong>Total estimado: ${totalEstimado.toFixed(2)}</strong>
          <div className="form-actions">
            <button
              type="button"
              className="btn-submit"
              onClick={() => void confirmarPedido()}
              disabled={enviando || carrito.length === 0}
            >
              {enviando ? 'Confirmando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}