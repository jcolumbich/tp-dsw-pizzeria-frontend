import { IconoMas, IconoMenos } from './iconos';

interface ControlCantidadProps {
  cantidad: number;
  nombre: string;
  onCambiar: (delta: number) => void;
  deshabilitado?: boolean;
  max?: number;
}

export default function ControlCantidad({
  cantidad,
  nombre,
  onCambiar,
  deshabilitado = false,
  max = 100,
}: ControlCantidadProps) {
  if (cantidad === 0) {
    return (
      <button
        type="button"
        className="btn btn--secundario btn--s"
        onClick={() => onCambiar(1)}
        disabled={deshabilitado}
        aria-label={deshabilitado ? `${nombre} no está disponible` : `Agregar ${nombre} al pedido`}
      >
        <IconoMas />
        Agregar
      </button>
    );
  }

  return (
    <div className="stepper" role="group" aria-label={`Cantidad de ${nombre}`}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onCambiar(-1)}
        disabled={deshabilitado}
        aria-label={`Quitar una ${nombre}`}
      >
        <IconoMenos />
      </button>
      <output className="stepper__valor" aria-live="polite">
        {cantidad}
      </output>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onCambiar(1)}
        disabled={deshabilitado || cantidad >= max}
        aria-label={`Agregar una ${nombre}`}
      >
        <IconoMas />
      </button>
    </div>
  );
}
