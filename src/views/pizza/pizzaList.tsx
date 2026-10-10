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

export default function PizzaList() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [precioEditado, setPrecioEditado] = useState('0');
  const [vegetarianaEditada, setVegetarianaEditada] = useState(false);
  const [disponibleEditada, setDisponibleEditada] = useState(true);
  const [imagenEditada, setImagenEditada] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState('');

  const imagenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let activo = true;

    getPizzas()
      .then((data) => {
        if (activo) {
          setPizzas(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudieron obtener las pizzas.'
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

  useEffect(() => {
    return () => {
      if (vistaPrevia) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  const handleEliminar = async (id: number) => {
    if (guardando) return;

    if (!window.confirm('¿Estás seguro de que querés eliminar esta pizza?')) {
      return;
    }

    setError(null);

    try {
      setGuardando(true);
      await eliminarPizza(id);

      setPizzas((prev) => prev.filter((item) => item.id !== id));

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

      const actualizada = await actualizarPizza(
        id,
        resultado.data,
        imagenEditada ?? undefined
      );

      setPizzas((prev) =>
        prev.map((item) => item.id === id ? actualizada : item)
      );

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

  const handlePizzaCreada = (nueva: Pizza) => {
    setPizzas((prev) => [...prev, nueva]);
  };

  const pizzasFiltradas = pizzas.filter((p) =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  if (cargando) return <p>Cargando pizzas...</p>;

  return (
    <div className="ingredientes-container">
      <h2> Gestión de Pizzas</h2>

      <CrearPizzaForm onPizzaCreada={handlePizzaCreada} />

      {error && (
        <div className="error-message" role="alert">
          ⚠️ {error}
        </div>
      )}

      <div className="form-group filtro-container">
        <label htmlFor="filtro-pizzas">🔍 Buscar por nombre:</label>
        <input
          id="filtro-pizzas"
          type="text"
          placeholder="Ej. Muzzarella"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="form-input"
        />
      </div>

      {pizzasFiltradas.length === 0 && !error ? (
        <p>
          {pizzas.length === 0
            ? 'No hay pizzas registradas.'
            : 'No se encontraron pizzas con ese nombre.'}
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
            {pizzasFiltradas.map((p) => (
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
    </div>
  );
}