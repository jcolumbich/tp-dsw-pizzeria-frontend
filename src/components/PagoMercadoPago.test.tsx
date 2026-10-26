import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PagoMercadoPago from './PagoMercadoPago';
import { obtenerEstadoPago, verificarPago } from '../services/pagoService';
vi.mock('../services/pagoService', () => ({ obtenerEstadoPago: vi.fn(), verificarPago: vi.fn() }));
const esperando = { estado: 'sin_pagar', importe: 130, puedePagar: false, estadoPedido: 'Esperando pago', medioPago: 'mercadopago' as const, retiro: false };
beforeEach(() => { vi.resetAllMocks(); vi.mocked(obtenerEstadoPago).mockResolvedValue(esperando); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe('estado de pago de solo lectura', () => {
  it('no muestra botones para pagar ni actualizar después de comprar', async () => {
    render(<MemoryRouter><PagoMercadoPago pedidoId={5} /></MemoryRouter>);
    expect(await screen.findByText(/El pedido todavía no está confirmado/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('no interpreta status=approved en la URL como un pago aprobado', async () => {
    render(<MemoryRouter initialEntries={['/mis-pedidos/5?status=approved']}><PagoMercadoPago pedidoId={5} /></MemoryRouter>);
    expect(await screen.findByText(/El pedido todavía no está confirmado/)).toBeInTheDocument();
    expect(verificarPago).not.toHaveBeenCalled();
  });
  it('comprueba el ID del retorno con el servidor y notifica el nuevo estado', async () => {
    const aprobado = { ...esperando, estado: 'aprobado', estadoPedido: 'Pendiente' };
    vi.mocked(verificarPago).mockResolvedValue(aprobado);
    vi.mocked(obtenerEstadoPago).mockResolvedValue(aprobado);
    const cambio = vi.fn();
    render(<MemoryRouter initialEntries={['/mis-pedidos/5?payment_id=123']}><PagoMercadoPago pedidoId={5} onEstadoPedido={cambio} /></MemoryRouter>);
    expect(await screen.findByText('Pago aprobado')).toBeInTheDocument();
    expect(verificarPago).toHaveBeenCalledWith(5, '123');
    expect(cambio).toHaveBeenCalledWith('Pendiente');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('consulta automáticamente hasta que llega la aprobación', async () => {
    vi.useFakeTimers();
    vi.mocked(obtenerEstadoPago).mockResolvedValueOnce(esperando).mockResolvedValue({ ...esperando, estado: 'aprobado', estadoPedido: 'Pendiente' });
    await act(async () => { render(<MemoryRouter><PagoMercadoPago pedidoId={5} /></MemoryRouter>); });
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(screen.getByText('Pago aprobado')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(obtenerEstadoPago).toHaveBeenCalledTimes(2);
  });
  it('el pedido 33 no usa más el ID de pago del diagnóstico temporal', async () => {
    render(<MemoryRouter><PagoMercadoPago pedidoId={33} /></MemoryRouter>);
    await screen.findByText(/El pedido todavía no está confirmado/);
    expect(verificarPago).not.toHaveBeenCalled();
  });
});

it('muestra el pago guardado aunque falle la comprobación del retorno', async () => {
  vi.mocked(verificarPago).mockRejectedValue(new Error('Proveedor temporalmente caído'));
  vi.mocked(obtenerEstadoPago).mockResolvedValue({ ...esperando, estado: 'aprobado', estadoPedido: 'Pendiente' });
  render(<MemoryRouter initialEntries={['/mis-pedidos/5?payment_id=123']}><PagoMercadoPago pedidoId={5} /></MemoryRouter>);
  expect(await screen.findByText('Pago aprobado')).toBeInTheDocument();
});
it('reintenta el retorno fallido mientras el pedido espera aprobación', async () => {
  vi.useFakeTimers();
  vi.mocked(verificarPago).mockRejectedValueOnce(new Error('Temporal')).mockResolvedValue(esperando);
  await act(async () => { render(<MemoryRouter initialEntries={['/mis-pedidos/5?payment_id=123']}><PagoMercadoPago pedidoId={5} /></MemoryRouter>); });
  await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
  expect(verificarPago).toHaveBeenCalledTimes(2);
});
