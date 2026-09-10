import { useState } from "react";
import { crearRepartidor } from "../services/repartidoresService";
import "./Formularios.css";

function FormularioRepartidor() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [matricula, setMatricula] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    crearRepartidor(nombre, apellido, matricula)
      .then(() => {
        setMensaje("¡Repartidor creado con éxito!");
        setNombre("");
        setApellido("");
        setMatricula("");
      })
      .catch(() => setMensaje("Hubo un error al crear el repartidor"));
  };

  return (
    <div className="formulario">
      <h2>Nuevo Repartidor</h2>
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
          <label>Apellido</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
        </div>

        <div className="campo-formulario">
          <label>Matrícula</label>
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
          />
        </div>

        <button type="submit" className="boton-principal">
          Crear Repartidor
        </button>
      </form>

      {mensaje && <p className="mensaje-formulario">{mensaje}</p>}
    </div>
  );
}

export default FormularioRepartidor;