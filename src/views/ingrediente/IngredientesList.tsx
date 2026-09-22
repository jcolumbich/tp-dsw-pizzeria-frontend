import { useEffect, useState } from 'react';
import type { Ingrediente } from '../../interfaces/ingrediente';
import {
  getIngredientes,
  eliminarIngrediente,
  actualizarIngrediente,
} from '../../services/ingredienteService';
import CrearIngredienteForm from './crearIngredienteForm';

export default function IngredientesList() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState<string>('');
  const [stockEditado, setStockEditado] = useState<number>(0);

  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<number | null>(null);

  useEffect(() => {
    cargarIngredientes();
  }, []);

  const cargarIngredientes = async () => {
    try {
      setCargando(true);
      const data = await getIngredientes();
      setIngredientes(data);
      setError(null);
    } catch (err) {
      setError('No se pudo conectar con el servidor para obtener los ingredientes.');
      console.error(err);
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
    try {
      await eliminarIngrediente(id);
      setIngredientes((prev) => prev.filter((item) => item.id !== id));
      setConfirmandoEliminarId(null);
    } catch (err) {
      setError('Error al intentar eliminar el ingrediente.');
      console.error(err);
    }
  };

  const handleIniciarEdicion = (ing: Ingrediente) => {
    setEditandoId(ing.id);
    setNombreEditado(ing.nombre);
    setStockEditado(ing.stock);
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setNombreEditado('');
    setStockEditado(0);
  };

  const handleGuardarCambios = async (id: number) => {
    if (!nombreEditado.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    if (stockEditado < 0) {
      setError('El stock no puede ser negativo.');
      return;
    }
    try {
      const ingredienteActualizado = await actualizarIngrediente(id, {
        nombre: nombreEditado.trim(),
        stock: stockEditado,
      });
      setIngredientes((prev) =>
        prev.map((item) => (item.id === id ? ingredienteActualizado : item))
      );
      setEditandoId(null);
      setError(null);
    } catch (err) {
      setError('No se pudo actualizar el ingrediente.');
      console.error(err);
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

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

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
                      autoFocus
                    />
                  ) : (
                    ing.nombre
                  )}
                </td>
                <td>
                  {editandoId === ing.id ? (
                    <input
                      type="number"
                      value={stockEditado}
                      onChange={(e) => setStockEditado(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  ) : (
                    ing.stock
                  )}
                </td>
                <td>
                  {editandoId === ing.id ? (
                    <>
                      <button className="btn-submit" onClick={() => handleGuardarCambios(ing.id)}>
                        Guardar
                      </button>
                      <button onClick={handleCancelarEdicion}>Cancelar</button>
                    </>
                  ) : confirmandoEliminarId === ing.id ? (
                    <>
                      <span className="confirmar-texto">¿Eliminar?</span>
                      <button
                        onClick={() => handleConfirmarEliminar(ing.id)}
                        className="btn-eliminar"
                      >
                        Sí
                      </button>
                      <button onClick={handleCancelarEliminar}>No</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleIniciarEdicion(ing)}>Editar</button>
                      <button
                        onClick={() => handleSolicitarEliminar(ing.id)}
                        className="btn-eliminar"
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