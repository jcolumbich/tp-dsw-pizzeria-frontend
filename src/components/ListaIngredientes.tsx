import { useState, useEffect } from "react";
import type { Ingrediente } from "../types";
import { obtenerIngredientes } from "../services/ingredientesService";

function ListaIngredientes() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

  useEffect(() => {
    obtenerIngredientes().then(setIngredientes);
  }, []);

  return (
    <div>
      <h1>Ingredientes de la Pizzería</h1>
      <ul>
        {ingredientes.map((ingrediente) => (
          <li key={ingrediente.id}>
            {ingrediente.nombre} — Stock: {ingrediente.stock}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaIngredientes;