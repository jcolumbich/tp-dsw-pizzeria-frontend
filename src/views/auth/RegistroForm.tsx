import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarCliente } from '../../services/authService';
import { useAuth } from '../../context/authContext';
import './LoginForm.css';

function RegistroForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (contrasenia.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (contrasenia !== confirmarContrasenia) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setGuardando(true);
      const emailNormalizado = email.trim().toLowerCase();

      await registrarCliente({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: emailNormalizado,
        contrasenia,
        domicilio: domicilio.trim()
      });

      await login(emailNormalizado, contrasenia);
      navigate('/pedidos/nuevo');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo completar el registro');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-panel-bienvenida">
        <p className="login-etiqueta">Sumate a la familia</p>
        <h1 className="login-titulo">Creá tu cuenta y pedí en segundos.</h1>
        <p className="login-subtitulo">
          Registrate para guardar tus datos, seguir tus pedidos y repetir tus pizzas favoritas.
        </p>
        <div className="login-imagen-placeholder" aria-hidden="true">
          🍕
        </div>
      </div>

      <div className="login-panel-formulario">
        <div className="login-formulario-contenedor">
          <h2>Crear cuenta</h2>

          <p className="login-link-registro">
            ¿Ya tenés una cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>

          {error && <p className="form-error">⚠️ {error}</p>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                disabled={guardando}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido:</label>
              <input
                id="apellido"
                type="text"
                value={apellido}
                onChange={(event) => setApellido(event.target.value)}
                disabled={guardando}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={guardando}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="domicilio">Domicilio:</label>
              <input
                id="domicilio"
                type="text"
                value={domicilio}
                onChange={(event) => setDomicilio(event.target.value)}
                disabled={guardando}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contrasenia">Contraseña:</label>
              <input
                id="contrasenia"
                type="password"
                minLength={6}
                value={contrasenia}
                onChange={(event) => setContrasenia(event.target.value)}
                disabled={guardando}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarContrasenia">Confirmar contraseña:</label>
              <input
                id="confirmarContrasenia"
                type="password"
                minLength={6}
                value={confirmarContrasenia}
                onChange={(event) => setConfirmarContrasenia(event.target.value)}
                disabled={guardando}
                className="form-input"
                required
              />
            </div>

            <div className="login-form-actions">
              <button
                type="submit"
                disabled={guardando}
                className="btn-submit login-btn-submit"
              >
                {guardando ? 'Creando cuenta...' : 'Registrarse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistroForm;
