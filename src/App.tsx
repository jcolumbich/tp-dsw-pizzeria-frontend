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
import DetalleIngrediente from "./components/DetalleIngrediente";
import DetalleRepartidor from "./components/DetalleRepartidor";
import DetalleCliente from "./components/DetalleCliente";
import FormularioPizza from "./components/FormularioPizza";
import FormularioIngrediente from "./components/FormularioIngrediente";
import FormularioRepartidor from "./components/FormularioRepartidor";
import FormularioCliente from "./components/FormularioCliente";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<h1>Bienvenido a la Pizzería</h1>} />

        <Route path="/pizzas/:id" element={<DetallePizza />} />
        <Route
          path="/pizzas"
          element={
            <>
              <ListaPizzas />
              <FormularioPizza />
            </>
          }
        />

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

        <Route path="/ingredientes/:id" element={<DetalleIngrediente />} />
        <Route
          path="/ingredientes"
          element={
            <>
              <ListaIngredientes />
              <FormularioIngrediente />
            </>
          }
        />

        <Route path="/repartidores/:id" element={<DetalleRepartidor />} />
        <Route
          path="/repartidores"
          element={
            <>
              <ListaRepartidores />
              <FormularioRepartidor />
            </>
          }
        />

        <Route path="/clientes/:id" element={<DetalleCliente />} />
        <Route
          path="/clientes"
          element={
            <>
              <ListaClientes />
              <FormularioCliente />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;