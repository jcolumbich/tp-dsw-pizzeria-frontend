import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Ingrediente } from '../../interfaces/ingrediente';
import type { IngredientePizza } from '../../interfaces/ingredientePizza';
import { getIngredientes } from '../../services/ingredienteService';
import { getIngredientesDePizza, agregarIngredienteAPizza, actualizarCantidad, quitarIngredienteDePizza } from '../../services/ingredientePizzaService';
import { ingredientePizzaSchema } from '../../schemas/ingredientePizza.schema';

export default function PizzaDetalle() {
  const { id } = useParams<{ id: string }>();
  const pizzaId = Number(id);
  const [composicion, setComposicion] = useState<IngredientePizza[]>([]);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState<Ingrediente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<number | ''>('');
  const [cantidadNueva, setCantidadNueva] = useState('0');
  const [editandoIngredienteId, setEditandoIngredienteId] = useState<number | null>(null);
  const [cantidadEditada, setCantidadEditada] = useState('0');

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setCargando(true);
      setError(null);
      setComposicion([]);
      setIngredientesDisponibles([]);
      setIngredienteSeleccionado('');
      setEditandoIngredienteId(null);
      setCantidadNueva('0');
      setCantidadEditada('0');

      try {
        if (!Number.isSafeInteger(pizzaId) || pizzaId <= 0) {
          throw new Error('El ID de pizza debe ser un entero positivo válido.');
        }
        const [comp, ingredientes] = await Promise.all([
          getIngredientesDePizza(pizzaId),
          getIngredientes(),
        ]);
        if (activo) {
          setComposicion(comp);
          setIngredientesDisponibles(ingredientes);
        }
      } catch (err) {
        if (activo) setError(err instanceof Error ? err.message : 'No se pudo cargar la composición.');
      } finally {
        if (activo) setCargando(false);
      }
    };

    void cargar();
    return () => { activo = false; };
  }, [pizzaId]);

  const ingredientesNoAgregados = ingredientesDisponibles.filter(
    (ing) => !composicion.some((c) => c.ingrediente.id === ing.id)
  );

  const handleAgregar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (guardando) return;
    setError(null);

    const resultado = ingredientePizzaSchema.safeParse({
      pizzaId,
      ingredienteId: ingredienteSeleccionado === '' ? undefined : ingredienteSeleccionado,
      cantidad: cantidadNueva.trim() === '' ? undefined : Number(cantidadNueva),
    });

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message ?? 'Revisá los datos del ingrediente');
      return;
    }

    try {
      setGuardando(true);
      await agregarIngredienteAPizza(resultado.data);
      setIngredienteSeleccionado('');
      setCantidadNueva('0');
      setComposicion(await getIngredientesDePizza(pizzaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar el ingrediente.');
    } finally {
      setGuardando(false);
    }
  };

  const handleIniciarEdicion = (ingredienteId: number, cantidadActual: number) => {
    setEditandoIngredienteId(ingredienteId);
    setCantidadEditada(String(cantidadActual));
    setError(null);
  };

  const handleGuardarCantidad = async (ingredienteId: number) => {
    if (guardando) return;
    setError(null);

    const resultado = ingredientePizzaSchema.safeParse({
      pizzaId,
      ingredienteId,
      cantidad: cantidadEditada.trim() === '' ? undefined : Number(cantidadEditada),
    });

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message ?? 'Revisá la cantidad');
      return;
    }

    try {
      setGuardando(true);
      const datos = resultado.data;
      await actualizarCantidad(datos.pizzaId, datos.ingredienteId, datos.cantidad);
      setEditandoIngredienteId(null);
      setComposicion(await getIngredientesDePizza(pizzaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la cantidad.');
    } finally {
      setGuardando(false);
    }
  };

  const handleQuitar = async (ingredienteId: number) => {
    if (guardando) return;
    if (!window.confirm('¿Quitar este ingrediente de la pizza?')) return;
    setError(null);

    try {
      setGuardando(true);
      await quitarIngredienteDePizza(pizzaId, ingredienteId);
      setComposicion(await getIngredientesDePizza(pizzaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo quitar el ingrediente.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <p>Cargando composición...</p>;

  return (
    <div className="ingredientes-container">
      <Link to="/pizzas" className="nav-link">← Volver a Pizzas</Link>
      <h2> Ingredientes de la Pizza #{pizzaId}</h2>
      {error && <div className="error-message" role="alert">⚠️ {error}</div>}

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
                      onChange={(e) => setCantidadEditada(e.target.value)}
                      min="0.01"
                      step="0.01"
                      className="form-input"
                      aria-label="Cantidad del ingrediente"
                      disabled={guardando}
                      autoFocus
                    />
                  ) : c.cantidad}
                </td>
                <td>
                  {editandoIngredienteId === c.ingrediente.id ? (
                    <>
                      <button type="button" className="btn-submit" disabled={guardando} onClick={() => void handleGuardarCantidad(c.ingrediente.id)}>
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button type="button" disabled={guardando} onClick={() => setEditandoIngredienteId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button type="button" disabled={guardando} onClick={() => handleIniciarEdicion(c.ingrediente.id, c.cantidad)}>Editar</button>
                      <button type="button" disabled={guardando} onClick={() => void handleQuitar(c.ingrediente.id)} className="btn-eliminar">Quitar</button>
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
        <form onSubmit={handleAgregar} className="form" noValidate>
          <div className="form-group">
            <label htmlFor="ingrediente-pizza">Ingrediente:</label>
            <select
              id="ingrediente-pizza"
              value={ingredienteSeleccionado}
              onChange={(e) => setIngredienteSeleccionado(e.target.value === '' ? '' : Number(e.target.value))}
              className="form-input"
              disabled={guardando}
              required
            >
              <option value="">Seleccioná un ingrediente</option>
              {ingredientesNoAgregados.map((ing) => (
                <option key={ing.id} value={ing.id}>{ing.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group-small">
            <label htmlFor="cantidad-ingrediente-pizza">Cantidad:</label>
            <input
              id="cantidad-ingrediente-pizza"
              type="number"
              value={cantidadNueva}
              onChange={(e) => setCantidadNueva(e.target.value)}
              min="0.01"
              step="0.01"
              className="form-input"
              disabled={guardando}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={guardando || ingredientesNoAgregados.length === 0}>
              {guardando ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}