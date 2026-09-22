import { useState } from 'react';
import type { NuevoCliente, Cliente } from '../../interfaces/cliente';
import { crearCliente } from '../../services/clienteService';

interface Props {
  onClienteCreado: (nuevo: Cliente) => void;
}

export default function CrearClienteForm({ onClienteCreado }: Props) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
  const [domicilio, setDomicilio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim() || !email.trim() || !contrasenia.trim() || !domicilio.trim()) {
      setError('Completá todos los campos.');
      return;
    }

    try {
      setError(null);
      setSubmitting(true);

      const nuevo: NuevoCliente = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        contrasenia: contrasenia.trim(),
        nivel_permisos: 0,
        estado: true,
        domicilio: domicilio.trim(),
      };

      const clienteCreado = await crearCliente(nuevo);

      setNombre('');
      setApellido('');
      setEmail('');
      setContrasenia('');
      setMostrarContrasenia(false);
      setDomicilio('');

      onClienteCreado(clienteCreado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cliente. Intente nuevamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crear-ingrediente-form">
      <h3>Agregar Nuevo Cliente</h3>

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
            required
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
            required
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
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña:</label>

          <div className="password-wrapper">
            <input
              type={mostrarContrasenia ? 'text' : 'password'}
              value={contrasenia}
              onChange={(e) => setContrasenia(e.target.value)}
              disabled={submitting}
              className="form-input"
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              onClick={() => setMostrarContrasenia((prev) => !prev)}
              className="btn-toggle-password"
              tabIndex={-1}
            >
              {mostrarContrasenia ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Domicilio:</label>
          <input
            type="text"
            value={domicilio}
            onChange={(e) => setDomicilio(e.target.value)}
            placeholder="Ej. San Martín 1234"
            disabled={submitting}
            className="form-input"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}