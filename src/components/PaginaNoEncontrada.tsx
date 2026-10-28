import { Link } from 'react-router-dom';
import './paginaNoEncontrada.css';

export default function PaginaNoEncontrada() {
  return (
    <section className="pagina-404" aria-labelledby="titulo-404">
      <div className="pagina-404__contenido">
        <span className="pagina-404__numero" aria-hidden="true">404</span>
        <span className="pagina-404__etiqueta">NOS PERDIMOS EN EL CAMINO</span>
        <h1 id="titulo-404">Esta página no está en el menú.</h1>
        <p>Puede que la dirección haya cambiado o que el enlace esté mal escrito.</p>
        <Link className="pagina-404__volver" to="/">Volver al inicio</Link>
      </div>
    </section>
  );
}
