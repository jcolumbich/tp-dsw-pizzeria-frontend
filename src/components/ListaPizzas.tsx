import { useState, useEffect } from "react";
import type { Pizza } from "../types";
import { obtenerPizzas } from "../services/pizzasService";

function ListaPizzas() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);

  useEffect(() => {
    obtenerPizzas().then(setPizzas);
  }, []);

  return (
    <div>
      <h1>Pizzas de la Pizzería</h1>
      <ul>
        {pizzas.map((pizza) => (
          <li key={pizza.id}>
            {pizza.nombre} — ${pizza.precio}
            {pizza.vegetariana && " 🌱 Vegetariana"}
            {!pizza.disponible && " (No disponible)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaPizzas;