import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import type { Pizza } from '../../interfaces/pizza';
import { getPizzas } from '../../services/pizzaService';

export default function Inicio() {
  const portadaRef = useRef<HTMLDivElement>(null);
  const { usuario } = useAuth();
  const { hash } = useLocation();

  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [cargando, setCargando] = useState(Boolean(usuario));
  const [error, setError] = useState(false);

  const destinoPedido = usuario ? '/pedidos/nuevo' : '/login';

  useEffect(() => {
    if (hash !== '#carta') return;

    const frame = requestAnimationFrame(() => {
      document.getElementById('carta')?.scrollIntoView({
        behavior: 'smooth',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [hash]);

  useEffect(() => {
    const portada = portadaRef.current;
    if (!portada || !('IntersectionObserver' in window)) return;

    const elementos =
      portada.querySelectorAll<HTMLElement>('.inicio-revelar');

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('inicio-visible');
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elementos.forEach((elemento) => observador.observe(elemento));
    portada.classList.add('inicio-con-animaciones');

    return () => observador.disconnect();
  }, [pizzas]);

  useEffect(() => {
    if (!usuario) return;

    let activo = true;

    getPizzas()
      .then((lista) => {
        if (activo) {
          setPizzas(lista.filter((pizza) => pizza.disponible));
        }
      })
      .catch(() => {
        if (activo) setError(true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [usuario]);

  return (
    <div className="inicio" ref={portadaRef}>
      <section className="inicio-hero" aria-labelledby="inicio-titulo">
        <div className="inicio-hero-copy">
          <p className="inicio-eyebrow">PIZZERÍA DUE PAFFUTELLI</p>

          <h1 id="inicio-titulo">
            El momento perfecto<br />para una pizza.
          </h1>

          <p className="inicio-intro">
            Elegí tu favorita, armá tu pedido y disfrutá de Due Paffutelli.
          </p>

          <div className="inicio-acciones">
            <a className="inicio-boton inicio-boton-claro" href="#carta">
              Ver la carta <span aria-hidden="true">↗</span>
            </a>

            <Link
              className="inicio-boton inicio-boton-contorno"
              to={destinoPedido}
            >
              Hacer un pedido <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div
          className="inicio-imagen inicio-imagen-hero"
          aria-label="Espacio reservado para la foto principal"
        >
          <span>Tu foto principal va acá</span>
          <small>Imagen horizontal · pizza o local</small>
        </div>

        <span className="inicio-hero-numero" aria-hidden="true">
          01 / DUE PAFFUTELLI
        </span>
      </section>

      <section
        className="inicio-presentacion inicio-revelar"
        id="nosotros"
      >
        <div className="inicio-presentacion-titulo">
          <p className="inicio-eyebrow">BIENVENIDOS</p>
          <h2>Una pizza siempre es un buen plan.</h2>
        </div>

        <div className="inicio-presentacion-texto">
          <p>
            En Due Paffutelli, cada pedido empieza con una elección simple:
            encontrar esa pizza que tenés ganas de compartir.
          </p>

          <a href="#carta" className="inicio-link">
            Explorá nuestras pizzas <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section
        className="inicio-carta"
        id="carta"
        aria-labelledby="carta-titulo"
      >
        <div className="inicio-seccion-encabezado inicio-revelar">
          <div>
            <p className="inicio-eyebrow">NUESTRA CARTA</p>
            <h2 id="carta-titulo">Elegí tu próxima favorita.</h2>
          </div>

          <Link to={destinoPedido} className="inicio-link">
            Ir a pedidos <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {!usuario ? (
          <div className="inicio-carta-aviso">
            <p>Iniciá sesión para ver las pizzas disponibles y sus precios.</p>

            <Link className="inicio-boton inicio-boton-vino" to="/login">
              Iniciar sesión <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : cargando ? (
          <p className="inicio-estado">Cargando carta...</p>
        ) : error ? (
          <p className="inicio-estado" role="alert">
            No pudimos cargar la carta. Intentá de nuevo más tarde.
          </p>
        ) : pizzas.length === 0 ? (
          <p className="inicio-estado">
            Por ahora no hay pizzas disponibles.
          </p>
        ) : (
          <div className="inicio-pizzas">
            {pizzas.map((pizza, index) => (
              <article
                className="inicio-pizza inicio-revelar"
                key={pizza.id}
              >
                <div
                  className="inicio-imagen inicio-imagen-pizza"
                  aria-label={`Espacio reservado para la foto de ${pizza.nombre}`}
                >
                  <span>Foto de {pizza.nombre}</span>
                </div>

                <div className="inicio-pizza-detalle">
                  <span className="inicio-pizza-indice">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <h3>{pizza.nombre}</h3>

                  {pizza.vegetariana && (
                    <span className="inicio-etiqueta">Vegetariana</span>
                  )}

                  <p>
                    ${Number(pizza.precio).toLocaleString('es-AR')}
                  </p>

                  <Link
                    to="/pedidos/nuevo"
                    aria-label={`Pedir ${pizza.nombre}`}
                    className="inicio-pizza-link"
                  >
                    Pedir <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="inicio-invitacion inicio-revelar">
        <div
          className="inicio-imagen inicio-imagen-invitacion"
          aria-label="Espacio reservado para una foto secundaria"
        >
          <span>Tu segunda foto va acá</span>
          <small>Imagen del local o de una pizza</small>
        </div>

        <div className="inicio-invitacion-copy">
          <p className="inicio-eyebrow">¿YA ELEGISTE?</p>
          <h2>Tu próxima pizza te espera.</h2>

          <p>
            Hacé tu pedido en unos pasos y consultá su estado desde tu cuenta.
          </p>

          <Link
            className="inicio-boton inicio-boton-claro"
            to={destinoPedido}
          >
            Hacer un pedido <span aria-hidden="true">→</span>
          </Link>

          {usuario?.nivel_permisos === 0 && (
            <Link
              className="inicio-link inicio-link-claro"
              to="/mis-pedidos"
            >
              Ver mis pedidos ↗
            </Link>
          )}
        </div>
      </section>

      <footer className="inicio-footer">
        <strong>Due Paffutelli</strong>
        <span>Hecho para disfrutar una buena pizza.</span>
        <a href="#inicio-titulo">Volver arriba ↑</a>
      </footer>
    </div>
  );
}