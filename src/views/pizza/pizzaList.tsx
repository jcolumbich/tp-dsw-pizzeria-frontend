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
  const [descripcionEditada, setDescripcionEditada] = useState('');
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
    setDescripcionEditada(p.descripcion ?? '');
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
      descripcion: descripcionEditada,
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
        <div className="pizza-tabla-scroll" role="region" aria-label="Listado de pizzas" tabIndex={0}>
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
              editandoId === p.id ? (
                <tr key={p.id} className="pizza-fila-edicion">
                  <td colSpan={6}>
                    <form className="pizza-editor" onSubmit={(event) => {
                      event.preventDefault();
                      void handleGuardarCambios(p.id);
                    }}>
                      <header className="pizza-editor-cabecera">
                        <span className="pizza-form-etiqueta">EDITAR PIZZA</span>
                        <h3>{p.nombre}</h3>
                        <p>Actualizá la información que aparece en tu carta.</p>
                      </header>
                      <div className="pizza-editor-foto">
                        {vistaPrevia || p.imagen ? (
                          <img src={vistaPrevia || obtenerUrlImagenPizza(p)!} alt={`Imagen de ${p.nombre}`} />
                        ) : <span className="pizza-editor-sin-foto">Sin imagen</span>}
                        <input
                          ref={imagenInputRef}
                          id={`pizza-imagen-${p.id}`}
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) => handleSeleccionarImagen(event.target.files?.[0])}
                          disabled={guardando}
                          aria-label="Seleccionar nueva imagen"
                        />
                        <button type="button" className="pizza-boton pizza-boton--secundario"
                          disabled={guardando} onClick={() => imagenInputRef.current?.click()}>
                          Cambiar foto
                        </button>
                        {imagenEditada && <span className="pizza-editor-archivo">{imagenEditada.name}</span>}
                        <small>JPG, PNG o WebP · Hasta 5 MB y 20 megapíxeles. La foto actual se conserva si no elegís otra.</small>
                      </div>
                      <div className="pizza-editor-datos">
                        <label htmlFor={`pizza-nombre-${p.id}`}>Nombre
                          <input id={`pizza-nombre-${p.id}`} className="form-input" value={nombreEditado}
                            onChange={(event) => setNombreEditado(event.target.value)} maxLength={100}
                            disabled={guardando} autoFocus />
                        </label>
                        <label htmlFor={`pizza-descripcion-${p.id}`}>Descripción <span className="pizza-editor-opcional">(opcional)</span>
                          <textarea id={`pizza-descripcion-${p.id}`} className="form-input" rows={3}
                            value={descripcionEditada} onChange={(event) => setDescripcionEditada(event.target.value)}
                            maxLength={300} disabled={guardando}
                            placeholder="Contá qué ingredientes tiene y qué la hace especial."
                            aria-describedby={`pizza-contador-${p.id}`} />
                          <small id={`pizza-contador-${p.id}`}>{descripcionEditada.length}/300 caracteres</small>
                        </label>
                        <label htmlFor={`pizza-precio-${p.id}`}>Precio ($)
                          <input id={`pizza-precio-${p.id}`} type="number" className="form-input"
                            value={precioEditado} onChange={(event) => setPrecioEditado(event.target.value)}
                            min="0" step="0.01" disabled={guardando} />
                        </label>
                        <div className="pizza-editor-opciones">
                          <label className="pizza-editor-check">
                            <input type="checkbox" checked={vegetarianaEditada}
                              onChange={(event) => setVegetarianaEditada(event.target.checked)} disabled={guardando} />
                            <span>Vegetariana<small>Una opción sin carne</small></span>
                          </label>
                          <label className="pizza-editor-check">
                            <input type="checkbox" checked={disponibleEditada}
                              onChange={(event) => setDisponibleEditada(event.target.checked)} disabled={guardando} />
                            <span>Disponible<small>Se puede pedir en la carta</small></span>
                          </label>
                        </div>
                      </div>
                      <footer className="pizza-editor-acciones">
                        <button type="button" className="pizza-boton pizza-boton--secundario" disabled={guardando}
                          onClick={handleCancelarEdicion}>Cancelar</button>
                        <button type="submit" className="pizza-boton pizza-boton--principal" disabled={guardando}>
                          {guardando ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                      </footer>
                    </form>
                  </td>
                </tr>
              ) : <tr key={p.id}>
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
                  {editandoId === p.id ? (
                    <label className="pizza-descripcion-editar">
                      Descripción (opcional)
                      <textarea
                        className="form-input"
                        value={descripcionEditada}
                        onChange={(event) => setDescripcionEditada(event.target.value)}
                        maxLength={300}
                        rows={3}
                        disabled={guardando}
                      />
                    </label>
                  ) : p.descripcion ? (
                    <p className="pizza-descripcion-texto">{p.descripcion}</p>
                  ) : null}
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
        </div>
      )}
      <Paginacion datos={paginacion} deshabilitada={cargando || guardando}
        cambiarPagina={valor => { setPagina(valor); handleCancelarEdicion(); }} />
    </div>
  );
}
