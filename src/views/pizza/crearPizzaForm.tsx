import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Pizza } from '../../interfaces/pizza';
import { crearPizza } from '../../services/pizzaService';
import { crearPizzaSchema } from '../../schemas/pizza.schema';

interface Props {
  onPizzaCreada: (nueva: Pizza) => void;
}

export default function CrearPizzaForm({ onPizzaCreada }: Props) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('0');
  const [vegetariana, setVegetariana] = useState(false);
  const [disponible, setDisponible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagen, setImagen] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState('');
  const imagenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

  const handleSeleccionarImagen = (archivo: File | undefined) => {
    setError(null);
    setImagen(null);
    setVistaPrevia('');
    if (!archivo) return;
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
    <div className="crear-ingrediente-form">
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
          <label htmlFor="pizza-imagen">Imagen de la pizza:</label>
          <input
            ref={imagenInputRef}
            id="pizza-imagen"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleSeleccionarImagen(e.target.files?.[0])}
            disabled={submitting}
            className="form-input"
            aria-describedby="pizza-imagen-ayuda"
            required
          />
          <small id="pizza-imagen-ayuda">JPG, PNG o WebP. Hasta 5 MB y 20 megapíxeles.</small>
          {vistaPrevia && <img src={vistaPrevia} alt="Vista previa de la pizza" className="pizza-imagen-preview" />}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting ? 'Guardando...' : 'Guardar Pizza'}
          </button>
        </div>
      </form>
    </div>
  );
}