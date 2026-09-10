import { useState } from "react";
import { crearIngrediente } from "../services/ingredientesService";
import "./Formularios.css";

function FormularioIngrediente() {
  const [nombre, setNombre] = useState("");
  const [stock, setStock] = useState(0);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    crearIngrediente(nombre, Number(stock))
      .then(() => {
        setMensaje("¡Ingrediente creado con éxito!");
        setNombre("");
        setStock(0);
      })
      .catch(() => setMensaje("Hubo un error al crear el ingrediente"));
  };

  return (
    <div className="formulario">
      <h2>Nuevo Ingrediente</h2>
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
          <label>Stock</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
          />
        </div>

        <button type="submit" className="boton-principal">
          Crear Ingrediente
        </button>
      </form>

      {mensaje && <p className="mensaje-formulario">{mensaje}</p>}
    </div>
  );
}

export default FormularioIngrediente;