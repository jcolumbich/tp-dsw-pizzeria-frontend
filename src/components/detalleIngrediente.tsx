import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Ingrediente } from "../types";
import { obtenerIngredientePorId } from "../services/ingredientesService";
import "./Listas.css";
import "./Detalles.css";

function DetalleIngrediente() {
  const { id } = useParams();
  const [ingrediente, setIngrediente] = useState<Ingrediente | null>(null);

  useEffect(() => {
    obtenerIngredientePorId(Number(id)).then(setIngrediente);
  }, [id]);

  if (!ingrediente) {
    return <p className="contenedor-pagina">Cargando...</p>;
  }

  return (
    <div className="contenedor-pagina">
      <Link to="/ingredientes" className="detalle-volver">← Volver a Ingredientes</Link>
      <h1>{ingrediente.nombre}</h1>
      <div className="detalle-card">
        <dl className="detalle-datos">
          <div className="detalle-fila">
            <dt>Stock</dt>
            <dd>{ingrediente.stock}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default DetalleIngrediente;