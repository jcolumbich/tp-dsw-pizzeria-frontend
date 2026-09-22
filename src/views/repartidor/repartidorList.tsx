import { useEffect, useState } from 'react';
import type { Repartidor } from '../../interfaces/repartidor';
import {
  getRepartidores,
  eliminarRepartidor,
  actualizarRepartidor,
} from '../../services/repartidorService';
import CrearRepartidorForm from './crearRepartidorForm';

export default function RepartidorList() {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [apellidoEditado, setApellidoEditado] = useState('');
  const [matriculaEditada, setMatriculaEditada] = useState('');
  const [estadoEditado, setEstadoEditado] = useState(true);

  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<number | null>(null);

  useEffect(() => {
    cargarRepartidores();
  }, []);

  const cargarRepartidores = async () => {
    try {
      setCargando(true);
      const data = await getRepartidores();
      setRepartidores(data);
      setError(null);
    } catch (err) {
      setError('No se pudo conectar con el servidor para obtener los repartidores.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleSolicitarEliminar = (id: number) => {
    setConfirmandoEliminarId(id);
  };

  const handleCancelarEliminar = () => {
    setConfirmandoEliminarId(null);
  };

  const handleConfirmarEliminar = async (id: number) => {
    try {
      await eliminarRepartidor(id);
      setRepartidores((prev) => prev.filter((item) => item.id !== id));
      setConfirmandoEliminarId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al intentar eliminar el repartidor.');
     setConfirmandoEliminarId(null);
      console.error(err);
}
  };

  const handleIniciarEdicion = (rep: Repartidor) => {
    setEditandoId(rep.id);
    setNombreEditado(rep.nombre);
    setApellidoEditado(rep.apellido);
    setMatriculaEditada(rep.matricula);
    setEstadoEditado(rep.estado);
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
  };

  const handleGuardarCambios = async (id: number) => {
    if (!nombreEditado.trim() || !apellidoEditado.trim() || !matriculaEditada.trim()) {
      setError('Los campos no pueden estar vacíos.');
      return;
    }
    try {
      const repartidorActualizado = await actualizarRepartidor(id, {
        nombre: nombreEditado.trim(),
        apellido: apellidoEditado.trim(),
        matricula: matriculaEditada.trim(),
        estado: estadoEditado,
      });
      setRepartidores((prev) =>
        prev.map((item) => (item.id === id ? repartidorActualizado : item))
      );
      setEditandoId(null);
      setError(null);
    } catch (err) {
      setError('No se pudo actualizar el repartidor.');
      console.error(err);
    }
  };

  const handleRepartidorCreado = (nuevo: Repartidor) => {
    setRepartidores((prev) => [...prev, nuevo]);
  };

  if (cargando) return <p>Cargando repartidores...</p>;

  return (
    <div className="ingredientes-container">
      <h2>Gestión de Repartidores</h2>

      <CrearRepartidorForm onRepartidorCreado={handleRepartidorCreado} />

      {error && <div className="error-message">⚠️ {error}</div>}

      {repartidores.length === 0 && !error ? (
        <p>No hay repartidores registrados.</p>
      ) : (
        <table className="ingredientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Matrícula</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {repartidores.map((rep) => (
              <tr key={rep.id}>
                <td>
                  {editandoId === rep.id ? (
                    <input
                      type="text"
                      value={nombreEditado}
                      onChange={(e) => setNombreEditado(e.target.value)}
                      className="form-input"
                      autoFocus
                    />
                  ) : (
                    rep.nombre
                  )}
                </td>
                <td>
                  {editandoId === rep.id ? (
                    <input
                      type="text"
                      value={apellidoEditado}
                      onChange={(e) => setApellidoEditado(e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    rep.apellido
                  )}
                </td>
                <td>
                  {editandoId === rep.id ? (
                    <input
                      type="text"
                      value={matriculaEditada}
                      onChange={(e) => setMatriculaEditada(e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    rep.matricula
                  )}
                </td>
                <td>
                  {editandoId === rep.id ? (
                    <select
                      value={estadoEditado ? 'true' : 'false'}
                      onChange={(e) => setEstadoEditado(e.target.value === 'true')}
                      className="form-input"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  ) : rep.estado ? (
                    'Activo'
                  ) : (
                    'Inactivo'
                  )}
                </td>
                <td>
                  {editandoId === rep.id ? (
                    <>
                      <button className="btn-submit" onClick={() => handleGuardarCambios(rep.id)}>
                        Guardar
                      </button>
                      <button onClick={handleCancelarEdicion}>Cancelar</button>
                    </>
                  ) : confirmandoEliminarId === rep.id ? (
                    <>
                      <span className="confirmar-texto">¿Eliminar?</span>
                      <button
                        onClick={() => handleConfirmarEliminar(rep.id)}
                        className="btn-eliminar"
                      >
                        Sí
                      </button>
                      <button onClick={handleCancelarEliminar}>No</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleIniciarEdicion(rep)}>Editar</button>
                      <button onClick={() => handleSolicitarEliminar(rep.id)} className="btn-eliminar">
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}