const { Schema, model } = require('mongoose');

// Misma colección y campos que el seed de la Clase 1 (db.tareas)
const tareaSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true },
    completada: { type: Boolean, default: false },
    prioridad: { type: String, enum: ['baja', 'media', 'alta'], default: 'media' },
    origen: { type: String },
    creadaEn: { type: Date, default: Date.now },
  },
  { collection: 'tareas', versionKey: false }
);

module.exports = model('Tarea', tareaSchema);
