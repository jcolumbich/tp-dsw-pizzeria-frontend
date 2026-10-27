import { useListado } from '../../hooks/useListado';
import Paginacion from '../../components/Paginacion';
import { useState } from 'react';
import type { Repartidor } from '../../interfaces/repartidor';
import {
  getRepartidores,
  eliminarRepartidor,
  actualizarRepartidor,
} from '../../services/repartidorService';
import { editarRepartidorSchema } from '../../schemas/repartidor.schema';
import CrearRepartidorForm from './crearRepartidorForm';
import '../gestionPersonas.css';

export default function RepartidorList() {
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [filtro, setFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [mostrarAlta, setMostrarAlta] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [apellidoEditado, setApellidoEditado] = useState('');
  const [matriculaEditada, setMatriculaEditada] = useState('');
  const [estadoEditado, setEstadoEditado] = useState(true);
  const [confirmandoEliminarId, setConfirmandoEliminarId] =
    useState<number | null>(null);

  const { data: repartidores, paginacion, cargando, error: errorCarga, recargar } = useListado(
    getRepartidores, { busqueda, pagina, limite: 10 },
  );

  const handleConfirmarEliminar = async (id: number) => {
    if (guardando) return;
    setError(null);

    try {
      setGuardando(true);
      await eliminarRepartidor(id);
      recargar();

      if (editandoId === id) setEditandoId(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al intentar eliminar el repartidor.',
      );
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
      setError(
        resultado.error.issues[0]?.message ?? 'Revisá los datos del repartidor',
      );
      return;
    }

    try {
      setGuardando(true);
      await actualizarRepartidor(id, resultado.data);

      recargar();

      setEditandoId(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el repartidor.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleRepartidorCreado = () => {
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
    setConfirmandoEliminarId(null);
  };

  const cambiarPagina = (nueva: number) => {
    setPagina(nueva);
    setEditandoId(null);
    setConfirmandoEliminarId(null);
  };

  return (
    <section
      className="gestion-personas"
      aria-labelledby="titulo-repartidores"
    >
      <header className="gp-encabezado">
        <div>
          <p className="gp-etiqueta">ADMINISTRACIÓN</p>
          <h2 id="titulo-repartidores">Repartidores</h2>
          <p>Buscá, consultá y actualizá los datos de tus repartidores.</p>
        </div>

        <button
          type="button"
          className="gp-primario"
          aria-expanded={mostrarAlta}
          aria-controls="alta-repartidores"
          onClick={() => setMostrarAlta(!mostrarAlta)}
        >
          {mostrarAlta ? 'Cerrar formulario' : '+ Nuevo repartidor'}
        </button>
      </header>

      <div id="alta-repartidores" hidden={!mostrarAlta} className="gp-alta">
        <CrearRepartidorForm onRepartidorCreado={handleRepartidorCreado} />
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
          setConfirmandoEliminarId(null);
        }}
      >
        <label htmlFor="filtro-repartidores">Buscar repartidores</label>

        <div className="gp-busqueda-fila">
          <input
            id="filtro-repartidores"
            type="search"
            maxLength={120}
            value={filtro}
            onChange={(event) => setFiltro(event.target.value)}
            placeholder="Nombre, apellido, correo o matrícula"
            aria-describedby="ayuda-repartidores"
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

        <p id="ayuda-repartidores">
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
            ? 'Cargando repartidores…'
            : `${paginacion?.total ?? 0} repartidores`}

          {busqueda && <span>Búsqueda aplicada: “{busqueda}”</span>}
        </div>

        {!cargando && repartidores.length === 0 && (
          <p className="gp-vacio">
            {error
              ? 'No se pudo mostrar el listado.'
              : busqueda
                ? 'No hay coincidencias. Probá otra búsqueda o presioná Limpiar.'
                : 'Todavía no hay repartidores registrados.'}
          </p>
        )}

        {!cargando && repartidores.length > 0 && (
          <>
            <div
              className="gp-tabla-scroll"
              role="region"
              aria-label="Listado de repartidores"
              tabIndex={0}
            >
              <table className="gp-tabla">
                <thead>
                  <tr>
                    {[
                      'Nombre',
                      'Apellido',
                      'Matrícula',
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
                  {repartidores.map((persona) => (
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
                          etiqueta: 'Matrícula',
                          valor: persona.matricula,
                          editado: matriculaEditada,
                          cambiar: setMatriculaEditada,
                        },
                      ].map((campo) => (
                        <td key={campo.etiqueta}>
                          {editandoId === persona.id ? (
                            <input
                              aria-label={`${campo.etiqueta} del repartidor`}
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
                            aria-label="Estado del repartidor"
                            value={String(estadoEditado)}
                            disabled={guardando}
                            onChange={(event) =>
                              setEstadoEditado(event.target.value === 'true')
                            }
                          >
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                          </select>
                        ) : (
                          <span
                            className={`gp-estado ${
                              persona.estado ? 'gp-activo' : 'gp-inactivo'
                            }`}
                          >
                            {persona.estado ? 'Activo' : 'Inactivo'}
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
                          ) : confirmandoEliminarId === persona.id ? (
                            <>
                              <span>¿Eliminar?</span>

                              <button
                                type="button"
                                className="gp-peligro"
                                disabled={guardando}
                                onClick={() =>
                                  void handleConfirmarEliminar(persona.id)
                                }
                              >
                                Sí, eliminar
                              </button>

                              <button
                                type="button"
                                disabled={guardando}
                                onClick={() => setConfirmandoEliminarId(null)}
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
                                onClick={() =>
                                  setConfirmandoEliminarId(persona.id)
                                }
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
          deshabilitada={guardando || cargando} etiqueta="Paginación de repartidores" />
        {errorCarga && <button type="button" onClick={recargar}>Reintentar</button>}
      </div>
    </section>
  );
}