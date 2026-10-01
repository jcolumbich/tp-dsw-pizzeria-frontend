import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IngredientesList from './IngredientesList';
import { getIngredientes } from '../../services/ingredienteService';
import type { Ingrediente } from '../../interfaces/ingrediente';

vi.mock('../../services/ingredienteService', () => ({
  getIngredientes: vi.fn(),
  crearIngrediente: vi.fn(),
  actualizarIngrediente: vi.fn(),
  eliminarIngrediente: vi.fn(),
}));

describe('IngredientesList', () => {
  it('muestra los ingredientes devueltos por el servicio', async () => {
    const ingredientesDePrueba: Ingrediente[] = [
      { id: 1, nombre: 'Muzzarella de prueba', stock: 10 },
      { id: 2, nombre: 'Jamón de prueba', stock: 5 },
    ];
    vi.mocked(getIngredientes).mockResolvedValue(ingredientesDePrueba);

    render(<IngredientesList />);

    expect(await screen.findByText('Muzzarella de prueba')).toBeInTheDocument();
    expect(await screen.findByText('Jamón de prueba')).toBeInTheDocument();
  });
});
