import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Pizza } from "../types";
import { obtenerPizzaPorId } from "../services/pizzasService";
import "./Listas.css";
import "./Detalles.css";

function DetallePizza() {
  const { id } = useParams();
  const [pizza, setPizza] = useState<Pizza | null>(null);

  useEffect(() => {
    obtenerPizzaPorId(Number(id)).then(setPizza);
  }, [id]);

  if (!pizza) {
    return <p className="contenedor-pagina">Cargando...</p>;
  }

  return (
    <div className="contenedor-pagina">
      <Link to="/pizzas" className="detalle-volver">← Volver a Pizzas</Link>
      <h1>{pizza.nombre}</h1>
      <div className="detalle-card">
        <dl className="detalle-datos">
          <div className="detalle-fila detalle-fila--total">
            <dt>Precio</dt>
            <dd>${pizza.precio}</dd>
          </div>
          <div className="detalle-fila">
            <dt>Vegetariana</dt>
            <dd>{pizza.vegetariana ? "Sí" : "No"}</dd>
          </div>
          <div className="detalle-fila">
            <dt>Disponible</dt>
            <dd>{pizza.disponible ? "Sí" : "No"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default DetallePizza;