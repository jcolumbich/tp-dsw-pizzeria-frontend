import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ClienteList from './clienteList';
import { getClientes, eliminarCliente } from '../../services/clienteService';

vi.mock('../../services/clienteService', () => ({
  getClientes: vi.fn(),
  eliminarCliente: vi.fn(),
  actualizarCliente: vi.fn(),
}));

vi.mock('./crearClienteForm', () => ({
  default: () => null,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const cliente = {
  id: 42,
  nombre: 'José',
  apellido: 'Pérez',
  domicilio: 'Córdoba 123',
  estado: true,
  email: 'jose@example.com',
  nivel_permisos: 0,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('búsqueda y paginación remotas de clientes', () => {
  it('consulta otra página y reinicia a la primera al buscar; una búsqueda vacía conserva el buscador', async () => {
    vi.mocked(getClientes)
      .mockResolvedValueOnce({
        data: [{ ...cliente, id: 1, nombre: 'Ana' }],
        paginacion: { pagina: 1, limite: 10, total: 11, totalPaginas: 2 },
      })
      .mockResolvedValueOnce({
        data: [cliente],
        paginacion: { pagina: 2, limite: 10, total: 11, totalPaginas: 2 },
      })
      .mockResolvedValueOnce({
        data: [],
        paginacion: { pagina: 1, limite: 10, total: 0, totalPaginas: 1 },
      });

    render(<ClienteList />);

    await screen.findByText('Ana');

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByText('José');

    expect(getClientes).toHaveBeenLastCalledWith(
      { busqueda: '', pagina: 2, limite: 10 },
      expect.any(AbortSignal),
    );

    fireEvent.change(screen.getByLabelText('Buscar clientes'), {
      target: { value: 'inexistente' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await screen.findByText(/No hay coincidencias/);

    expect(getClientes).toHaveBeenLastCalledWith(
      { busqueda: 'inexistente', pagina: 1, limite: 10 },
      expect.any(AbortSignal),
    );
    expect(screen.getByRole('button', { name: 'Limpiar' })).toBeEnabled();
  });

  it('permite volver después de borrar el último registro de una página', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(eliminarCliente).mockResolvedValue();

    vi.mocked(getClientes)
      .mockResolvedValueOnce({
        data: [cliente],
        paginacion: { pagina: 1, limite: 10, total: 11, totalPaginas: 2 },
      })
      .mockResolvedValueOnce({
        data: [cliente],
        paginacion: { pagina: 2, limite: 10, total: 11, totalPaginas: 2 },
      })
      .mockResolvedValueOnce({
        data: [],
        paginacion: { pagina: 2, limite: 10, total: 10, totalPaginas: 1 },
      })
      .mockResolvedValueOnce({
        data: [cliente],
        paginacion: { pagina: 1, limite: 10, total: 10, totalPaginas: 1 },
      });

    render(<ClienteList />);

    await screen.findByText('José');

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByText('Página 2 de 2');

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    await screen.findByText('Esta página ya no tiene resultados');

    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));

    await waitFor(() =>
      expect(getClientes).toHaveBeenLastCalledWith(
        { busqueda: '', pagina: 1, limite: 10 },
        expect.any(AbortSignal),
      ),
    );
  });
});