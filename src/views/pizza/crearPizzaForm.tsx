import { useState } from 'react';
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

    try {
      setSubmitting(true);
      const pizzaCreada = await crearPizza(resultado.data);
      setNombre('');
      setPrecio('0');
      setVegetariana(false);
      setDisponible(true);
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

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting ? 'Guardando...' : 'Guardar Pizza'}
          </button>
        </div>
      </form>
    </div>
  );
}