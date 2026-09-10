import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Cliente } from "../types";
import { obtenerClientes } from "../services/clientesService";
import "./Listas.css";

function ListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    obtenerClientes().then(setClientes);
  }, []);

  return (
    <div className="contenedor-pagina">
      <h1>Clientes</h1>
      <ul className="lista-items">
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            <Link to={`/clientes/${cliente.id}`}>
              {cliente.nombre} {cliente.apellido} — {cliente.domicilio}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaClientes;