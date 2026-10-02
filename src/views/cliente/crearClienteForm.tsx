import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Cliente } from '../../interfaces/cliente';
import { crearCliente } from '../../services/clienteService';
import { crearClienteSchema } from '../../schemas/cliente.schema';

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const resultado = crearClienteSchema.safeParse({
      nombre,
      apellido,
      email,
      contrasenia,
      nivel_permisos: 0,
      estado: true,
      domicilio,
    });

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message ?? 'Revisá los datos ingresados');
      return;
    }

    try {
      setSubmitting(true);
      const clienteCreado = await crearCliente(resultado.data);
      setNombre('');
      setApellido('');
      setEmail('');
      setContrasenia('');
      setMostrarContrasenia(false);
      setDomicilio('');
      onClienteCreado(clienteCreado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cliente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crear-ingrediente-form">
      <h3>Agregar Nuevo Cliente</h3>
      {error && <p className="form-error" role="alert"> {error}</p>}

      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className="form-group">
          <label htmlFor="cliente-nombre">Nombre:</label>
          <input
            id="cliente-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={submitting}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cliente-apellido">Apellido:</label>
          <input
            id="cliente-apellido"
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            disabled={submitting}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cliente-email">Email:</label>
          <input
            id="cliente-email"
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
          <label htmlFor="cliente-contrasenia">Contraseña:</label>
          <div className="password-wrapper">
            <input
              id="cliente-contrasenia"
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
              disabled={submitting}
              className="btn-toggle-password"
              aria-controls="cliente-contrasenia"
              aria-label={mostrarContrasenia ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {mostrarContrasenia ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cliente-domicilio">Domicilio:</label>
          <input
            id="cliente-domicilio"
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