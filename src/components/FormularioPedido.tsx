import { useState, useEffect } from "react";
import type { Cliente, Pizza } from "../types";
import { obtenerClientes } from "../services/clientesService";
import { obtenerPizzas } from "../services/pizzasService";
import { crearPedido } from "../services/pedidosService";
import "./Formularios.css";

function FormularioPedido() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [pizzaId, setPizzaId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    obtenerClientes().then(setClientes);
    obtenerPizzas().then(setPizzas);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    crearPedido(Number(clienteId), [
      { pizzaId: Number(pizzaId), cantidad: Number(cantidad) },
    ])
      .then(() => setMensaje("¡Pedido creado con éxito!"))
      .catch(() => setMensaje("Hubo un error al crear el pedido"));
  };

  return (
    <div className="formulario">
      <h2>Registrar Pedido</h2>
      <form onSubmit={handleSubmit}>
        <div className="campo-formulario">
          <label>Cliente</label>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">Seleccioná un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="campo-formulario">
          <label>Pizza</label>
          <select value={pizzaId} onChange={(e) => setPizzaId(e.target.value)}>
            <option value="">Seleccioná una pizza</option>
            {pizzas.map((pizza) => (
              <option key={pizza.id} value={pizza.id}>
                {pizza.nombre} — ${pizza.precio}
              </option>
            ))}
          </select>
        </div>

        <div className="campo-formulario">
          <label>Cantidad</label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
        </div>

        <button type="submit" className="boton-principal">
          Registrar Pedido
        </button>
      </form>

      {mensaje && <p className="mensaje-formulario">{mensaje}</p>}
    </div>
  );
}

export default FormularioPedido;