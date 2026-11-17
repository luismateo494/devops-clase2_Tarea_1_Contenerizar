import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarTareas, crearTarea, actualizarTarea, eliminarTarea } from '../api.js';

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = () =>
    listarTareas()
      .then((datos) => { setTareas(datos); setError(''); })
      .catch((e) => setError(`No se pudo conectar con la API: ${e.message}`))
      .finally(() => setCargando(false));

  useEffect(() => { cargar(); }, []);

  const agregar = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    try {
      await crearTarea({ titulo, prioridad });
      setTitulo('');
      cargar();
    } catch (e) { setError(e.message); }
  };

  const alternar = (t) => actualizarTarea(t._id, { completada: !t.completada }).then(cargar).catch((e) => setError(e.message));
  const borrar = (t) => eliminarTarea(t._id).then(cargar).catch((e) => setError(e.message));

  const pendientes = tareas.filter((t) => !t.completada).length;

  return (
    <section>
      <h1>Tareas</h1>
      <p className="resumen">{tareas.length} tareas · {pendientes} pendientes</p>

      <form onSubmit={agregar} className="formulario">
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Nueva tarea..." />
        <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
        <button type="submit">Agregar</button>
      </form>

      {error && <p className="error">{error}</p>}
      {cargando && <p>Cargando...</p>}

      <ul className="lista">
        {tareas.map((t) => (
          <li key={t._id} className={t.completada ? 'hecha' : ''}>
            <input type="checkbox" checked={t.completada} onChange={() => alternar(t)} />
            <Link to={`/tareas/${t._id}`} className="titulo">{t.titulo}</Link>
            <span className={`chip ${t.prioridad}`}>{t.prioridad}</span>
            <button className="borrar" onClick={() => borrar(t)} title="Eliminar">✕</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
