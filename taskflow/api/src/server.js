const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const tareasRouter = require('./routes/tareas');

// Toda la configuración llega por variables de entorno (nada escrito en el código)
const variableInutil = 123
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:5173';

if (!MONGO_URI) {
  console.error('[taskflow-api] Falta la variable de entorno MONGO_URI');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: CORS_ORIGIN.split(',').map((o) => o.trim()) }));
app.use(express.json());

// Log sencillo de cada petición (se ve con: docker logs -f api)
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - inicio}ms`);
  });
  next();
});

app.get('/health', (req, res) => {
  const estados = ['desconectado', 'conectado', 'conectando', 'desconectando'];
  res.json({ status: 'ok', db: estados[mongoose.connection.readyState] || 'desconocido' });
});

app.use('/api/tareas', tareasRouter);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[taskflow-api] Conectado a MongoDB');
    app.listen(PORT, () => console.log(`[taskflow-api] Escuchando en el puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('[taskflow-api] No se pudo conectar a MongoDB:', err.message);
    process.exit(1);
  });

// Apagado limpio cuando Docker envía SIGTERM (docker stop)
process.on('SIGTERM', async () => {
  console.log('[taskflow-api] SIGTERM recibido, cerrando...');
  await mongoose.connection.close();
  process.exit(0);
});
