import { useCallback, useEffect, useState } from 'react';
import type { Pagina } from '../interfaces/listado';

// Cada consulta tiene su propio AbortController. Una respuesta anterior nunca
// reemplaza resultados de una búsqueda más reciente, aunque el servidor tarde.
export function useListado<T, F extends { pagina?: number; limite?: number }>(
  obtener: (filtros: F, signal?: AbortSignal) => Promise<Pagina<T>>,
  filtros: F,
) {
  const clave = JSON.stringify(filtros);
  const [version, setVersion] = useState(0);
  const [resultado, setResultado] = useState<{
    clave: string; version: number; pagina?: Pagina<T>; error?: string;
  } | null>(null);
  const recargar = useCallback(() => setVersion(valor => valor + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    obtener(JSON.parse(clave) as F, controller.signal)
      .then(pagina => {
        if (!controller.signal.aborted) setResultado({ clave, version, pagina });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResultado({
          clave, version, error: error instanceof Error ? error.message : 'No se pudo cargar el listado',
        });
      });
    return () => controller.abort();
  }, [obtener, clave, version]);
  const vigente = resultado?.clave === clave && resultado.version === version;
  return {
    data: vigente ? resultado.pagina?.data ?? [] : [],
    paginacion: vigente ? resultado.pagina?.paginacion : undefined,
    cargando: !vigente,
    error: vigente ? resultado.error ?? null : null,
    recargar,
  };
}
