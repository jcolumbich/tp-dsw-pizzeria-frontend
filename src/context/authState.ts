import { createContext } from 'react';
import type { UsuarioLogueado } from '../interfaces/auth';
export interface AuthContextType {
  usuario: UsuarioLogueado | null;
  token: string | null;
  cargandoSesion: boolean;
  login: (email: string, contrasenia: string, recordar?: boolean) => Promise<UsuarioLogueado>;
  logout: () => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);