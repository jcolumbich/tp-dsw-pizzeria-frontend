import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { UsuarioLogueado } from '../interfaces/auth';
import { login as loginService } from '../services/authService';
import { setAuthToken } from '../services/httpCliente';

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

  const login = async (email: string, contrasenia: string) => {
    const resultado = await loginService(email, contrasenia); setAuthToken(resultado.token);setToken(resultado.token);setUsuario(resultado.usuario);

    return resultado.usuario;
  };

  const logout = () => {setAuthToken(null);setToken(null);setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{usuario,token,cargandoSesion: false,login,logout,}}
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