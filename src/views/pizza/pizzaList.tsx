import { useListado } from '../../hooks/useListado';
import Paginacion from '../../components/Paginacion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Pizza } from '../../interfaces/pizza';
import {
  getPizzas,
  eliminarPizza,
  actualizarPizza,
  obtenerUrlImagenPizza,
} from '../../services/pizzaService';
import { crearPizzaSchema } from '../../schemas/pizza.schema';
import CrearPizzaForm from './crearPizzaForm';
import './pizzaGestion.css';
export default function PizzaList() {
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [vegetariana, setVegetariana] = useState('');
  const [disponible, setDisponible] = useState('');
  const { data: pizzas, paginacion, cargando, error: errorCarga, recargar } = useListado(getPizzas, {
    busqueda, pagina, limite: 10,
    vegetariana: vegetariana === '' ? undefined : vegetariana === 'true',
    disponible: disponible === '' ? undefined : disponible === 'true',
  });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [precioEditado, setPrecioEditado] = useState('0');
  const [vegetarianaEditada, setVegetarianaEditada] = useState(false);
  const [disponibleEditada, setDisponibleEditada] = useState(true);
  const [imagenEditada, setImagenEditada] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState('');
  const imagenInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    return () => {
      if (vistaPrevia) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);
  const handleEliminar = async (id: number) => {
    if (guardando) return;
    if (!window.confirm('¿Dar de baja esta pizza? Se conservarán su receta y los pedidos anteriores.')) {
      return;
    }
    setError(null);
    try {
      setGuardando(true);
      await eliminarPizza(id);
      recargar();
      if (editandoId === id) {
        handleCancelarEdicion();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al intentar eliminar la pizza.'
      );
    } finally {
      setGuardando(false);
    }
  };
  const handleIniciarEdicion = (p: Pizza) => {
    setEditandoId(p.id);
    setNombreEditado(p.nombre);
    setPrecioEditado(String(p.precio));
    setVegetarianaEditada(p.vegetariana);
    setDisponibleEditada(p.disponible);
    setImagenEditada(null);
    setVistaPrevia('');
    setError(null);
    if (imagenInputRef.current) {
      imagenInputRef.current.value = '';
    }
  };
  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setImagenEditada(null);
    setVistaPrevia('');
  };
  const handleSeleccionarImagen = (archivo: File | undefined) => {
    setError(null);
    setImagenEditada(null);
    setVistaPrevia('');
    if (!archivo) return;
    if (
      archivo.type !== 'image/jpeg' &&
      archivo.type !== 'image/png' &&
      archivo.type !== 'image/webp'
    ) {
      setError('Seleccioná una imagen JPG, PNG o WebP.');
      if (imagenInputRef.current) {
        imagenInputRef.current.value = '';
      }
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5 MB.');
      if (imagenInputRef.current) {
        imagenInputRef.current.value = '';
      }
      return;
    }
    setImagenEditada(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
  };
  const handleGuardarCambios = async (id: number) => {
    if (guardando) return;
    setError(null);
    const resultado = crearPizzaSchema.safeParse({
      nombre: nombreEditado,
      precio: precioEditado.trim() === '' ? undefined : Number(precioEditado),
      vegetariana: vegetarianaEditada,
      disponible: disponibleEditada,
    });
    if (!resultado.success) {
      setError(
        resultado.error.issues[0]?.message ??
        'Revisá los datos de la pizza'
      );
      return;
    }
    try {
      setGuardando(true);
      await actualizarPizza(
        id,
        resultado.data,
        imagenEditada ?? undefined
      );
      recargar();
      handleCancelarEdicion();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la pizza.'
      );
    } finally {
      setGuardando(false);
    }
  };
  const handlePizzaCreada = () => { setPagina(1); recargar(); };
  return (
    <div className="ingredientes-container pizza-gestion">
      <h2> Gestión de Pizzas</h2>
      <CrearPizzaForm onPizzaCreada={handlePizzaCreada} />
      {(error || errorCarga) && (
        <div className="error-message" role="alert">
          ⚠️ {error || errorCarga}
        </div>
      )}
      <form className="busqueda-listado" role="search" onSubmit={event => {
        event.preventDefault(); setBusqueda(filtro.trim()); setPagina(1); handleCancelarEdicion(); recargar();
      }}>
        <label>Buscar por nombre
          <input type="search" maxLength={120} value={filtro} onChange={event => setFiltro(event.target.value)} />
        </label>
        <label>Tipo
          <select value={vegetariana} disabled={guardando} onChange={event => { setVegetariana(event.target.value); setPagina(1); handleCancelarEdicion(); }}>
            <option value="">Todas</option><option value="true">Vegetarianas</option><option value="false">No vegetarianas</option>
          </select>
        </label>
        <label>Disponibilidad
          <select value={disponible} disabled={guardando} onChange={event => { setDisponible(event.target.value); setPagina(1); handleCancelarEdicion(); }}>
            <option value="">Todas</option><option value="true">Disponibles</option><option value="false">No disponibles</option>
          </select>
        </label>
        <button className="pizza-boton pizza-boton--principal" type="submit" disabled={guardando}>Buscar</button>
        <button className="pizza-boton pizza-boton--secundario" type="button" disabled={guardando} onClick={() => {
          setFiltro(''); setBusqueda(''); setVegetariana(''); setDisponible(''); setPagina(1); handleCancelarEdicion();
        }}>Limpiar</button>
      </form>
      {errorCarga && <button className="pizza-boton pizza-boton--secundario" type="button" onClick={recargar}>Reintentar</button>}
      {cargando ? <p role="status">Cargando pizzas…</p> :
      pizzas.length === 0 && !error ? (
        <p>
          No se encontraron pizzas para los filtros seleccionados.
        </p>
      ) : (
        <table className="ingredientes-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Vegetariana</th>
              <th>Disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pizzas.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="form-group">
                    {(editandoId === p.id && vistaPrevia) || p.imagen ? (
                      <img
                        src={
                          editandoId === p.id && vistaPrevia
                            ? vistaPrevia
                            : obtenerUrlImagenPizza(p)!
                        }
                        alt={p.nombre}
                        width="100"
                        height="75"
                        style={{
                          objectFit: 'cover',
                          borderRadius: '6px',
                        }}
                      />
                    ) : (
                      <span>Sin imagen</span>
                    )}
                    {editandoId === p.id && (
                      <>
                        <label htmlFor={`pizza-imagen-${p.id}`}>
                          Cambiar imagen (opcional)
                        </label>
                        <input
                          ref={imagenInputRef}
                          id={`pizza-imagen-${p.id}`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) =>
                            handleSeleccionarImagen(e.target.files?.[0])
                          }
                          className="form-input"
                          disabled={guardando}
                        />
                        <small>
                          JPG, PNG o WebP. Hasta 5 MB y 20 megapíxeles.
                        </small>
                      </>
                    )}
                  </div>
                </td>
                <td>
                  {editandoId === p.id ? (
                    <input
                      type="text"
                      value={nombreEditado}
                      onChange={(e) => setNombreEditado(e.target.value)}
                      className="form-input"
                      aria-label="Nombre de la pizza"
                      disabled={guardando}
                      autoFocus
                    />
                  ) : p.nombre}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <input
                      type="number"
                      value={precioEditado}
                      onChange={(e) => setPrecioEditado(e.target.value)}
                      min="0"
                      step="0.01"
                      className="form-input"
                      aria-label="Precio de la pizza"
                      disabled={guardando}
                    />
                  ) : `$${p.precio}`}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <input
                      type="checkbox"
                      checked={vegetarianaEditada}
                      onChange={(e) => setVegetarianaEditada(e.target.checked)}
                      aria-label="Pizza vegetariana"
                      disabled={guardando}
                    />
                  ) : p.vegetariana ? 'Sí' : 'No'}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <input
                      type="checkbox"
                      checked={disponibleEditada}
                      onChange={(e) => setDisponibleEditada(e.target.checked)}
                      aria-label="Pizza disponible"
                      disabled={guardando}
                    />
                  ) : p.disponible ? 'Sí' : 'No'}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <>
                      <button
                        type="button"
                        className="btn-submit"
                        disabled={guardando}
                        onClick={() => void handleGuardarCambios(p.id)}
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
                      <Link
                        to={`/pizzas/${p.id}`}
                        className="nav-link"
                        style={{ marginRight: '8px' }}
                      >
                        Ingredientes
                      </Link>
                      <button
                        type="button"
                        disabled={guardando}
                        onClick={() => handleIniciarEdicion(p)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-eliminar"
                        disabled={guardando}
                        onClick={() => void handleEliminar(p.id)}
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
      <Paginacion datos={paginacion} deshabilitada={cargando || guardando}
        cambiarPagina={valor => { setPagina(valor); handleCancelarEdicion(); }} />
    </div>
  );
}
