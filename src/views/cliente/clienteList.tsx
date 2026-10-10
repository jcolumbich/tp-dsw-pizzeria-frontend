import { useEffect, useState } from 'react';
import type { Cliente } from '../../interfaces/cliente';
import {
  getClientes,
  eliminarCliente,
  actualizarCliente,
} from '../../services/clienteService';
import { editarClienteSchema } from '../../schemas/cliente.schema';
import CrearClienteForm from './crearClienteForm';

const normalizarBusqueda = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();

export default function ClienteList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [apellidoEditado, setApellidoEditado] = useState('');
  const [domicilioEditado, setDomicilioEditado] = useState('');
  const [estadoEditado, setEstadoEditado] = useState(true);

  useEffect(() => {
    void cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      setClientes(await getClientes());
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron obtener los clientes.',
      );
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (guardando) return;

    if (
      !window.confirm(
        '¿Estás seguro de que querés eliminar este cliente?',
      )
    ) {
      return;
    }

    setError(null);

    try {
      setGuardando(true);
      await eliminarCliente(id);
      setClientes((prev) => prev.filter((item) => item.id !== id));

      if (editandoId === id) {
        setEditandoId(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al intentar eliminar el cliente.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleIniciarEdicion = (cliente: Cliente) => {
    setEditandoId(cliente.id);
    setNombreEditado(cliente.nombre);
    setApellidoEditado(cliente.apellido);
    setDomicilioEditado(cliente.domicilio);
    setEstadoEditado(cliente.estado);
    setError(null);
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
  };

  const handleGuardarCambios = async (id: number) => {
    if (guardando) return;

    setError(null);

    const resultado = editarClienteSchema.safeParse({
      nombre: nombreEditado,
      apellido: apellidoEditado,
      domicilio: domicilioEditado,
      estado: estadoEditado,
    });

    if (!resultado.success) {
      setError(
        resultado.error.issues[0]?.message ??
          'Revisá los datos del cliente',
      );
      return;
    }

    try {
      setGuardando(true);

      const actualizado = await actualizarCliente(id, resultado.data);

      setClientes((prev) =>
        prev.map((item) => (item.id === id ? actualizado : item)),
      );

      setEditandoId(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el cliente.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleClienteCreado = (nuevo: Cliente) => {
    setClientes((prev) => [...prev, nuevo]);
  };

  const palabrasBusqueda = normalizarBusqueda(filtro)
    .split(/\s+/)
    .filter(Boolean);

  const clientesFiltrados = clientes.filter((cliente) => {
    const datos = normalizarBusqueda(
      `${cliente.nombre} ${cliente.apellido} ${cliente.email ?? ''} ${cliente.domicilio ?? ''}`,
    );

    return palabrasBusqueda.every((palabra) => datos.includes(palabra));
  });

  if (cargando) {
    return <p>Cargando clientes...</p>;
  }

  return (
    <div className="ingredientes-container">
      <h2>🧑‍🤝‍🧑 Gestión de Clientes</h2>

      <div className="form-group filtro-container">
        <label htmlFor="filtro-clientes">Buscar clientes</label>

        <input
          id="filtro-clientes"
          type="search"
          placeholder="Nombre, apellido, correo o domicilio"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="form-input"
          aria-describedby="resultado-busqueda-clientes"
        />

        <span id="resultado-busqueda-clientes" role="status">
          {clientesFiltrados.length} de {clientes.length} clientes
        </span>
      </div>

      <CrearClienteForm onClienteCreado={handleClienteCreado} />

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {clientesFiltrados.length === 0 && !error ? (
        <p>
          {clientes.length === 0
            ? 'No hay clientes registrados.'
            : 'No se encontraron clientes.'}
        </p>
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
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  {editandoId === cliente.id ? (
                    <input
                      type="text"
                      value={nombreEditado}
                      onChange={(e) => setNombreEditado(e.target.value)}
                      className="form-input"
                      aria-label="Nombre del cliente"
                      disabled={guardando}
                      autoFocus
                    />
                  ) : (
                    cliente.nombre
                  )}
                </td>

                <td>
                  {editandoId === cliente.id ? (
                    <input
                      type="text"
                      value={apellidoEditado}
                      onChange={(e) => setApellidoEditado(e.target.value)}
                      className="form-input"
                      aria-label="Apellido del cliente"
                      disabled={guardando}
                    />
                  ) : (
                    cliente.apellido
                  )}
                </td>

                <td>
                  {editandoId === cliente.id ? (
                    <input
                      type="text"
                      value={domicilioEditado}
                      onChange={(e) => setDomicilioEditado(e.target.value)}
                      className="form-input"
                      aria-label="Domicilio del cliente"
                      disabled={guardando}
                    />
                  ) : (
                    cliente.domicilio
                  )}
                </td>

                <td>
                  {editandoId === cliente.id ? (
                    <select
                      value={estadoEditado ? 'true' : 'false'}
                      onChange={(e) =>
                        setEstadoEditado(e.target.value === 'true')
                      }
                      className="form-input"
                      aria-label="Estado del cliente"
                      disabled={guardando}
                    >
                      <option value="true">Habilitado</option>
                      <option value="false">Suspendido</option>
                    </select>
                  ) : cliente.estado ? (
                    'Habilitado'
                  ) : (
                    'Suspendido'
                  )}
                </td>

                <td>
                  {editandoId === cliente.id ? (
                    <>
                      <button
                        type="button"
                        className="btn-submit"
                        disabled={guardando}
                        onClick={() =>
                          void handleGuardarCambios(cliente.id)
                        }
                      >
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </button>

                      <button
                        type="button"
                        disabled={guardando}
                        onClick={handleCancelarEdicion}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={guardando}
                        onClick={() => handleIniciarEdicion(cliente)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled={guardando}
                        onClick={() => void handleEliminar(cliente.id)}
                        className="btn-eliminar"
                      >
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