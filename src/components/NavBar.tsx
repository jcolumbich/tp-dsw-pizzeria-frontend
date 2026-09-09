import { Link } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        🍕 Pizzería
      </Link>
      <div className="navbar-links">
        <Link to="/ingredientes">Ingredientes</Link>
        <Link to="/pizzas">Pizzas</Link>
        <Link to="/repartidores">Repartidores</Link>
        <Link to="/clientes">Clientes</Link>
        <Link to="/pedidos">Pedidos</Link>
      </div>
    </nav>
  );
}

export default NavBar;