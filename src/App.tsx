import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar";
import ListaIngredientes from "./components/ListaIngredientes";
import ListaPizzas from "./components/ListaPizzas";
import ListaRepartidores from "./components/ListaRepartidores";
import ListaClientes from "./components/ListaClientes";
import ListaPedidos from "./components/ListaPedidos";
import FormularioPedido from "./components/FormularioPedido";
import FormularioEnvio from "./components/FormularioEnvio";
import DetallePizza from "./components/DetallePizza";
import DetallePedido from "./components/DetallePedido";


function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<h1>Bienvenido a la Pizzería</h1>} />
        <Route path="/ingredientes" element={<ListaIngredientes />} />
        <Route path="/pizzas" element={<ListaPizzas />} />
        <Route path="/pizzas/:id" element={<DetallePizza />} />
        <Route path="/repartidores" element={<ListaRepartidores />} />
        <Route path="/clientes" element={<ListaClientes />} />
        <Route path="/pedidos/:id" element={<DetallePedido />} />
        <Route
          path="/pedidos"
          element={
            <>
              <ListaPedidos />
              <FormularioPedido />
              <FormularioEnvio />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;