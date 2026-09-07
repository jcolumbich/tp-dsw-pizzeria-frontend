import { useState, useEffect } from "react";
import type { Repartidor } from "../types";
import { obtenerRepartidores } from "../services/repartidoresService";

function ListaRepartidores() {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);

  useEffect(() => {
    obtenerRepartidores().then(setRepartidores);
  }, []);

  return (
    <div>
      <h1>Repartidores</h1>
      <ul>
        {repartidores.map((repartidor) => (
          <li key={repartidor.id}>
            {repartidor.nombre} {repartidor.apellido} — Matrícula: {repartidor.matricula}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaRepartidores;