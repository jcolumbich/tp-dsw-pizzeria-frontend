import "./App.css";
import ListaIngredientes from "./components/ListaIngredientes";
import ListaPizzas from "./components/ListaPizzas";
import ListaRepartidores from "./components/ListaRepartidores";
import ListaClientes from "./components/ListaClientes";
import ListaPedidos from "./components/ListaPedidos";
import FormularioPedido from "./components/FormularioPedido";

function App() {
  return (
    <div>
      <ListaIngredientes />
      <ListaPizzas />
      <ListaRepartidores />
      <ListaClientes />
      <ListaPedidos />
      <FormularioPedido />
    </div>
  );
}

export default App;