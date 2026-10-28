import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import './detalleRegistro.css';

interface CampoDetalle {
  etiqueta: string;
  valor: string | number | null | undefined;
}

interface Props {
  titulo: string;
  subtitulo: string;
  campos: CampoDetalle[];
  onCerrar: () => void;
}

export default function DetalleRegistro({ titulo, subtitulo, campos, onCerrar }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  const subtituloId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const elementoAnterior = document.activeElement;
    dialog?.showModal();

    return () => {
      dialog?.close();
      if (elementoAnterior instanceof HTMLElement && elementoAnterior.isConnected) {
        elementoAnterior.focus();
      }
    };
  }, []);

  return createPortal(
    <dialog ref={dialogRef} className="detalle-registro" aria-labelledby={tituloId}
      aria-describedby={subtituloId} onCancel={(event) => {
        event.preventDefault();
        onCerrar();
      }}>
      <header className="detalle-registro__cabecera">
        <div>
          <span className="detalle-registro__etiqueta">CONSULTA DE DATOS</span>
          <h2 id={tituloId}>{titulo}</h2>
          <p id={subtituloId}>{subtitulo}</p>
        </div>
        <button type="button" className="detalle-registro__cruz" aria-label="Cerrar detalle" onClick={onCerrar}>×</button>
      </header>
      <dl className="detalle-registro__campos">
        {campos.map(({ etiqueta, valor }) => (
          <div key={etiqueta} className="detalle-registro__campo">
            <dt>{etiqueta}</dt>
            <dd>{valor === undefined || valor === null || valor === '' ? 'Sin informar' : valor}</dd>
          </div>
        ))}
      </dl>
      <footer className="detalle-registro__pie">
        <button type="button" onClick={onCerrar}>Cerrar</button>
      </footer>
    </dialog>,
    document.body,
  );
}