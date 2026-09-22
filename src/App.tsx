import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import IngredientesList from './views/ingrediente/IngredientesList';
import RepartidorList from './views/repartidor/repartidorList';
import PizzaList from './views/pizza/pizzaList';
import PizzaDetalle from './views/pizza/pizzaDetalle';
import CrearPedidoForm from './views/pedido/crearPedidoForm';
import PedidoList from './views/pedido/pedidoList';
import PedidoDetalle from './views/pedido/pedidoDetalle';
import MisPedidos from './views/pedido/misPedidos';
import MiPedidoDetalle from './views/pedido/miPedidoDetalle';
import ClienteList from './views/cliente/clienteList';
import LoginForm from './views/auth/LoginForm';
import RutaProtegida from './components/RutaProtegida';
import { useAuth } from './context/authContext';
import logo from './assets/logo.png';
import './App.css';

function App() {
  const { usuario, logout } = useAuth();

  return (
    <BrowserRouter>
      <nav className="navbar">
        <NavLink to="/" className="navbar-logo">
          <img
            src={logo}
            alt="Pizzería Due Paffutelli"
            className="navbar-logo-img"
          />
          Due Paffutelli
        </NavLink>

        <div className="navbar-links">
          {usuario ? (
            <>
              {usuario.nivel_permisos >= 1 && (
                <>
                  <NavLink
                    to="/ingredientes"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    Ingredientes
                  </NavLink>

                  <NavLink
                    to="/repartidores"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    Repartidores
                  </NavLink>

                  <NavLink
                    to="/pizzas"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    Pizzas
                  </NavLink>

                  <NavLink
                    to="/clientes"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    Clientes
                  </NavLink>

                  <NavLink
                    to="/pedidos"
                    end
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    Pedidos
                  </NavLink>
                </>
              )}

              <NavLink
                to="/pedidos/nuevo"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Nuevo Pedido
              </NavLink>

              {usuario.nivel_permisos === 0 && (
                <NavLink
                  to="/mis-pedidos"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Mis Pedidos
                </NavLink>
              )}

              <button
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Salir ({usuario.nombre})
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Iniciar sesión
            </NavLink>
          )}
        </div>
      </nav>

      <main className="app-container">
        <section>
          <Routes>
            <Route path="/login" element={<LoginForm />} />

            <Route
              path="/"
              element={
                <RutaProtegida nivelRequerido={0}>
                  {(usuario?.nivel_permisos ?? 0) >= 1 ? <IngredientesList /> : <MisPedidos />}
                </RutaProtegida>
              }
            />

            <Route
              path="/ingredientes"
              element={
                <RutaProtegida nivelRequerido={1}>
                  <IngredientesList />
                </RutaProtegida>
              }
            />

            <Route
              path="/repartidores"
              element={
                <RutaProtegida nivelRequerido={1}>
                  <RepartidorList />
                </RutaProtegida>
              }
            />

            <Route
              path="/pizzas"
              element={
                <RutaProtegida nivelRequerido={1}>
                  <PizzaList />
                </RutaProtegida>
              }
            />

            <Route
              path="/pizzas/:id"
              element={
                <RutaProtegida nivelRequerido={1}>
                  <PizzaDetalle />
                </RutaProtegida>
              }
            />

            <Route
              path="/clientes"
              element={
                <RutaProtegida nivelRequerido={1}>
                  <ClienteList />
                </RutaProtegida>
              }
            />

            <Route
              path="/pedidos/nuevo"
              element={
                <RutaProtegida nivelRequerido={0}>
                  <CrearPedidoForm />
                </RutaProtegida>
              }
            />

            <Route
              path="/mis-pedidos"
              element={
                <RutaProtegida nivelRequerido={0}>
                  <MisPedidos />
                </RutaProtegida>
              }
            />

            <Route
              path="/mis-pedidos/:id"
              element={
                <RutaProtegida nivelRequerido={0}>
                  <MiPedidoDetalle />
                </RutaProtegida>
              }
            />

            <Route
              path="/pedidos"
              element={
                <RutaProtegida nivelRequerido={1}>
                  <PedidoList />
                </RutaProtegida>
              }
            />

            <Route
              path="/pedidos/:id"
              element={
                <RutaProtegida nivelRequerido={1}>
                  <PedidoDetalle />
                </RutaProtegida>
              }
            />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  );
}

export default App;