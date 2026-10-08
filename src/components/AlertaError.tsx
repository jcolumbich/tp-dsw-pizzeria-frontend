import type { ReactNode } from 'react';
import { IconoAlerta } from './iconos';

interface AlertaErrorProps {
  mensaje: string;
  titulo?: string;
  className?: string;
  accion?: ReactNode;
}

export default function AlertaError({
  mensaje,
  titulo = 'No pudimos confirmar tu pedido',
  className = '',
  accion,
}: AlertaErrorProps) {
  return (
    <div className={`alerta alerta--error ${className}`.trim()} role="alert">
      <IconoAlerta className="icono alerta__icono" />
      <div>
        <p className="alerta__titulo">{titulo}</p>
        <p className="alerta__mensaje">{mensaje}</p>
        {accion && <p className="alerta__accion">{accion}</p>}
      </div>
    </div>
  );
}
