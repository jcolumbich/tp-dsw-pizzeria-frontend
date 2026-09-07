import { useState, useEffect } from "react";
import type { Cliente } from "../types";
import { obtenerClientes } from "../services/clientesService";

function ListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    obtenerClientes().then(setClientes);
  }, []);

  return (
    <div>
      <h1>Clientes</h1>
      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            {cliente.nombre} {cliente.apellido} — {cliente.domicilio}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaClientes;