import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Ingrediente } from "../types";
import { obtenerIngredientes } from "../services/ingredientesService";
import "./Listas.css";

function ListaIngredientes() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

  useEffect(() => {
    obtenerIngredientes().then(setIngredientes);
  }, []);

  return (
    <div className="contenedor-pagina">
      <h1>Ingredientes de la Pizzería</h1>
      <ul className="lista-items">
        {ingredientes.map((ingrediente) => (
          <li key={ingrediente.id}>
            <Link to={`/ingredientes/${ingrediente.id}`}>
              {ingrediente.nombre} — Stock: {ingrediente.stock}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaIngredientes;