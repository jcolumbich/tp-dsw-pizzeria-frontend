import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
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
import RegistroForm from './views/auth/RegistroForm';
import RutaProtegida from './components/RutaProtegida';
import { useAuth } from './context/authContext';
import Inicio from './views/inicio/Inicio';
import logo from './assets/logo.png';
import './App.css';
import './Inicio.css';

function App() {
  const { usuario, logout } = useAuth();
  const [menuOculto, setMenuOculto] = useState(false);
  const ultimaPosicion = useRef(0);

  useEffect(() => {
    ultimaPosicion.current = window.scrollY;

    const alDesplazarse = () => {
      const posicionActual = window.scrollY;
      const diferencia = posicionActual - ultimaPosicion.current;

      if (posicionActual < 60) {
        setMenuOculto(false);
      } else if (Math.abs(diferencia) > 2) {
        setMenuOculto(diferencia > 0);
      }

      ultimaPosicion.current = posicionActual;
    };

    const alUsarRueda = (evento: WheelEvent) => {
      if (window.scrollY < 60) return;
      if (evento.deltaY > 2) setMenuOculto(true);
      if (evento.deltaY < -2) setMenuOculto(false);
    };

    window.addEventListener('scroll', alDesplazarse, { passive: true });
    window.addEventListener('wheel', alUsarRueda, { passive: true });

    return () => {
      window.removeEventListener('scroll', alDesplazarse);
      window.removeEventListener('wheel', alUsarRueda);
    };
  }, []);

  return (
    <BrowserRouter>
      <nav
        className="navbar"
        style={{
          transform: menuOculto
            ? 'translate3d(0, -110%, 0)'
            : 'translate3d(0, 0, 0)',
          transition: 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
      >
        <NavLink to="/" className="navbar-logo" aria-label="Due Paffutelli - Inicio">
          <img src={logo} alt="Due Paffutelli" className="navbar-logo-img" />
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Inicio
          </NavLink>

          <Link
            to="/#carta"
            onClick={() =>
              document.getElementById('carta')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Carta
          </Link>

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

              {usuario.nivel_permisos === 0 && (
                <>
                  <NavLink
                    to="/pedidos/nuevo"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    Nuevo Pedido
                  </NavLink>
                  <NavLink
                    to="/mis-pedidos"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    Mis Pedidos
                  </NavLink>
                </>
              )}

              <button className="navbar-salir" onClick={logout}>
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

            <Route path="/registro" element={<RegistroForm />} />

            <Route path="/" element={<Inicio />} />

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
                  {usuario?.nivel_permisos === 0 ? (
                    <CrearPedidoForm />
                  ) : (
                    <Navigate to="/pedidos" replace />
                  )}
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