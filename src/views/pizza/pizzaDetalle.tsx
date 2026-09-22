import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Ingrediente } from '../../interfaces/ingrediente';
import type { IngredientePizza } from '../../interfaces/ingredientePizza';
import { getIngredientes } from '../../services/ingredienteService';
import {
  getIngredientesDePizza,
  agregarIngredienteAPizza,
  actualizarCantidad,
  quitarIngredienteDePizza,
} from '../../services/ingredientePizzaService';

export default function PizzaDetalle() {
  const { id } = useParams<{ id: string }>();
  const pizzaId = Number(id);

  const [composicion, setComposicion] = useState<IngredientePizza[]>([]);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState<Ingrediente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<number | ''>('');
  const [cantidadNueva, setCantidadNueva] = useState<number>(0);

  const [editandoIngredienteId, setEditandoIngredienteId] = useState<number | null>(null);
  const [cantidadEditada, setCantidadEditada] = useState<number>(0);

  useEffect(() => {
    cargarDatos();
  }, [pizzaId]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [comp, ingredientes] = await Promise.all([
        getIngredientesDePizza(pizzaId),
        getIngredientes(),
      ]);
      setComposicion(comp);
      setIngredientesDisponibles(ingredientes);
      setError(null);
    } catch (err) {
      setError('No se pudo cargar la composición de la pizza.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const ingredientesNoAgregados = ingredientesDisponibles.filter(
    (ing) => !composicion.some((c) => c.ingrediente.id === ing.id)
  );

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredienteSeleccionado === '' || cantidadNueva <= 0) {
      alert('Elegí un ingrediente y una cantidad mayor a 0.');
      return;
    }
    try {
      await agregarIngredienteAPizza({
        pizzaId,
        ingredienteId: Number(ingredienteSeleccionado),
        cantidad: cantidadNueva,
      });
      setIngredienteSeleccionado('');
      setCantidadNueva(0);
      cargarDatos();
    } catch (err) {
      alert('No se pudo agregar el ingrediente.');
      console.error(err);
    }
  };

  const handleIniciarEdicion = (ingredienteId: number, cantidadActual: number) => {
    setEditandoIngredienteId(ingredienteId);
    setCantidadEditada(cantidadActual);
  };

  const handleGuardarCantidad = async (ingredienteId: number) => {
    if (cantidadEditada <= 0) {
      alert('La cantidad debe ser mayor a 0.');
      return;
    }
    try {
      await actualizarCantidad(pizzaId, ingredienteId, cantidadEditada);
      setEditandoIngredienteId(null);
      cargarDatos();
    } catch (err) {
      alert('No se pudo actualizar la cantidad.');
      console.error(err);
    }
  };

  const handleQuitar = async (ingredienteId: number) => {
    if (!window.confirm('¿Quitar este ingrediente de la pizza?')) return;
    try {
      await quitarIngredienteDePizza(pizzaId, ingredienteId);
      cargarDatos();
    } catch (err) {
      alert('No se pudo quitar el ingrediente.');
      console.error(err);
    }
  };

  if (cargando) return <p>Cargando composición...</p>;

  return (
    <div className="ingredientes-container">
      <Link to="/pizzas" className="nav-link">
        ← Volver a Pizzas
      </Link>

      <h2> Ingredientes de la Pizza #{pizzaId}</h2>

      {error && <div className="error-message">⚠️ {error}</div>}

      {composicion.length === 0 ? (
        <p>Esta pizza todavía no tiene ingredientes cargados.</p>
      ) : (
        <table className="ingredientes-table">
          <thead>
            <tr>
              <th>Ingrediente</th>
              <th>Cantidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {composicion.map((c) => (
              <tr key={c.ingrediente.id}>
                <td>{c.ingrediente.nombre}</td>
                <td>
                  {editandoIngredienteId === c.ingrediente.id ? (
                    <input
                      type="number"
                      value={cantidadEditada}
                      onChange={(e) => setCantidadEditada(Number(e.target.value))}
                      min="0.01"
                      step="0.01"
                      className="form-input"
                      autoFocus
                    />
                  ) : (
                    c.cantidad
                  )}
                </td>
                <td>
                  {editandoIngredienteId === c.ingrediente.id ? (
                    <>
                      <button className="btn-submit" onClick={() => handleGuardarCantidad(c.ingrediente.id)}>
                        Guardar
                      </button>
                      <button onClick={() => setEditandoIngredienteId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleIniciarEdicion(c.ingrediente.id, c.cantidad)}>
                        Editar
                      </button>
                      <button onClick={() => handleQuitar(c.ingrediente.id)} className="btn-eliminar">
                        Quitar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="crear-ingrediente-form">
        <h3>➕ Agregar Ingrediente a esta Pizza</h3>
        <form onSubmit={handleAgregar} className="form">
          <div className="form-group">
            <label>Ingrediente:</label>
            <select
              value={ingredienteSeleccionado}
              onChange={(e) => setIngredienteSeleccionado(e.target.value === '' ? '' : Number(e.target.value))}
              className="form-input"
            >
              <option value="">Seleccioná un ingrediente</option>
              {ingredientesNoAgregados.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-small">
            <label>Cantidad:</label>
            <input
              type="number"
              value={cantidadNueva}
              onChange={(e) => setCantidadNueva(Number(e.target.value))}
              min="0.01"
              step="0.01"
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={ingredientesNoAgregados.length === 0}>
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}