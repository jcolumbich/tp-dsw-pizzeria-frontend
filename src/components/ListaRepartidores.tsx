import { useState, useEffect } from "react";

interface Repartidor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: boolean;
  matricula: string;
  monto_propina_total: number;
}

function ListaRepartidores() {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/repartidores")
      .then((response) => response.json())
      .then((data) => setRepartidores(data.data));
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