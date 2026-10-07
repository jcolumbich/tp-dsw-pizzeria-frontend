import { Fragment, type ReactNode } from 'react';

export interface OpcionSegmentada<T extends string> {
  valor: T;
  etiqueta: string;
  describedBy?: string;
}

interface SelectorSegmentadoProps<T extends string> {
  nombre: string;
  leyenda: string;
  opciones: readonly [OpcionSegmentada<T>, OpcionSegmentada<T>];
  valorSeleccionado: T;
  onCambiar: (valor: T) => void;
  deshabilitado?: boolean;
  children?: ReactNode;
}

export default function SelectorSegmentado<T extends string>({
  nombre,
  leyenda,
  opciones,
  valorSeleccionado,
  onCambiar,
  deshabilitado = false,
  children,
}: SelectorSegmentadoProps<T>) {
  return (
    <fieldset className="modalidad" disabled={deshabilitado}>
      <legend className="modalidad__titulo">{leyenda}</legend>
      <div className="segmented">
        {opciones.map((opcion) => {
          const id = `${nombre}-${opcion.valor}`;
          return (
            <Fragment key={opcion.valor}>
              <input
                className="segmented__input"
                type="radio"
                name={nombre}
                id={id}
                value={opcion.valor}
                checked={valorSeleccionado === opcion.valor}
                onChange={() => onCambiar(opcion.valor)}
                aria-describedby={opcion.describedBy}
              />
              <label className="segmented__opcion" htmlFor={id}>
                {opcion.etiqueta}
              </label>
            </Fragment>
          );
        })}
      </div>
      {children}
    </fieldset>
  );
}
