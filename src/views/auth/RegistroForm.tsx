import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarCliente } from '../../services/authService';
import { useAuth } from '../../context/authContext';

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
    <div className="ingredientes-container">
      <h2>Crear cuenta</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="crear-ingrediente-form">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre:</label>
            <input id="nombre" className="form-input" type="text" value={nombre} onChange={(event) => setNombre(event.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido:</label>
            <input id="apellido" className="form-input" type="text" value={apellido} onChange={(event) => setApellido(event.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input id="email" className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="domicilio">Domicilio:</label>
            <input id="domicilio" className="form-input" type="text" value={domicilio} onChange={(event) => setDomicilio(event.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="contrasenia">Contraseña:</label>
            <input id="contrasenia" className="form-input" type="password" minLength={6} value={contrasenia} onChange={(event) => setContrasenia(event.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarContrasenia">Confirmar contraseña:</label>
            <input id="confirmarContrasenia" className="form-input" type="password" minLength={6} value={confirmarContrasenia} onChange={(event) => setConfirmarContrasenia(event.target.value)} required />
          </div>

          <div className="form-actions">
            <button className="btn-submit" type="submit" disabled={guardando}>
              {guardando ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </div>
        </form>

        <p>
          ¿Ya tenés una cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default RegistroForm;