import { useState } from 'react';
import type { NuevoIngrediente, Ingrediente } from '../../interfaces/ingrediente';
import { crearIngrediente } from '../../services/ingredienteService';

interface Props {
  onIngredienteCreado: (nuevo: Ingrediente) => void;
}

export default function CrearIngredienteForm({ onIngredienteCreado }: Props) {
  const [nombre, setNombre] = useState('');
  const [stock, setStock] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || stock < 0) {
      setError('Por favor, ingresá un nombre válido y un stock mayor o igual a 0.');
      return;
    }

    try {
      setError(null);
      setSubmitting(true);

      const nuevo: NuevoIngrediente = {
        nombre: nombre.trim(),
        stock: stock,
      };

      const ingredienteCreado = await crearIngrediente(nuevo);

      setNombre('');
      setStock(0);

      onIngredienteCreado(ingredienteCreado);
    } catch (err) {
      setError('No se pudo guardar el ingrediente. Intente nuevamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crear-ingrediente-form">
      <h3> + Agregar Nuevo Ingrediente</h3>

      {error && <p className="form-error">⚠️ {error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Jamón"
            disabled={submitting}
            className="form-input"
          />
        </div>

        <div className="form-group-small">
          <label>Stock:</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            min="0"
            step="0.01"
            disabled={submitting}
            className="form-input"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={submitting}
            className="btn-submit"
          >
            {submitting ? 'Guardando...' : 'Guardar Ingrediente'}
          </button>
        </div>
      </form>
    </div>
  );
}