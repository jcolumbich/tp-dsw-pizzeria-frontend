import { useEffect, useState } from 'react';
import type { Repartidor } from '../../interfaces/repartidor';
import { getRepartidores, eliminarRepartidor, actualizarRepartidor } from '../../services/repartidorService';
import { editarRepartidorSchema } from '../../schemas/repartidor.schema';
import CrearRepartidorForm from './crearRepartidorForm';

export default function RepartidorList() {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [apellidoEditado, setApellidoEditado] = useState('');
  const [matriculaEditada, setMatriculaEditada] = useState('');
  const [estadoEditado, setEstadoEditado] = useState(true);
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<number | null>(null);

  useEffect(() => {
    void cargarRepartidores();
  }, []);

  const cargarRepartidores = async () => {
    try {
      setCargando(true);
      setRepartidores(await getRepartidores());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron obtener los repartidores.');
    } finally {
      setCargando(false);
    }
  };

  const handleConfirmarEliminar = async (id: number) => {
    if (guardando) return;
    setError(null);

    try {
      setGuardando(true);
      await eliminarRepartidor(id);
      setRepartidores((prev) => prev.filter((item) => item.id !== id));
      if (editandoId === id) setEditandoId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al intentar eliminar el repartidor.');
    } finally {
      setConfirmandoEliminarId(null);
      setGuardando(false);
    }
  };

  const handleIniciarEdicion = (rep: Repartidor) => {
    setEditandoId(rep.id);
    setNombreEditado(rep.nombre);
    setApellidoEditado(rep.apellido);
    setMatriculaEditada(rep.matricula);
    setEstadoEditado(rep.estado);
    setConfirmandoEliminarId(null);
    setError(null);
  };

  const handleGuardarCambios = async (id: number) => {
    if (guardando) return;
    setError(null);

    const resultado = editarRepartidorSchema.safeParse({
      nombre: nombreEditado,
      apellido: apellidoEditado,
      matricula: matriculaEditada,
      estado: estadoEditado,
    });

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message ?? 'Revisá los datos del repartidor');
      return;
    }

    try {
      setGuardando(true);
      const actualizado = await actualizarRepartidor(id, resultado.data);
      setRepartidores((prev) => prev.map((item) => item.id === id ? actualizado : item));
      setEditandoId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el repartidor.');
    } finally {
      setGuardando(false);
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
      {error && <div className="error-message" role="alert"> {error}</div>}

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
                      aria-label="Nombre del repartidor"
                      disabled={guardando}
                      autoFocus
                    />
                  ) : rep.nombre}
                </td>
                <td>
                  {editandoId === rep.id ? (
                    <input
                      type="text"
                      value={apellidoEditado}
                      onChange={(e) => setApellidoEditado(e.target.value)}
                      className="form-input"
                      aria-label="Apellido del repartidor"
                      disabled={guardando}
                    />
                  ) : rep.apellido}
                </td>
                <td>
                  {editandoId === rep.id ? (
                    <input
                      type="text"
                      value={matriculaEditada}
                      onChange={(e) => setMatriculaEditada(e.target.value)}
                      className="form-input"
                      aria-label="Matrícula del repartidor"
                      disabled={guardando}
                    />
                  ) : rep.matricula}
                </td>
                <td>
                  {editandoId === rep.id ? (
                    <select
                      value={estadoEditado ? 'true' : 'false'}
                      onChange={(e) => setEstadoEditado(e.target.value === 'true')}
                      className="form-input"
                      aria-label="Estado del repartidor"
                      disabled={guardando}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  ) : rep.estado ? 'Activo' : 'Inactivo'}
                </td>
                <td>
                  {editandoId === rep.id ? (
                    <>
                      <button type="button" className="btn-submit" disabled={guardando} onClick={() => void handleGuardarCambios(rep.id)}>
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button type="button" disabled={guardando} onClick={() => setEditandoId(null)}>Cancelar</button>
                    </>
                  ) : confirmandoEliminarId === rep.id ? (
                    <>
                      <span className="confirmar-texto">¿Eliminar?</span>
                      <button type="button" disabled={guardando} onClick={() => void handleConfirmarEliminar(rep.id)} className="btn-eliminar">Sí</button>
                      <button type="button" disabled={guardando} onClick={() => setConfirmandoEliminarId(null)}>No</button>
                    </>
                  ) : (
                    <>
                      <button type="button" disabled={guardando} onClick={() => handleIniciarEdicion(rep)}>Editar</button>
                      <button type="button" disabled={guardando} onClick={() => setConfirmandoEliminarId(rep.id)} className="btn-eliminar">
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