import { useState } from "react";
import { crearEnvio } from "../services/enviosService";
import "./Formularios.css";

function FormularioEnvio() {
  const [pedidoId, setPedidoId] = useState("");
  const [costo, setCosto] = useState("");
  const [montoPropina, setMontoPropina] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    crearEnvio(Number(pedidoId), Number(costo), Number(montoPropina))
      .then(() => setMensaje("¡Envío registrado con éxito!"))
      .catch(() => setMensaje("Hubo un error al registrar el envío"));
  };

  return (
    <div className="formulario">
      <h2>Registrar Envío</h2>
      <form onSubmit={handleSubmit}>
        <div className="campo-formulario">
          <label>ID del Pedido</label>
          <input
            type="number"
            value={pedidoId}
            onChange={(e) => setPedidoId(e.target.value)}
          />
        </div>

        <div className="campo-formulario">
          <label>Costo</label>
          <input
            type="number"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
          />
        </div>

        <div className="campo-formulario">
          <label>Propina</label>
          <input
            type="number"
            value={montoPropina}
            onChange={(e) => setMontoPropina(e.target.value)}
          />
        </div>

        <button type="submit" className="boton-principal">
          Registrar Envío
        </button>
      </form>

      {mensaje && <p className="mensaje-formulario">{mensaje}</p>}
    </div>
  );
}

export default FormularioEnvio;