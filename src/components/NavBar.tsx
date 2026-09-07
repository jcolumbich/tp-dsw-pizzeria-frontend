import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav>
      <Link to="/">Inicio</Link> |{" "}
      <Link to="/ingredientes">Ingredientes</Link> |{" "}
      <Link to="/pizzas">Pizzas</Link> |{" "}
      <Link to="/repartidores">Repartidores</Link> |{" "}
      <Link to="/clientes">Clientes</Link> |{" "}
      <Link to="/pedidos">Pedidos</Link>
    </nav>
  );
}

export default NavBar;