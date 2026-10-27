import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MisPedidos from './misPedidos';
import { getPedidos } from '../../services/pedidoService';
vi.mock('../../services/pedidoService', () => ({ getPedidos: vi.fn() }));
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getPedidos).mockResolvedValue({ data: [], paginacion: { pagina: 1, limite: 10, total: 0, totalPaginas: 1 } });
});
describe('filtros remotos de mis pedidos', () => {
  it('distingue Esperando pago y Pendiente y permite limpiar un filtro sin resultados', async () => {
    render(<MemoryRouter><MisPedidos /></MemoryRouter>);
    await screen.findByText('Todavía no hiciste ningún pedido');
    fireEvent.click(screen.getByLabelText('Esperando pago'));
    await screen.findByText('No tenés pedidos en ese estado');
    expect(getPedidos).toHaveBeenLastCalledWith({ pagina: 1, limite: 10, estado: 'Esperando pago' }, expect.any(AbortSignal));
    fireEvent.click(screen.getByLabelText('Pendiente'));
    await waitFor(() => expect(getPedidos).toHaveBeenLastCalledWith({ pagina: 1, limite: 10, estado: 'Pendiente' }, expect.any(AbortSignal)));
    fireEvent.click(await screen.findByRole('button', { name: 'Ver todos' }));
    await screen.findByText('Todavía no hiciste ningún pedido');
    expect(getPedidos).toHaveBeenLastCalledWith({ pagina: 1, limite: 10 }, expect.any(AbortSignal));
  });
});
