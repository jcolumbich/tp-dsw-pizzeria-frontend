import { useState, useEffect } from "react";
import "./App.css";

interface Ingrediente {
  id: number;
  nombre: string;
  stock: number;
}

function App() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/ingredientes")
      .then((response) => response.json())
      .then((data) => setIngredientes(data));
  }, []);

  return (
    <div>
      <h1>Ingredientes de la Pizzería</h1>
      <ul>
        {ingredientes.map((ingrediente) => (
          <li key={ingrediente.id}>
            {ingrediente.nombre} — Stock: {ingrediente.stock}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;