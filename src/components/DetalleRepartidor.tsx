import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Repartidor } from "../types";
import { obtenerRepartidorPorId } from "../services/repartidoresService";
import "./Listas.css";
import "./Detalles.css";

function DetalleRepartidor() {
  const { id } = useParams();
  const [repartidor, setRepartidor] = useState<Repartidor | null>(null);

  useEffect(() => {
    obtenerRepartidorPorId(Number(id)).then(setRepartidor);
  }, [id]);

  if (!repartidor) {
    return <p className="contenedor-pagina">Cargando...</p>;
  }

  return (
    <div className="contenedor-pagina">
      <Link to="/repartidores" className="detalle-volver">← Volver a Repartidores</Link>
      <h1>{repartidor.nombre} {repartidor.apellido}</h1>
      <div className="detalle-card">
        <dl className="detalle-datos">
          <div className="detalle-fila">
            <dt>Matrícula</dt>
            <dd>{repartidor.matricula}</dd>
          </div>
          <div className="detalle-fila detalle-fila--total">
            <dt>Propinas totales</dt>
            <dd>${repartidor.monto_propina_total}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default DetalleRepartidor;