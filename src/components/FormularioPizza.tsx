import { useState, useEffect } from "react";
import type { Ingrediente } from "../types";
import { obtenerIngredientes } from "../services/ingredientesService";
import { crearPizza } from "../services/pizzasService";
import "./Formularios.css";

function FormularioPizza() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState(0);
  const [vegetariana, setVegetariana] = useState(false);
  const [disponible, setDisponible] = useState(true);
  const [ingredientesIds, setIngredientesIds] = useState<number[]>([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    obtenerIngredientes().then(setIngredientes);
  }, []);

  const toggleIngrediente = (id: number) => {
    setIngredientesIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    crearPizza(nombre, Number(precio), vegetariana, disponible, ingredientesIds)
      .then(() => {
        setMensaje("¡Pizza creada con éxito!");
        setNombre("");
        setPrecio(0);
        setVegetariana(false);
        setDisponible(true);
        setIngredientesIds([]);
      })
      .catch(() => setMensaje("Hubo un error al crear la pizza"));
  };

  return (
    <div className="formulario">
      <h2>Nueva Pizza</h2>
      <form onSubmit={handleSubmit}>
        <div className="campo-formulario">
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="campo-formulario">
          <label>Precio</label>
          <input
            type="number"
            min="0"
            value={precio}
            onChange={(e) => setPrecio(Number(e.target.value))}
          />
        </div>
        <div className="campo-formulario">
          <label>
            <input
              type="checkbox"
              checked={vegetariana}
              onChange={(e) => setVegetariana(e.target.checked)}
            />
            Vegetariana
          </label>
        </div>
        <div className="campo-formulario">
          <label>
            <input
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
            />
            Disponible
          </label>
        </div>
        <div className="campo-formulario">
          <label>Ingredientes</label>
          {ingredientes.map((ingrediente) => (
            <label key={ingrediente.id}>
              <input
                type="checkbox"
                checked={ingredientesIds.includes(ingrediente.id)}
                onChange={() => toggleIngrediente(ingrediente.id)}
              />
              {ingrediente.nombre}
            </label>
          ))}
        </div>
        <button type="submit" className="boton-principal">
          Crear Pizza
        </button>
      </form>
      {mensaje && <p className="mensaje-formulario">{mensaje}</p>}
    </div>
  );
}

export default FormularioPizza;