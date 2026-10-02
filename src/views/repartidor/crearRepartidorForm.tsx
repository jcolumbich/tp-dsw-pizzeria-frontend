import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Repartidor } from '../../interfaces/repartidor';
import { crearRepartidor } from '../../services/repartidorService';
import { crearRepartidorSchema } from '../../schemas/repartidor.schema';

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const resultado = crearRepartidorSchema.safeParse({
      nombre,
      apellido,
      email,
      contrasenia,
      nivel_permisos: 1,
      estado: true,
      matricula,
      monto_propina_total: 0,
    });

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message ?? 'Revisá los datos ingresados');
      return;
    }

    try {
      setSubmitting(true);
      const repartidorCreado = await crearRepartidor(resultado.data);
      setNombre('');
      setApellido('');
      setEmail('');
      setContrasenia('');
      setMatricula('');
      onRepartidorCreado(repartidorCreado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el repartidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crear-ingrediente-form">
      <h3> + Agregar Nuevo Repartidor</h3>
      {error && <p className="form-error" role="alert">⚠️ {error}</p>}

      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className="form-group">
          <label htmlFor="repartidor-nombre">Nombre:</label>
          <input
            id="repartidor-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={submitting}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="repartidor-apellido">Apellido:</label>
          <input
            id="repartidor-apellido"
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            disabled={submitting}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="repartidor-email">Email:</label>
          <input
            id="repartidor-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className="form-input"
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="repartidor-contrasenia">Contraseña:</label>
          <input
            id="repartidor-contrasenia"
            type="password"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
            disabled={submitting}
            className="form-input"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="repartidor-matricula">Matrícula:</label>
          <input
            id="repartidor-matricula"
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            placeholder="Ej. MOT-1234"
            disabled={submitting}
            className="form-input"
            required
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