import { useState } from "react";
import { crearCliente } from "../services/clientesService";
import "./Formularios.css";

function FormularioCliente() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    crearCliente(nombre, apellido, domicilio)
      .then(() => {
        setMensaje("¡Cliente creado con éxito!");
        setNombre("");
        setApellido("");
        setDomicilio("");
      })
      .catch(() => setMensaje("Hubo un error al crear el cliente"));
  };

  return (
    <div className="formulario">
      <h2>Nuevo Cliente</h2>
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
          <label>Domicilio</label>
          <input
            type="text"
            value={domicilio}
            onChange={(e) => setDomicilio(e.target.value)}
          />
        </div>

        <button type="submit" className="boton-principal">
          Crear Cliente
        </button>
      </form>

      {mensaje && <p className="mensaje-formulario">{mensaje}</p>}
    </div>
  );
}

export default FormularioCliente;