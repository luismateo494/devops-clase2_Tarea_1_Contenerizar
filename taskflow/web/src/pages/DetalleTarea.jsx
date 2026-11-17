import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerTarea } from '../api.js';

// Ruta /tareas/:id — al recargarla en Nginx sin try_files daría 404
export default function DetalleTarea() {
  const { id } = useParams();
  const [tarea, setTarea] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerTarea(id).then(setTarea).catch((e) => setError(e.message));
  }, [id]);

  return (
    <section>
      <Link to="/tareas">← Volver</Link>
      {error && <p className="error">{error}</p>}
      {tarea && (
        <div className="detalle">
          <h1>{tarea.titulo}</h1>
          <p><strong>Estado:</strong> {tarea.completada ? 'Completada' : 'Pendiente'}</p>
          <p><strong>Prioridad:</strong> <span className={`chip ${tarea.prioridad}`}>{tarea.prioridad}</span></p>
          <p><strong>Creada:</strong> {new Date(tarea.creadaEn).toLocaleString('es-DO')}</p>
          <p className="nota">Recarga esta página (F5): si no da 404, el try_files de nginx.conf funciona.</p>
        </div>
      )}
    </section>
  );
}
