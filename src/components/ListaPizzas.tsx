import { useState, useEffect } from "react";

interface Pizza {
  id: number;
  nombre: string;
  precio: number;
  vegetariana: boolean;
  disponible: boolean;
}

function ListaPizzas() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/pizzas")
      .then((response) => response.json())
      .then((data) => setPizzas(data.data));
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