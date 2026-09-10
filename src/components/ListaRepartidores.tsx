import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Repartidor } from "../types";
import { obtenerRepartidores } from "../services/repartidoresService";
import "./Listas.css";

function ListaRepartidores() {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);

  useEffect(() => {
    obtenerRepartidores().then(setRepartidores);
  }, []);

  return (
    <div className="contenedor-pagina">
      <h1>Repartidores</h1>
      <ul className="lista-items">
        {repartidores.map((repartidor) => (
          <li key={repartidor.id}>
            <Link to={`/repartidores/${repartidor.id}`}>
              {repartidor.nombre} {repartidor.apellido} — Matrícula: {repartidor.matricula}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaRepartidores;