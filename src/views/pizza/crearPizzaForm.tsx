import { useState } from 'react';
import type { NuevaPizza, Pizza } from '../../interfaces/pizza';
import { crearPizza } from '../../services/pizzaService';

interface Props {
  onPizzaCreada: (nueva: Pizza) => void;
}


export default function CrearPizzaForm({ onPizzaCreada }: Props) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState<number>(0);
  const [vegetariana, setVegetariana] = useState(false);
  const [disponible, setDisponible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || precio <= 0) {
      setError('Ingresá un nombre válido y un precio mayor a 0.');
      return;
    }

    try {
      setError(null);
      setSubmitting(true);

      const nueva: NuevaPizza = {
        nombre: nombre.trim(),
        precio,
        vegetariana,
        disponible,
      };

      const pizzaCreada = await crearPizza(nueva);

      setNombre('');
      setPrecio(0);
      setVegetariana(false);
      setDisponible(true);

      onPizzaCreada(pizzaCreada);
    } catch (err) {
      setError('No se pudo guardar la pizza. Intente nuevamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crear-ingrediente-form">
      <h3> + Agregar Nueva Pizza</h3>

      {error && <p className="form-error">⚠️ {error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Muzzarella"
            disabled={submitting}
            className="form-input"
          />
        </div>

        <div className="form-group-small">
          <label>Precio:</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(Number(e.target.value))}
            min="0"
            step="0.01"
            disabled={submitting}
            className="form-input"
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