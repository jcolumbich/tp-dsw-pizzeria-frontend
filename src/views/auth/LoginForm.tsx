import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
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
      const usuario = await login(email.trim(), contrasenia);
      navigate(usuario.nivel_permisos >= 1 ? '/' : '/pedidos/nuevo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ingredientes-container">
      <h2>🔐 Iniciar sesión</h2>

      <div className="crear-ingrediente-form">
        {error && <p className="form-error">⚠️ {error}</p>}

        <form onSubmit={handleSubmit} className="form">
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

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn-submit">
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}