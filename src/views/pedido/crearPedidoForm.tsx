import { useEffect, useState } from 'react';
import type { Cliente } from '../../interfaces/cliente';
import type { Pizza } from '../../interfaces/pizza';
import type { ItemPedido, Pedido } from '../../interfaces/pedido';
import { getClientes } from '../../services/clienteService';
import { getPizzas } from '../../services/pizzaService';
import { crearPedido } from '../../services/pedidoService';
import { useAuth } from '../../context/authContext';

interface ItemCarrito extends ItemPedido {
  nombrePizza: string;
  precioUnitario: number;
}

export default function CrearPedidoForm() {
  const { usuario } = useAuth();
  const esAdmin = usuario ? usuario.nivel_permisos >= 1 : false;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState<number | ''>('');
  const [retiro, setRetiro] = useState(false);

  const [pizzaSeleccionada, setPizzaSeleccionada] = useState<number | ''>('');
  const [cantidadNueva, setCantidadNueva] = useState<number>(1);

  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  const [enviando, setEnviando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<Pedido | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      if (esAdmin) {
        const [clientesData, pizzasData] = await Promise.all([getClientes(), getPizzas()]);
        setClientes(clientesData);
        setPizzas(pizzasData.filter((p) => p.disponible));
      } else {
        const pizzasData = await getPizzas();
        setPizzas(pizzasData.filter((p) => p.disponible));
      }

      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los datos necesarios para el pedido.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarAlCarrito = () => {
    if (pizzaSeleccionada === '' || cantidadNueva <= 0) {
      alert('Elegí una pizza y una cantidad mayor a 0.');
      return;
    }

    const pizza = pizzas.find((p) => p.id === pizzaSeleccionada);
    if (!pizza) return;

    setCarrito((prev) => {
      const existente = prev.find((item) => item.pizzaId === pizza.id);
      if (existente) {
        return prev.map((item) =>
          item.pizzaId === pizza.id ? { ...item, cantidad: item.cantidad + cantidadNueva } : item
        );
      }
      return [
        ...prev,
        {
          pizzaId: pizza.id,
          cantidad: cantidadNueva,
          nombrePizza: pizza.nombre,
          precioUnitario: pizza.precio,
        },
      ];
    });

    setPizzaSeleccionada('');
    setCantidadNueva(1);
  };

  const handleQuitarDelCarrito = (pizzaId: number) => {
    setCarrito((prev) => prev.filter((item) => item.pizzaId !== pizzaId));
  };

  const totalEstimado = carrito.reduce(
    (acc, item) => acc + item.precioUnitario * item.cantidad,
    0
  );

  const handleConfirmarPedido = async () => {
    if (esAdmin && clienteId === '') {
      alert('Elegí un cliente.');
      return;
    }
    if (carrito.length === 0) {
      alert('Agregá al menos una pizza al pedido.');
      return;
    }

    try {
      setEnviando(true);

      const nuevo = await crearPedido({
        retiro,
        clienteId: esAdmin ? Number(clienteId) : (usuario?.id ?? 0),
        items: carrito.map(({ pizzaId, cantidad }) => ({ pizzaId, cantidad })),
      });

      setPedidoConfirmado(nuevo);
      setCarrito([]);
      setClienteId('');
      setRetiro(false);
    } catch (err) {
      alert('No se pudo registrar el pedido. Intentá nuevamente.');
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <p>Cargando datos...</p>;

  return (
    <div className="ingredientes-container">
      <h2>🧾 Registrar Nuevo Pedido</h2>

      {error && <div className="error-message">⚠️ {error}</div>}

      {pedidoConfirmado && (
        <div className="crear-ingrediente-form">
          <h3>✅ Pedido #{pedidoConfirmado.id} registrado</h3>
          <p>
            Total: <strong>${pedidoConfirmado.total}</strong> — Estado: {pedidoConfirmado.estado}
          </p>
        </div>
      )}

      <div className="crear-ingrediente-form">
        <h3>Datos del pedido</h3>

        <div className="form">
          {esAdmin ? (
            <div className="form-group">
              <label>Cliente:</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value === '' ? '' : Number(e.target.value))}
                className="form-input"
              >
                <option value="">Seleccioná un cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido}
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
              <input type="checkbox" checked={retiro} onChange={(e) => setRetiro(e.target.checked)} />{' '}
              Retiro en el local
            </label>
          </div>
        </div>
      </div>

      <div className="crear-ingrediente-form">
        <h3>Agregar pizzas al pedido</h3>

        <div className="form">
          <div className="form-group">
            <label>Pizza:</label>
            <select
              value={pizzaSeleccionada}
              onChange={(e) => setPizzaSeleccionada(e.target.value === '' ? '' : Number(e.target.value))}
              className="form-input"
            >
              <option value="">Seleccioná una pizza</option>
              {pizzas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — ${p.precio}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-small">
            <label>Cantidad:</label>
            <input
              type="number"
              value={cantidadNueva}
              onChange={(e) => setCantidadNueva(Number(e.target.value))}
              min="1"
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-submit" onClick={handleAgregarAlCarrito}>
              Agregar al pedido
            </button>
          </div>
        </div>
      </div>

      {carrito.length > 0 && (
        <table className="ingredientes-table">
          <thead>
            <tr>
              <th>Pizza</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((item) => (
              <tr key={item.pizzaId}>
                <td>{item.nombrePizza}</td>
                <td>{item.cantidad}</td>
                <td>${(item.precioUnitario * item.cantidad).toFixed(2)}</td>
                <td>
                  <button onClick={() => handleQuitarDelCarrito(item.pizzaId)} className="btn-eliminar">
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {carrito.length > 0 && (
        <div className="crear-ingrediente-form">
          <h3>Total estimado: ${totalEstimado.toFixed(2)}</h3>
          <div className="form-actions">
            <button className="btn-submit" onClick={handleConfirmarPedido} disabled={enviando}>
              {enviando ? 'Confirmando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}