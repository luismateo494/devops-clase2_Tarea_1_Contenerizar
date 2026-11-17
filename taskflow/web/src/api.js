// Vite reemplaza import.meta.env.VITE_API_URL en tiempo de build.
// En Docker el valor llega con --build-arg VITE_API_URL=...
export const API_URL = import.meta.env.VITE_API_URL;

async function pedir(ruta, opciones = {}) {
  const res = await fetch(`${API_URL}/api/tareas${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({}));
    throw new Error(cuerpo.error || `Error ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const listarTareas = () => pedir('');
export const obtenerTarea = (id) => pedir(`/${id}`);
export const crearTarea = (datos) => pedir('', { method: 'POST', body: JSON.stringify(datos) });
export const actualizarTarea = (id, datos) => pedir(`/${id}`, { method: 'PATCH', body: JSON.stringify(datos) });
export const eliminarTarea = (id) => pedir(`/${id}`, { method: 'DELETE' });
