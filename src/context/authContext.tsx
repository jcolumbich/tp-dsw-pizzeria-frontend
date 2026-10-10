import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { login as loginService } from '../services/authService';
import { setAuthToken } from '../services/httpCliente';
import { AuthContext } from './authState.ts';
import { guardarSesion, leerSesionGuardada, limpiarSesiones, vencimientoToken } from './sesion.ts';
import type { Sesion } from './sesion.ts';
export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(() => {
    const guardada = leerSesionGuardada();
    setAuthToken(guardada?.token ?? null);
    return guardada;
  });
  const login = async (email: string, contrasenia: string, recordar = false) => {
    const resultado = await loginService(email, contrasenia);
    const nueva = { token: resultado.token, usuario: resultado.usuario };
    guardarSesion(nueva, recordar);
    setAuthToken(nueva.token);
    setSesion(nueva);
    return nueva.usuario;
  };
  const logout = () => {
    limpiarSesiones();
    setAuthToken(null);
    setSesion(null);
  };
  useEffect(() => {
    const cerrarSesion = () => {
      limpiarSesiones();
      setAuthToken(null);
      setSesion(null);
    };
    window.addEventListener('sesion-expirada', cerrarSesion);
    const vencimiento = sesion ? vencimientoToken(sesion.token) : null;
    const temporizador = vencimiento === null ? undefined
      : window.setTimeout(cerrarSesion, Math.max(0, vencimiento - Date.now()));
    return () => {
      window.removeEventListener('sesion-expirada', cerrarSesion);
      if (temporizador !== undefined) window.clearTimeout(temporizador);
    };
  }, [sesion]);
  return (
    <AuthContext.Provider value={{ usuario: sesion?.usuario ?? null, token: sesion?.token ?? null, cargandoSesion: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}