import { useEffect, useState } from 'react';
import type { Ingrediente } from '../../interfaces/ingrediente';
import { getIngredientes, eliminarIngrediente, actualizarIngrediente } from '../../services/ingredienteService';
import { crearIngredienteSchema } from '../../schemas/ingrediente.schema';
import CrearIngredienteForm from './crearIngredienteForm';

export default function IngredientesList() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [stockEditado, setStockEditado] = useState('0');
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<number | null>(null);

  useEffect(() => {
    void cargarIngredientes();
  }, []);

  const cargarIngredientes = async () => {
    try {
      setCargando(true);
      const data = await getIngredientes();
      setIngredientes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron obtener los ingredientes.');
    } finally {
      setCargando(false);
    }
  };

  const handleSolicitarEliminar = (id: number) => {
    setConfirmandoEliminarId(id);
  };

  const handleCancelarEliminar = () => {
    setConfirmandoEliminarId(null);
  };

  const handleConfirmarEliminar = async (id: number) => {
    if (guardando) return;
    setError(null);

    try {
      setGuardando(true);
      await eliminarIngrediente(id);
      setIngredientes((prev) => prev.filter((item) => item.id !== id));
      setConfirmandoEliminarId(null);
      if (editandoId === id) setEditandoId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al intentar eliminar el ingrediente.');
    } finally {
      setGuardando(false);
    }
  };

  const handleIniciarEdicion = (ing: Ingrediente) => {
    setEditandoId(ing.id);
    setNombreEditado(ing.nombre);
    setStockEditado(String(ing.stock));
    setConfirmandoEliminarId(null);
    setError(null);
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setNombreEditado('');
    setStockEditado('0');
  };

  const handleGuardarCambios = async (id: number) => {
    if (guardando) return;
    setError(null);

    const resultado = crearIngredienteSchema.safeParse({
      nombre: nombreEditado,
      stock: stockEditado.trim() === '' ? undefined : Number(stockEditado),
    });

    if (!resultado.success) {
      setError(resultado.error.issues[0]?.message ?? 'Revisá los datos del ingrediente');
      return;
    }

    try {
      setGuardando(true);
      const actualizado = await actualizarIngrediente(id, resultado.data);
      setIngredientes((prev) => prev.map((item) => item.id === id ? actualizado : item));
      handleCancelarEdicion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el ingrediente.');
    } finally {
      setGuardando(false);
    }
  };

  const handleIngredienteCreado = (nuevo: Ingrediente) => {
    setIngredientes((prev) => [...prev, nuevo]);
  };

  if (cargando) return <p>Cargando ingredientes...</p>;

  return (
    <div className="ingredientes-container">
      <h2> Gestión de Stock de Ingredientes</h2>
      <CrearIngredienteForm onIngredienteCreado={handleIngredienteCreado} />

      {error && <div className="error-message" role="alert">⚠️ {error}</div>}

      {ingredientes.length === 0 && !error ? (
        <p>No hay ingredientes registrados.</p>
      ) : (
        <table className="ingredientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.map((ing) => (
              <tr key={ing.id}>
                <td>
                  {editandoId === ing.id ? (
                    <input
                      type="text"
                      value={nombreEditado}
                      onChange={(e) => setNombreEditado(e.target.value)}
                      className="form-input"
                      aria-label="Nombre del ingrediente"
                      disabled={guardando}
                      autoFocus
                    />
                  ) : ing.nombre}
                </td>
                <td>
                  {editandoId === ing.id ? (
                    <input
                      type="number"
                      value={stockEditado}
                      onChange={(e) => setStockEditado(e.target.value)}
                      min="0"
                      step="0.01"
                      className="form-input"
                      aria-label="Stock del ingrediente"
                      disabled={guardando}
                    />
                  ) : ing.stock}
                </td>
                <td>
                  {editandoId === ing.id ? (
                    <>
                      <button
                        type="button"
                        className="btn-submit"
                        disabled={guardando}
                        onClick={() => void handleGuardarCambios(ing.id)}
                      >
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button type="button" disabled={guardando} onClick={handleCancelarEdicion}>
                        Cancelar
                      </button>
                    </>
                  ) : confirmandoEliminarId === ing.id ? (
                    <>
                      <span className="confirmar-texto">¿Eliminar?</span>
                      <button
                        type="button"
                        className="btn-eliminar"
                        disabled={guardando}
                        onClick={() => void handleConfirmarEliminar(ing.id)}
                      >
                        Sí
                      </button>
                      <button type="button" disabled={guardando} onClick={handleCancelarEliminar}>
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" disabled={guardando} onClick={() => handleIniciarEdicion(ing)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-eliminar"
                        disabled={guardando}
                        onClick={() => handleSolicitarEliminar(ing.id)}
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