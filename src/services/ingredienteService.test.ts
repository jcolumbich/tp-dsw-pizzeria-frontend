import { afterEach, describe, expect, it, vi } from 'vitest';
import { eliminarIngrediente } from './ingredienteService';
afterEach(() => vi.unstubAllGlobals());
describe('mensajes de negocio del backend', () => {
  it('muestra el motivo del 409 al intentar borrar un ingrediente utilizado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Forma parte de una receta' }), { status: 409, headers: { 'Content-Type': 'application/json' } })));
    await expect(eliminarIngrediente(1)).rejects.toThrow('Forma parte de una receta');
  });
});