import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useListado } from './useListado';
import type { Pagina } from '../interfaces/listado';
afterEach(cleanup);
const pagina = (nombre: string): Pagina<string> => ({ data: [nombre], paginacion: { pagina: 1, limite: 10, total: 1, totalPaginas: 1 } });
describe('listado remoto', () => {
  it('cancela la búsqueda anterior y descarta su respuesta tardía', async () => {
    let resolverVieja!: (datos: Pagina<string>) => void;
    const obtener = vi.fn<(filtros: { pagina: number; busqueda: string }, signal?: AbortSignal) => Promise<Pagina<string>>>(() =>
      new Promise<Pagina<string>>(resolve => { resolverVieja = resolve; }));
    const { result, rerender } = renderHook(({ busqueda }) => useListado(obtener, { pagina: 1, busqueda }), {
      initialProps: { busqueda: 'vieja' },
    });
    const signalVieja = obtener.mock.calls[0][1];
    obtener.mockResolvedValueOnce(pagina('Nueva'));
    rerender({ busqueda: 'nueva' });
    await waitFor(() => expect(result.current.data).toEqual(['Nueva']));
    expect(signalVieja?.aborted).toBe(true);
    await act(async () => resolverVieja(pagina('Vieja')));
    expect(result.current.data).toEqual(['Nueva']);
  });
  it('permite reintentar un error y no conserva resultados de otra búsqueda', async () => {
    const obtener = vi.fn().mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(pagina('Juan'));
    const { result } = renderHook(() => useListado(obtener, { pagina: 1 }));
    await waitFor(() => expect(result.current.error).toBe('Sin conexión'));
    act(() => result.current.recargar());
    await waitFor(() => expect(result.current.data).toEqual(['Juan']));
    expect(result.current.error).toBeNull();
  });
});
