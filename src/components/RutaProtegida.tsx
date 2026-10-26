import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
interface Props {
  children: ReactNode;
  nivelRequerido?: number;
}
export default function RutaProtegida({ children, nivelRequerido = 0 }: Props) {
  const location = useLocation();
  const { usuario, cargandoSesion } = useAuth();
  if (cargandoSesion) {
    return <p>Verificando sesión...</p>;
  }
  if (!usuario) {
    return <Navigate to="/login" state={{ volverA: location.pathname + location.search }} replace />;
  }
  if (usuario.nivel_permisos < nivelRequerido) {
    return <p>No tenés permisos para ver esta sección.</p>;
  }
  return <>{children}</>;
}