import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Ingrediente } from '../../interfaces/ingrediente';
import { crearIngrediente } from '../../services/ingredienteService';
import { crearIngredienteSchema } from '../../schemas/ingrediente.schema';

interface Props {
  onIngredienteCreado: (nuevo: Ingrediente) => void;
}

export default function CrearIngredienteForm({ onIngredienteCreado }: Props) {
  const [nombre, setNombre] = useState('');
  const [stock, setStock] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const resultado = crearIngredienteSchema.safeParse({
      nombre,
      stock: stock.trim() === '' ? undefined : Number(stock),
    });

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message ?? 'Revisá los datos ingresados');
      return;
    }

    try {
      setSubmitting(true);
      const ingredienteCreado = await crearIngrediente(resultado.data);
      setNombre('');
      setStock('0');
      onIngredienteCreado(ingredienteCreado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el ingrediente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crear-ingrediente-form">
      <h3> + Agregar Nuevo Ingrediente</h3>
      {error && <p className="form-error" role="alert"> {error}</p>}

      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className="form-group">
          <label htmlFor="ingrediente-nombre">Nombre:</label>
          <input
            id="ingrediente-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Jamón"
            disabled={submitting}
            className="form-input"
            required
          />
        </div>

        <div className="form-group-small">
          <label htmlFor="ingrediente-stock">Stock:</label>
          <input
            id="ingrediente-stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
            step="0.01"
            disabled={submitting}
            className="form-input"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting ? 'Guardando...' : 'Guardar Ingrediente'}
          </button>
        </div>
      </form>
    </div>
  );
}