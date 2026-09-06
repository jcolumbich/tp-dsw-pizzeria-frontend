import { useState, useEffect } from "react";
import "./App.css";
import ListaPizzas from "./components/ListaPizzas";
import ListaRepartidores from "./components/ListaRepartidores";
import ListaClientes from "./components/ListaClientes";
import ListaPedidos from "./components/ListaPedidos";
import FormularioPedido from "./components/FormularioPedido";


interface Ingrediente {
  id: number;
  nombre: string;
  stock: number;
}

function App() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/ingredientes")
      .then((response) => response.json())
      .then((data) => setIngredientes(data.data));
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

      <ListaPizzas />
      <ListaRepartidores />
      <ListaClientes />
      <ListaPedidos />
      <FormularioPedido />
    </div>
  );
}

export default App;