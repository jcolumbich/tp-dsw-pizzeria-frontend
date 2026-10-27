import { useState } from 'react';
import { getRepartidores } from '../services/repartidorService';
import { useListado } from '../hooks/useListado';
import Paginacion from './Paginacion';

interface Props {
  valor: number | '';
  onChange: (id: number | '') => void;
  soloActivos?: boolean;
  deshabilitado?: boolean;
}
export default function SelectorRepartidor({ valor, onChange, soloActivos, deshabilitado }: Props) {
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [seleccion, setSeleccion] = useState<{ id: number; nombre: string } | null>(null);
  const { data, paginacion, cargando, error, recargar } = useListado(getRepartidores, {
    busqueda, pagina, limite: 10, estado: soloActivos ? true : undefined,
  });
  const buscar = () => { setBusqueda(texto.trim()); setPagina(1); recargar(); };
  return (
    <div className="form-group">
      <label>Buscar repartidor
        <input type="search" maxLength={120} value={texto} disabled={deshabilitado}
          onChange={event => setTexto(event.target.value)}
          onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); buscar(); } }} />
      </label>
      <button type="button" disabled={deshabilitado} onClick={buscar}>Buscar repartidor</button>
      <label>Repartidor
        <select value={valor} disabled={deshabilitado || cargando} onChange={event => {
          const id = event.target.value === '' ? '' : Number(event.target.value);
          const persona = data.find(item => item.id === id);
          setSeleccion(persona ? { id: persona.id, nombre: `${persona.nombre} ${persona.apellido} — ${persona.matricula}` } : null);
          onChange(id);
        }}>
          <option value="">{soloActivos ? 'Seleccioná un repartidor' : 'Todos los repartidores'}</option>
          {valor !== '' && !data.some(item => item.id === valor) &&
            <option value={valor}>{seleccion?.id === valor ? seleccion.nombre : `Repartidor #${valor}`}</option>}
          {data.map(persona => <option key={persona.id} value={persona.id}>
            {persona.nombre} {persona.apellido} — {persona.matricula}
          </option>)}
        </select>
      </label>
      {cargando && <p role="status">Cargando repartidores…</p>}
      {error && <p role="alert">{error} <button type="button" onClick={recargar}>Reintentar</button></p>}
      {!cargando && !error && data.length === 0 && <p>No hay repartidores para esta búsqueda.</p>}
      <Paginacion datos={paginacion} cambiarPagina={setPagina} deshabilitada={deshabilitado || cargando} etiqueta="Páginas de repartidores" />
    </div>
  );
}