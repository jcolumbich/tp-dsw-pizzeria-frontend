import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Pizza } from '../../interfaces/pizza';
import { getPizzas, eliminarPizza, actualizarPizza } from '../../services/pizzaService';
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

  useEffect(() => {
    void cargarPizzas();
  }, []);

  const cargarPizzas = async () => {
    try {
      setCargando(true);
      const data = await getPizzas();
      setPizzas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron obtener las pizzas.');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (guardando) return;
    if (!window.confirm('¿Estás seguro de que querés eliminar esta pizza?')) return;
    setError(null);

    try {
      setGuardando(true);
      await eliminarPizza(id);
      setPizzas((prev) => prev.filter((item) => item.id !== id));
      if (editandoId === id) setEditandoId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al intentar eliminar la pizza.');
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
    setError(null);
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
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
      setError(resultado.error.issues[0]?.message ?? 'Revisá los datos de la pizza');
      return;
    }

    try {
      setGuardando(true);
      const actualizada = await actualizarPizza(id, resultado.data);
      setPizzas((prev) => prev.map((item) => item.id === id ? actualizada : item));
      setEditandoId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la pizza.');
    } finally {
      setGuardando(false);
    }
  };

  const handlePizzaCreada = (nueva: Pizza) => {
    setPizzas((prev) => [...prev, nueva]);
  };

  const pizzasFiltradas = pizzas.filter((p) => p.nombre.toLowerCase().includes(filtro.toLowerCase()));

  if (cargando) return <p>Cargando pizzas...</p>;

  return (
    <div className="ingredientes-container">
      <h2> Gestión de Pizzas</h2>
      <CrearPizzaForm onPizzaCreada={handlePizzaCreada} />

      {error && <div className="error-message" role="alert">⚠️ {error}</div>}

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
        <p>{pizzas.length === 0 ? 'No hay pizzas registradas.' : 'No se encontraron pizzas con ese nombre.'}</p>
      ) : (
        <table className="ingredientes-table">
          <thead>
            <tr>
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
                      <button type="button" disabled={guardando} onClick={handleCancelarEdicion}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to={`/pizzas/${p.id}`} className="nav-link" style={{ marginRight: '8px' }}>
                        Ingredientes
                      </Link>
                      <button type="button" disabled={guardando} onClick={() => handleIniciarEdicion(p)}>
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