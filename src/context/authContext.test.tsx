import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './authContext';
import { useAuth } from './useAuth.ts';
import { guardarSesion, leerSesionGuardada } from './sesion.ts';
const usuario = { id: 1, nombre: 'Prueba', apellido: 'Prueba', email: 'prueba@example.com', nivel_permisos: 0 };
const token = (exp: number) => `${btoa('{}')}.${btoa(JSON.stringify({ exp }))}.firma`;
function EstadoSesion() {
  const { usuario: actual } = useAuth();
  return <p>{actual ? 'Sesión abierta' : 'Sesión cerrada'}</p>;
}
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear();
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-10T20:00:00Z'));
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe('sesiones vencidas', () => {
  it('elimina una sesión vencida antes de restaurarla al recargar', () => {
    guardarSesion({ token: token(Date.now() / 1000 - 1), usuario }, true);
    expect(leerSesionGuardada()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_usuario')).toBeNull();
  });
  it('un 401 limpia ambos almacenamientos y cierra la sesión sin recargar', () => {
    guardarSesion({ token: token(Date.now() / 1000 + 60), usuario }, true);
    render(<AuthProvider><EstadoSesion /></AuthProvider>);
    expect(screen.getByText('Sesión abierta')).toBeInTheDocument();
    act(() => window.dispatchEvent(new Event('sesion-expirada')));
    expect(screen.getByText('Sesión cerrada')).toBeInTheDocument();
    for (const storage of [localStorage, sessionStorage]) {
      expect(storage.getItem('auth_token')).toBeNull();
      expect(storage.getItem('auth_usuario')).toBeNull();
    }
  });
  it('cierra automáticamente la sesión cuando vence el JWT', () => {
    guardarSesion({ token: token(Date.now() / 1000 + 2), usuario }, false);
    render(<AuthProvider><EstadoSesion /></AuthProvider>);
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText('Sesión cerrada')).toBeInTheDocument();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });
});