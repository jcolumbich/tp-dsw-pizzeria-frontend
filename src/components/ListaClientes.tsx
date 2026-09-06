import { useState, useEffect } from "react";

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  domicilio: string;
  estado: boolean;
}

function ListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/clientes")
      .then((response) => response.json())
      .then((data) => setClientes(data.data));
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