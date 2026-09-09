import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Pizza } from "../types";
import { obtenerPizzaPorId } from "../services/pizzasService";
import "./Listas.css";

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
      <Link to="/pizzas">← Volver a Pizzas</Link>
      <h1>{pizza.nombre}</h1>
      <p>Precio: ${pizza.precio}</p>
      <p>Vegetariana: {pizza.vegetariana ? "Sí" : "No"}</p>
      <p>Disponible: {pizza.disponible ? "Sí" : "No"}</p>
    </div>
  );
}

export default DetallePizza;