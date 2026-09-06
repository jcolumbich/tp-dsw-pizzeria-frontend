import { useState, useEffect } from "react";

interface Pedido {
  id: number;
  dia: string;
  total: number;
  retiro: boolean;
  estado: string;
  cliente: number;
}

function ListaPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/pedidos")
      .then((response) => response.json())
      .then((data) => setPedidos(data.data));
  }, []);

  return (
    <div>
      <h1>Pedidos</h1>
      <ul>
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            Pedido #{pedido.id} — Cliente #{pedido.cliente} — Total: ${pedido.total} — Estado: {pedido.estado}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaPedidos;