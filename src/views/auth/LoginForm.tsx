import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './LoginForm.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !contrasenia.trim()) {
      setError('Completá email y contraseña.');
      return;
    }

    try {
      setSubmitting(true);
      const usuario = await login(email.trim(), contrasenia, recordar);
      navigate(usuario.nivel_permisos >= 1 ? '/' : '/pedidos/nuevo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-panel-bienvenida">
        <p className="login-etiqueta">Bienvenido de nuevo</p>
        <h1 className="login-titulo">Tu pizza te está esperando.</h1>
        <p className="login-subtitulo">
          Ingresá para repetir tus pizzas favoritas y seguir el estado de tus pedidos.
        </p>
        <div className="login-imagen-placeholder" aria-hidden="true">
          🍕
        </div>
      </div>

      <div className="login-panel-formulario">
        <div className="login-formulario-contenedor">
          <h2>🔐 Iniciar sesión</h2>

          <p className="login-link-registro">
            ¿Primera vez? <Link to="/registro">Creá tu cuenta</Link>
          </p>

          {error && <p className="form-error">⚠️ {error}</p>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contrasenia">Contraseña:</label>
              <input
                id="contrasenia"
                type="password"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                disabled={submitting}
                className="form-input"
              />
            </div>

            <div className="form-group-small">
              <label>
                <input
                  type="checkbox"
                  checked={recordar}
                  onChange={(e) => setRecordar(e.target.checked)}
                  disabled={submitting}
                />{' '}
                Recordarme en este dispositivo
              </label>
            </div>

            <div className="login-form-actions">
              <button
                type="submit"
                disabled={submitting}
                className="btn-submit login-btn-submit"
              >
                {submitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
