import { useEffect, useMemo, useState } from 'react';
import type { Cliente } from '../../interfaces/cliente';
import {
  getClientes,
  eliminarCliente,
  actualizarCliente,
} from '../../services/clienteService';
import { editarClienteSchema } from '../../schemas/cliente.schema';
import CrearClienteForm from './crearClienteForm';
import '../gestionPersonas.css';

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
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [mostrarAlta, setMostrarAlta] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [apellidoEditado, setApellidoEditado] = useState('');
  const [domicilioEditado, setDomicilioEditado] = useState('');
  const [estadoEditado, setEstadoEditado] = useState(true);

  useEffect(() => {
    let activo = true;

    void getClientes()
      .then((datos) => {
        if (activo) {
          setClientes(datos);
          setError(null);
        }
      })
      .catch((error: unknown) => {
        if (activo) {
          setError(
            error instanceof Error
              ? error.message
              : 'No se pudieron obtener los clientes.',
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const handleEliminar = async (id: number) => {
    if (guardando) return;

    if (!window.confirm('¿Estás seguro de que querés eliminar este cliente?')) {
      return;
    }

    setError(null);

    try {
      setGuardando(true);
      await eliminarCliente(id);
      setClientes((prev) => prev.filter((item) => item.id !== id));

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
    setClientes((prev) => [nuevo, ...prev]);
    setFiltro('');
    setBusqueda('');
    setPagina(1);
  };

  // Se prepara el texto de búsqueda solo cuando cambia el listado.
  const indice = useMemo(
    () =>
      clientes.map((persona) => ({
        persona,
        texto: normalizarBusqueda(
          `${persona.nombre} ${persona.apellido} ${persona.email ?? ''} ${persona.domicilio ?? ''}`,
        ),
      })),
    [clientes],
  );

  // Escribir en el input no vuelve a filtrar.
  // Solo cambia al confirmar la búsqueda o modificar los datos.
  const resultados = useMemo(() => {
    const palabras = busqueda.split(/\s+/).filter(Boolean);

    return indice
      .filter((item) =>
        palabras.every((palabra) => item.texto.includes(palabra)),
      )
      .map((item) => item.persona);
  }, [indice, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(resultados.length / 10));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * 10;
  const visibles = resultados.slice(inicio, inicio + 10);

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

          setBusqueda(normalizarBusqueda(filtro));
          setPagina(1);
          setEditandoId(null);
        }}
      >
        <label htmlFor="filtro-clientes">Buscar clientes</label>

        <div className="gp-busqueda-fila">
          <input
            id="filtro-clientes"
            type="search"
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

      {error && (
        <p className="gp-error" role="alert">
          {error}
        </p>
      )}

      <div className="gp-listado" aria-busy={cargando}>
        <div className="gp-resumen" role="status">
          {cargando
            ? 'Cargando clientes…'
            : `${resultados.length} de ${clientes.length} clientes`}

          {busqueda && <span>Búsqueda aplicada: “{busqueda}”</span>}
        </div>

        {!cargando && resultados.length === 0 && (
          <p className="gp-vacio">
            {error
              ? 'No se pudo mostrar el listado.'
              : busqueda
                ? 'No hay coincidencias. Probá otra búsqueda o presioná Limpiar.'
                : 'Todavía no hay clientes registrados.'}
          </p>
        )}

        {!cargando && resultados.length > 0 && (
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
                  {visibles.map((persona) => (
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

            <nav className="gp-paginacion" aria-label="Paginación de clientes">
              <span>
                Mostrando {inicio + 1}–
                {Math.min(inicio + 10, resultados.length)} de {resultados.length}
              </span>

              <div className="gp-acciones">
                <button
                  type="button"
                  disabled={paginaActual === 1 || guardando}
                  onClick={() => cambiarPagina(paginaActual - 1)}
                >
                  Anterior
                </button>

                <span>
                  Página {paginaActual} de {totalPaginas}
                </span>

                <button
                  type="button"
                  disabled={paginaActual === totalPaginas || guardando}
                  onClick={() => cambiarPagina(paginaActual + 1)}
                >
                  Siguiente
                </button>
              </div>
            </nav>
          </>
        )}
      </div>
    </section>
  );
}