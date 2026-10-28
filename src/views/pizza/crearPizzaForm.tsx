import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Pizza } from '../../interfaces/pizza';
import { crearPizza } from '../../services/pizzaService';
import { crearPizzaSchema } from '../../schemas/pizza.schema';
import './pizzaGestion.css';

interface Props {
  onPizzaCreada: (nueva: Pizza) => void;
}

export default function CrearPizzaForm({ onPizzaCreada }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('0');
  const [vegetariana, setVegetariana] = useState(false);
  const [disponible, setDisponible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagen, setImagen] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState('');
  const [arrastrando, setArrastrando] = useState(false);
  const entradasArrastre = useRef(0);
  const imagenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

  const handleSeleccionarImagen = (archivo: File | undefined) => {
    if (!archivo || submitting) return;
    setError(null);
    setImagen(null);
    setVistaPrevia('');
    if (archivo.type !== 'image/jpeg' && archivo.type !== 'image/png' && archivo.type !== 'image/webp') {
      setError('Seleccioná una imagen JPG, PNG o WebP.');
      if (imagenInputRef.current) imagenInputRef.current.value = '';
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5 MB.');
      if (imagenInputRef.current) imagenInputRef.current.value = '';
      return;
    }
    setImagen(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const resultado = crearPizzaSchema.safeParse({
      nombre,
      descripcion,
      precio: precio.trim() === '' ? undefined : Number(precio),
      vegetariana,
      disponible,
    });

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message ?? 'Revisá los datos ingresados');
      return;
    }

    if (!imagen) {
      setError('Seleccioná una imagen para la pizza.');
      return;
    }

    try {
      setSubmitting(true);
      const pizzaCreada = await crearPizza(resultado.data, imagen);
      setNombre('');
      setDescripcion('');
      setPrecio('0');
      setVegetariana(false);
      setDisponible(true);
      setImagen(null);
      setVistaPrevia('');
      if (imagenInputRef.current) imagenInputRef.current.value = '';
      onPizzaCreada(pizzaCreada);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la pizza.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crear-ingrediente-form pizza-form">
      <h3> + Agregar Nueva Pizza</h3>
      {error && <p className="form-error" role="alert"> {error}</p>}

      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className="form-group">
          <label htmlFor="pizza-nombre">Nombre:</label>
          <input
            id="pizza-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Muzzarella"
            disabled={submitting}
            className="form-input"
            required
          />
        </div>

        <div className="form-group pizza-descripcion-campo">
          <label htmlFor="pizza-descripcion">Descripción (opcional)</label>
          <textarea
            id="pizza-descripcion"
            className="form-input"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Ej. Salsa de tomate, mozzarella, aceitunas y orégano."
            maxLength={300}
            rows={3}
            disabled={submitting}
            aria-describedby="pizza-descripcion-ayuda"
          />
          <small id="pizza-descripcion-ayuda">{descripcion.length}/300 caracteres. Se muestra en la carta.</small>
        </div>

        <div className="form-group-small">
          <label htmlFor="pizza-precio">Precio:</label>
          <input
            id="pizza-precio"
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            min="0"
            step="0.01"
            disabled={submitting}
            className="form-input"
            required
          />
        </div>

        <div className="form-group-small">
          <label>
            <input
              type="checkbox"
              checked={vegetariana}
              onChange={(e) => setVegetariana(e.target.checked)}
              disabled={submitting}
            />{' '}
            Vegetariana
          </label>
        </div>

        <div className="form-group-small">
          <label>
            <input
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
              disabled={submitting}
            />{' '}
            Disponible
          </label>
        </div>

        <div className="form-group pizza-imagen-campo">
          <span id="pizza-imagen-titulo" className="pizza-campo-titulo">Imagen de la pizza</span>
          <input
            ref={imagenInputRef}
            id="pizza-imagen"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleSeleccionarImagen(e.target.files?.[0])}
            disabled={submitting}
            hidden
            aria-labelledby="pizza-imagen-titulo"
            aria-describedby="pizza-imagen-ayuda"
            required
          />
          <div
            className={`pizza-upload${arrastrando ? ' pizza-upload--activo' : ''}${submitting ? ' pizza-upload--deshabilitado' : ''}`}
            onDragEnter={(event) => {
              event.preventDefault();
              if (submitting || !event.dataTransfer.types.includes('Files')) return;
              entradasArrastre.current += 1;
              setArrastrando(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = submitting ? 'none' : 'copy';
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              entradasArrastre.current = Math.max(0, entradasArrastre.current - 1);
              if (entradasArrastre.current === 0) setArrastrando(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              entradasArrastre.current = 0;
              setArrastrando(false);
              handleSeleccionarImagen(event.dataTransfer.files[0]);
            }}
          >
            <button
              type="button"
              className="pizza-upload-elegir"
              onClick={() => imagenInputRef.current?.click()}
              disabled={submitting}
              aria-label={imagen ? 'Cambiar imagen de la pizza' : 'Elegir imagen de la pizza'}
              aria-describedby="pizza-imagen-ayuda"
            >
              {vistaPrevia ? (
                <img src={vistaPrevia} alt="Vista previa de la pizza" className="pizza-upload-preview" />
              ) : (
                <span className="pizza-upload-icono" aria-hidden="true">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8" cy="8" r="1.5" />
                    <path d="m3 17 5-5 4 4 4-6 5 7" />
                  </svg>
                </span>
              )}
              <strong>{arrastrando ? 'Soltá tu imagen acá' : imagen ? 'Tu imagen está lista' : 'Dale una imagen a tu pizza'}</strong>
              <span className="pizza-upload-texto">
                {imagen ? imagen.name : 'Arrastrá una foto acá o elegila desde tu equipo'}
              </span>
              <span className="pizza-upload-boton">{imagen ? 'Cambiar imagen' : 'Elegir imagen'}</span>
            </button>
            {imagen && (
              <button
                type="button"
                className="pizza-upload-quitar"
                disabled={submitting}
                onClick={() => {
                  setImagen(null);
                  setVistaPrevia('');
                  if (imagenInputRef.current) imagenInputRef.current.value = '';
                }}
              >
                Quitar imagen
              </button>
            )}
          </div>
          <small id="pizza-imagen-ayuda">JPG, PNG o WebP. Hasta 5 MB y 20 megapíxeles.</small>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn-submit pizza-boton pizza-boton--principal">
            {submitting ? 'Guardando...' : 'Guardar Pizza'}
          </button>
        </div>
      </form>
    </div>
  );
}
