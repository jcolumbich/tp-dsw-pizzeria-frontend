import { useState } from 'react';
import type { NuevoRepartidor, Repartidor } from '../../interfaces/repartidor';
import { crearRepartidor } from '../../services/repartidorService';

interface Props {
  onRepartidorCreado: (nuevo: Repartidor) => void;
}

export default function CrearRepartidorForm({ onRepartidorCreado }: Props) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [matricula, setMatricula] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim() || !email.trim() || !contrasenia.trim() || !matricula.trim()) {
      setError('Completá todos los campos.');
      return;
    }

    try {
      setError(null);
      setSubmitting(true);

      const nuevo: NuevoRepartidor = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        contrasenia: contrasenia.trim(),
        nivel_permisos: 1,
        estado: true,
        matricula: matricula.trim(),
        monto_propina_total: 0,
      };

      const repartidorCreado = await crearRepartidor(nuevo);

      setNombre('');
      setApellido('');
      setEmail('');
      setContrasenia('');
      setMatricula('');

      onRepartidorCreado(repartidorCreado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el repartidor. Intente nuevamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crear-ingrediente-form">
      <h3> + Agregar Nuevo Repartidor</h3>

      {error && <p className="form-error">⚠️ {error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={submitting}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Apellido:</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            disabled={submitting}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
            disabled={submitting}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Matrícula:</label>
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            placeholder="Ej. MOT-1234"
            disabled={submitting}
            className="form-input"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting ? 'Guardando...' : 'Guardar Repartidor'}
          </button>
        </div>
      </form>
    </div>
  );
}