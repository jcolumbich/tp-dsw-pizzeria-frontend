import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { UsuarioLogueado } from '../interfaces/auth';
import { login as loginService } from '../services/authService';
import { setAuthToken } from '../services/httpCliente';

interface AuthContextType {
  usuario: UsuarioLogueado | null;
  token: string | null;
  cargandoSesion: boolean;
  login: (email: string, contrasenia: string, recordar?: boolean) => Promise<UsuarioLogueado>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USUARIO_KEY = 'auth_usuario';

function limpiarStorages(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USUARIO_KEY);
}

function guardarSesion(token: string, usuario: UsuarioLogueado, recordar: boolean): void {
  limpiarStorages();
  const storage = recordar ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

function leerSesionGuardada(): { token: string; usuario: UsuarioLogueado } | null {
  for (const storage of [localStorage, sessionStorage]) {
    const token = storage.getItem(TOKEN_KEY);
    const usuarioJson = storage.getItem(USUARIO_KEY);
    if (token && usuarioJson) {
      try {
        return { token, usuario: JSON.parse(usuarioJson) as UsuarioLogueado };
      } catch {
        continue;
      }
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogueado | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    const sesion = leerSesionGuardada();
    if (sesion) {
      setAuthToken(sesion.token);
      setToken(sesion.token);
      setUsuario(sesion.usuario);
    }
    setCargandoSesion(false);
  }, []);

  const login = async (email: string, contrasenia: string, recordar: boolean = false) => {
    const resultado = await loginService(email, contrasenia);
    setAuthToken(resultado.token);
    setToken(resultado.token);
    setUsuario(resultado.usuario);
    guardarSesion(resultado.token, resultado.usuario, recordar);

    return resultado.usuario;
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUsuario(null);
    limpiarStorages();
  };

  return (
    <AuthContext.Provider
      value={{usuario,token,cargandoSesion,login,logout,}}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}