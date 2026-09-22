import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UsuarioLogueado } from '../interfaces/auth';
import { login as loginService } from '../services/authService';

interface AuthContextType {
  usuario: UsuarioLogueado | null;
  token: string | null;
  cargandoSesion: boolean;
  login: (email: string, contrasenia: string) => Promise<UsuarioLogueado>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogueado | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (tokenGuardado && usuarioGuardado) {
      try {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }

    setCargandoSesion(false);
  }, []);

    const login = async (email: string, contrasenia: string) => {
    const resultado = await loginService(email, contrasenia);
    setToken(resultado.token);
    setUsuario(resultado.usuario);
    localStorage.setItem('token', resultado.token);
    localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
    return resultado.usuario;
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, cargandoSesion, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
}