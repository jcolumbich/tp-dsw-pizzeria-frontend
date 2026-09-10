import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Cliente } from "../types";
import { obtenerClientePorId } from "../services/clientesService";
import "./Listas.css";
import "./Detalles.css";

function DetalleCliente() {
  const { id } = useParams();
  const [cliente, setCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    obtenerClientePorId(Number(id)).then(setCliente);
  }, [id]);

  if (!cliente) {
    return <p className="contenedor-pagina">Cargando...</p>;
  }

  return (
    <div className="contenedor-pagina">
      <Link to="/clientes" className="detalle-volver">← Volver a Clientes</Link>
      <h1>{cliente.nombre} {cliente.apellido}</h1>
      <div className="detalle-card">
        <dl className="detalle-datos">
          <div className="detalle-fila">
            <dt>Domicilio</dt>
            <dd>{cliente.domicilio}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default DetalleCliente;