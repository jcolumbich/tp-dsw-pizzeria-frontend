import { useEffect, useState } from 'react';
import type { Cliente } from '../../interfaces/cliente';
import { getClientes, eliminarCliente, actualizarCliente } from '../../services/clienteService';
import CrearClienteForm from './crearClienteForm';

export default function ClienteList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [filtro, setFiltro] = useState('');

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [apellidoEditado, setApellidoEditado] = useState('');
  const [domicilioEditado, setDomicilioEditado] = useState('');
  const [estadoEditado, setEstadoEditado] = useState(true);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const data = await getClientes();
      setClientes(data);
      setError(null);
    } catch (err) {
      setError('No se pudo conectar con el servidor para obtener los clientes.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar este cliente?')) return;
    try {
      await eliminarCliente(id);
      setClientes((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Error al intentar eliminar el cliente.');
      console.error(err);
    }
  };

  const handleIniciarEdicion = (c: Cliente) => {
    setEditandoId(c.id);
    setNombreEditado(c.nombre);
    setApellidoEditado(c.apellido);
    setDomicilioEditado(c.domicilio);
    setEstadoEditado(c.estado);
  };

  const handleCancelarEdicion = () => setEditandoId(null);

  const handleGuardarCambios = async (id: number) => {
    if (!nombreEditado.trim() || !apellidoEditado.trim() || !domicilioEditado.trim()) {
      alert('Los campos no pueden estar vacíos.');
      return;
    }
    try {
      const clienteActualizado = await actualizarCliente(id, {
        nombre: nombreEditado.trim(),
        apellido: apellidoEditado.trim(),
        domicilio: domicilioEditado.trim(),
        estado: estadoEditado,
      });
      setClientes((prev) => prev.map((item) => (item.id === id ? clienteActualizado : item)));
      setEditandoId(null);
    } catch (err) {
      alert('No se pudo actualizar el cliente.');
      console.error(err);
    }
  };

  const handleClienteCreado = (nuevo: Cliente) => {
    setClientes((prev) => [...prev, nuevo]);
  };

  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(filtro.toLowerCase())
  );

  if (cargando) return <p>Cargando clientes...</p>;

  return (
    <div className="ingredientes-container">
      <h2>🧑‍🤝‍🧑 Gestión de Clientes</h2>

      <CrearClienteForm onClienteCreado={handleClienteCreado} />

      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="form-group filtro-container">
        <label>🔍 Buscar por nombre o apellido:</label>
        <input
          type="text"
          placeholder="Ej. Pérez"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="form-input"
        />
      </div>

      {clientesFiltrados.length === 0 && !error ? (
        <p>{clientes.length === 0 ? 'No hay clientes registrados.' : 'No se encontraron clientes.'}</p>
      ) : (
        <table className="ingredientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Domicilio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((c) => (
              <tr key={c.id}>
                <td>
                  {editandoId === c.id ? (
                    <input
                      type="text"
                      value={nombreEditado}
                      onChange={(e) => setNombreEditado(e.target.value)}
                      className="form-input"
                      autoFocus
                    />
                  ) : (
                    c.nombre
                  )}
                </td>
                <td>
                  {editandoId === c.id ? (
                    <input
                      type="text"
                      value={apellidoEditado}
                      onChange={(e) => setApellidoEditado(e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    c.apellido
                  )}
                </td>
                <td>
                  {editandoId === c.id ? (
                    <input
                      type="text"
                      value={domicilioEditado}
                      onChange={(e) => setDomicilioEditado(e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    c.domicilio
                  )}
                </td>
                <td>
                  {editandoId === c.id ? (
                    <select
                      value={estadoEditado ? 'true' : 'false'}
                      onChange={(e) => setEstadoEditado(e.target.value === 'true')}
                      className="form-input"
                    >
                      <option value="true">Habilitado</option>
                      <option value="false">Suspendido</option>
                    </select>
                  ) : c.estado ? (
                    'Habilitado'
                  ) : (
                    'Suspendido'
                  )}
                </td>
                <td>
                  {editandoId === c.id ? (
                    <>
                      <button className="btn-submit" onClick={() => handleGuardarCambios(c.id)}>
                        Guardar
                      </button>
                      <button onClick={handleCancelarEdicion}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleIniciarEdicion(c)}>Editar</button>
                      <button onClick={() => handleEliminar(c.id)} className="btn-eliminar">
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