import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CrearPedidoForm from './crearPedidoForm';
import { crearPedido, obtenerTarifaEnvio } from '../../services/pedidoService';
import { getPizzas } from '../../services/pizzaService';
import type { Pedido } from '../../interfaces/pedido';
vi.mock('../../context/useAuth', () => ({ useAuth: () => ({ usuario: { id: 1 } }) }));
vi.mock('../../services/pedidoService', () => ({ crearPedido: vi.fn(), obtenerTarifaEnvio: vi.fn() }));
vi.mock('../../services/pizzaService', () => ({ getPizzas: vi.fn(), obtenerUrlImagenPizza: () => null }));
vi.mock('../../components/PagoMercadoPago', () => ({ default: () => <p>Estado del pago</p> }));
const pizza = { id: 1, nombre: 'Muzzarella', precio: 1000, disponible: true, vegetariana: true };
const pedido: Pedido = { id: 8, dia: '2026-10-23', retiro: false, total: 1000, estado: 'Pendiente', costo_envio: 200, medio_pago: 'efectivo', detalles: [{ pizza, cantidad: 1, precio_unitario: 1000 }] };
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getPizzas).mockResolvedValue([pizza]);
  vi.mocked(obtenerTarifaEnvio).mockResolvedValue(200);
  vi.mocked(crearPedido).mockResolvedValue(pedido);
});
afterEach(cleanup);
async function montar() {
  render(<MemoryRouter><CrearPedidoForm /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: 'Agregar Muzzarella al pedido' }));
}
describe('compra con medio de pago elegido al inicio', () => {
  it.each([false, true])('efectivo, retiro=%s: envía el medio y muestra confirmación', async retiro => {
    await montar();
    if (retiro) fireEvent.click(screen.getByLabelText('Retiro en el local'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar pedido en efectivo/ }));
    await screen.findByText('¡Listo! Ya tenemos tu pedido');
    expect(crearPedido).toHaveBeenCalledWith(expect.objectContaining({ retiro, medio_pago: 'efectivo', costo_envio: retiro ? 0 : 200, checkout_id: expect.any(String) }));
  });
  it.each([false, true])('Mercado Pago, retiro=%s: inicia el pago y no muestra pedido confirmado', async retiro => {
    vi.mocked(crearPedido).mockResolvedValue({ ...pedido, medio_pago: 'mercadopago', estado: 'Esperando pago' });
    await montar();
    if (retiro) fireEvent.click(screen.getByLabelText('Retiro en el local'));
    fireEvent.click(screen.getByLabelText('Tarjeta / Mercado Pago'));
    fireEvent.click(screen.getByRole('button', { name: /Ir a pagar con Mercado Pago/ }));
    await waitFor(() => expect(crearPedido).toHaveBeenCalledTimes(1));
    expect(crearPedido).toHaveBeenCalledWith(expect.objectContaining({ retiro, medio_pago: 'mercadopago', costo_envio: retiro ? 0 : 200 }));
    expect(screen.queryByText('¡Listo! Ya tenemos tu pedido')).not.toBeInTheDocument();
  });
  it('si se pierde la respuesta, reintenta la misma clave sin cambiar la compra', async () => {
    vi.mocked(crearPedido).mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValue(pedido);
    await montar();
    fireEvent.click(screen.getByRole('button', { name: /Confirmar pedido en efectivo/ }));
    const boton = await screen.findByRole('button', { name: /Reintentar esta compra/ });
    const original = vi.mocked(crearPedido).mock.calls[0][0];
    fireEvent.click(boton);
    await screen.findByText('¡Listo! Ya tenemos tu pedido');
    expect(crearPedido).toHaveBeenLastCalledWith(original);
  });
});
