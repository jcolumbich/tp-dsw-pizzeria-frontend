import DetalleRegistro from '../../components/DetalleRegistro';
import { useListado } from '../../hooks/useListado.ts';
import Paginacion from '../../components/Paginacion';
import { useState } from 'react';
import type { Cliente } from '../../interfaces/cliente';
import {
  getClientes,
  eliminarCliente,
  actualizarCliente,
} from '../../services/clienteService';
import { editarClienteSchema } from '../../schemas/cliente.schema';
import CrearClienteForm from './crearClienteForm';
import '../gestionPersonas.css';

export default function ClienteList() {
  const [seleccionado, setSeleccionado] = useState<Cliente | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [filtro, setFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [mostrarAlta, setMostrarAlta] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [apellidoEditado, setApellidoEditado] = useState('');
  const [domicilioEditado, setDomicilioEditado] = useState('');
  const [estadoEditado, setEstadoEditado] = useState(true);

  const { data: clientes, paginacion, cargando, error: errorCarga, recargar } = useListado(
    getClientes, { busqueda, pagina, limite: 10 },
  );

  const handleEliminar = async (id: number) => {
    if (guardando) return;

    if (!window.confirm('¿Estás seguro de que querés eliminar este cliente?')) {
      return;
    }

    setError(null);

    try {
      setGuardando(true);
      await eliminarCliente(id);
      recargar();

      if (editandoId === id) setEditandoId(null);
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
        resultado.error.issues[0]?.message ?? 'Revisá los datos del cliente',
      );
      return;
    }

    try {
      setGuardando(true);
      await actualizarCliente(id, resultado.data);

      recargar();

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

  const handleClienteCreado = () => {
    recargar();
    setFiltro('');
    setBusqueda('');
    setPagina(1);
  };

  const limpiarBusqueda = () => {
    setFiltro('');
    setBusqueda('');
    setPagina(1);
    setEditandoId(null);
  };

  const cambiarPagina = (nueva: number) => {
    setPagina(nueva);
    setEditandoId(null);
  };

  return (
    <section className="gestion-personas" aria-labelledby="titulo-clientes">
      <header className="gp-encabezado">
        <div>
          <p className="gp-etiqueta">ADMINISTRACIÓN</p>
          <h2 id="titulo-clientes">Clientes</h2>
          <p>Buscá, consultá y actualizá los datos de tus clientes.</p>
        </div>

        <button
          type="button"
          className="gp-primario"
          aria-expanded={mostrarAlta}
          aria-controls="alta-clientes"
          onClick={() => setMostrarAlta(!mostrarAlta)}
        >
          {mostrarAlta ? 'Cerrar formulario' : '+ Nuevo cliente'}
        </button>
      </header>

      <div id="alta-clientes" hidden={!mostrarAlta} className="gp-alta">
        <CrearClienteForm onClienteCreado={handleClienteCreado} />
      </div>

      <form
        className="gp-buscador"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (guardando || cargando) return;

          setBusqueda(filtro.trim());
          setPagina(1);
          setEditandoId(null);
        }}
      >
        <label htmlFor="filtro-clientes">Buscar clientes</label>

        <div className="gp-busqueda-fila">
          <input
            id="filtro-clientes"
            type="search"
            maxLength={120}
            value={filtro}
            onChange={(event) => setFiltro(event.target.value)}
            placeholder="Nombre, apellido, correo o domicilio"
            aria-describedby="ayuda-clientes"
            disabled={guardando || cargando}
          />

          <button
            type="submit"
            className="gp-primario"
            disabled={guardando || cargando}
          >
            Buscar
          </button>

          <button
            type="button"
            onClick={limpiarBusqueda}
            disabled={guardando || cargando || (!filtro && !busqueda)}
          >
            Limpiar
          </button>
        </div>

        <p id="ayuda-clientes">
          Terminá de escribir y presioná Enter o Buscar.
        </p>
      </form>

      {(error || errorCarga) && (
        <p className="gp-error" role="alert">
          {error || errorCarga}
        </p>
      )}

      <div className="gp-listado" aria-busy={cargando}>
        <div className="gp-resumen" role="status">
          {cargando
            ? 'Cargando clientes…'
            : `${paginacion?.total ?? 0} clientes`}

          {busqueda && <span>Búsqueda aplicada: “{busqueda}”</span>}
        </div>

        {!cargando && clientes.length === 0 && (
          <p className="gp-vacio">
            {error
              ? 'No se pudo mostrar el listado.'
              : busqueda
                ? 'No hay coincidencias. Probá otra búsqueda o presioná Limpiar.'
                : 'Todavía no hay clientes registrados.'}
          </p>
        )}

        {!cargando && clientes.length > 0 && (
          <>
            <div
              className="gp-tabla-scroll"
              role="region"
              aria-label="Listado de clientes"
              tabIndex={0}
            >
              <table className="gp-tabla">
                <thead>
                  <tr>
                    {[
                      'Nombre',
                      'Apellido',
                      'Domicilio',
                      'Estado',
                      'Acciones',
                    ].map((titulo) => (
                      <th key={titulo} scope="col">
                        {titulo}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {clientes.map((persona) => (
                    <tr key={persona.id}>
                      {[
                        {
                          etiqueta: 'Nombre',
                          valor: persona.nombre,
                          editado: nombreEditado,
                          cambiar: setNombreEditado,
                        },
                        {
                          etiqueta: 'Apellido',
                          valor: persona.apellido,
                          editado: apellidoEditado,
                          cambiar: setApellidoEditado,
                        },
                        {
                          etiqueta: 'Domicilio',
                          valor: persona.domicilio,
                          editado: domicilioEditado,
                          cambiar: setDomicilioEditado,
                        },
                      ].map((campo) => (
                        <td key={campo.etiqueta}>
                          {editandoId === persona.id ? (
                            <input
                              aria-label={`${campo.etiqueta} del cliente`}
                              value={campo.editado}
                              disabled={guardando}
                              autoFocus={campo.etiqueta === 'Nombre'}
                              onChange={(event) =>
                                campo.cambiar(event.target.value)
                              }
                            />
                          ) : (
                            campo.valor
                          )}
                        </td>
                      ))}

                      <td>
                        {editandoId === persona.id ? (
                          <select
                            aria-label="Estado del cliente"
                            value={String(estadoEditado)}
                            disabled={guardando}
                            onChange={(event) =>
                              setEstadoEditado(event.target.value === 'true')
                            }
                          >
                            <option value="true">Habilitado</option>
                            <option value="false">Suspendido</option>
                          </select>
                        ) : (
                          <span
                            className={`gp-estado ${
                              persona.estado ? 'gp-activo' : 'gp-inactivo'
                            }`}
                          >
                            {persona.estado ? 'Habilitado' : 'Suspendido'}
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="gp-acciones">
                          {editandoId === persona.id ? (
                            <>
                              <button
                                type="button"
                                className="gp-primario"
                                disabled={guardando}
                                onClick={() =>
                                  void handleGuardarCambios(persona.id)
                                }
                              >
                                {guardando ? 'Guardando…' : 'Guardar'}
                              </button>

                              <button
                                type="button"
                                disabled={guardando}
                                onClick={() => setEditandoId(null)}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" disabled={guardando} onClick={() => setSeleccionado(persona)}>Ver detalle</button>
                              <button
                                type="button"
                                disabled={guardando}
                                onClick={() => handleIniciarEdicion(persona)}
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                className="gp-peligro"
                                disabled={guardando}
                                onClick={() => void handleEliminar(persona.id)}
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


          </>
        )}
        <Paginacion datos={paginacion} cambiarPagina={cambiarPagina}
          deshabilitada={guardando || cargando} etiqueta="Paginación de clientes" />
        {errorCarga && <button type="button" onClick={recargar}>Reintentar</button>}
      </div>
      {seleccionado && (
        <DetalleRegistro
          titulo="Detalle del cliente"
          subtitulo={seleccionado.nombre + ' ' + seleccionado.apellido}
          campos={[
            { etiqueta: 'ID', valor: seleccionado.id },
            { etiqueta: 'Nombre', valor: seleccionado.nombre },
            { etiqueta: 'Apellido', valor: seleccionado.apellido },
            { etiqueta: 'Email', valor: seleccionado.email },
            { etiqueta: 'Domicilio', valor: seleccionado.domicilio },
            { etiqueta: 'Estado', valor: seleccionado.estado ? 'Activo' : 'Inactivo' },
            { etiqueta: 'Rol', valor: seleccionado.nivel_permisos === 1 ? 'Administrador' : 'Cliente' },
          ]}
          onCerrar={() => setSeleccionado(null)}
        />
      )}
    </section>
  );
}