import type { Paginacion as DatosPaginacion } from '../interfaces/listado';
import './paginacion.css';
interface Props {
  datos?: DatosPaginacion;
  cambiarPagina: (pagina: number) => void;
  deshabilitada?: boolean;
  etiqueta?: string;
}
export default function Paginacion({ datos, cambiarPagina, deshabilitada = false, etiqueta = 'Paginación' }: Props) {
  if (!datos) return null;
  const { pagina, limite, total, totalPaginas } = datos;
  const inicio = (pagina - 1) * limite;
  return (
    <nav className="paginacion-listado" aria-label={etiqueta}>
      <span role="status">{total === 0 ? 'Sin resultados' : inicio >= total ? 'Esta página ya no tiene resultados' :
        `Mostrando ${inicio + 1}–${Math.min(inicio + limite, total)} de ${total}`}</span>
      <div>
        <button type="button" disabled={deshabilitada || pagina <= 1}
          onClick={() => cambiarPagina(Math.min(pagina - 1, totalPaginas))}>Anterior</button>
        <span>Página {pagina} de {totalPaginas}</span>
        <button type="button" disabled={deshabilitada || pagina >= totalPaginas}
          onClick={() => cambiarPagina(pagina + 1)}>Siguiente</button>
      </div>
    </nav>
  );
}
