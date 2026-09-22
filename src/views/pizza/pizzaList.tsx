import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Pizza } from '../../interfaces/pizza';
import { getPizzas, eliminarPizza, actualizarPizza } from '../../services/pizzaService';
import CrearPizzaForm from './crearPizzaForm';

export default function PizzaList() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [filtro, setFiltro] = useState('');

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [precioEditado, setPrecioEditado] = useState<number>(0);
  const [vegetarianaEditada, setVegetarianaEditada] = useState(false);
  const [disponibleEditada, setDisponibleEditada] = useState(true);

  useEffect(() => {
    cargarPizzas();
  }, []);

  const cargarPizzas = async () => {
    try {
      setCargando(true);
      const data = await getPizzas();
      setPizzas(data);
      setError(null);
    } catch (err) {
      setError('No se pudo conectar con el servidor para obtener las pizzas.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar esta pizza?')) return;
    try {
      await eliminarPizza(id);
      setPizzas((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Error al intentar eliminar la pizza.');
      console.error(err);
    }
  };

  const handleIniciarEdicion = (p: Pizza) => {
    setEditandoId(p.id);
    setNombreEditado(p.nombre);
    setPrecioEditado(p.precio);
    setVegetarianaEditada(p.vegetariana);
    setDisponibleEditada(p.disponible);
  };

  const handleCancelarEdicion = () => setEditandoId(null);

  const handleGuardarCambios = async (id: number) => {
    if (!nombreEditado.trim() || precioEditado <= 0) {
      alert('Ingresá un nombre válido y un precio mayor a 0.');
      return;
    }
    try {
      const pizzaActualizada = await actualizarPizza(id, {
        nombre: nombreEditado.trim(),
        precio: precioEditado,
        vegetariana: vegetarianaEditada,
        disponible: disponibleEditada,
      });
      setPizzas((prev) => prev.map((item) => (item.id === id ? pizzaActualizada : item)));
      setEditandoId(null);
    } catch (err) {
      alert('No se pudo actualizar la pizza.');
      console.error(err);
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

      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="form-group filtro-container">
        <label>🔍 Buscar por nombre:</label>
        <input
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
                      autoFocus
                    />
                  ) : (
                    p.nombre
                  )}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <input
                      type="number"
                      value={precioEditado}
                      onChange={(e) => setPrecioEditado(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  ) : (
                    `$${p.precio}`
                  )}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <input
                      type="checkbox"
                      checked={vegetarianaEditada}
                      onChange={(e) => setVegetarianaEditada(e.target.checked)}
                    />
                  ) : p.vegetariana ? (
                    'Sí'
                  ) : (
                    'No'
                  )}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <input
                      type="checkbox"
                      checked={disponibleEditada}
                      onChange={(e) => setDisponibleEditada(e.target.checked)}
                    />
                  ) : p.disponible ? (
                    'Sí'
                  ) : (
                    'No'
                  )}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <>
                      <button className="btn-submit" onClick={() => handleGuardarCambios(p.id)}>
                        Guardar
                      </button>
                      <button onClick={handleCancelarEdicion}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <Link to={`/pizzas/${p.id}`} className="nav-link" style={{ marginRight: '8px' }}>
                        Ingredientes
                      </Link>
                      <button onClick={() => handleIniciarEdicion(p)}>Editar</button>
                      <button onClick={() => handleEliminar(p.id)} className="btn-eliminar">
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