import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Tareas from './pages/Tareas.jsx';
import DetalleTarea from './pages/DetalleTarea.jsx';
import { API_URL } from './api.js';
import './styles.css';

function App() {
  return (
    <BrowserRouter>
      <header className="barra">
        <Link to="/tareas" className="logo">TaskFlow</Link>
        <span className="api">API: {API_URL || 'sin configurar'}</span>
      </header>
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Navigate to="/tareas" replace />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/tareas/:id" element={<DetalleTarea />} />
          <Route path="*" element={<p>Página no encontrada. <Link to="/tareas">Volver</Link></p>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
