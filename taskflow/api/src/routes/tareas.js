const { Router } = require('express');
const { isValidObjectId } = require('mongoose');
const Tarea = require('../models/Tarea');

const router = Router();

const validarId = (req, res, next) =>
  isValidObjectId(req.params.id) ? next() : res.status(400).json({ error: 'Id no válido' });

router.get('/', async (req, res, next) => {
  try {
    res.json(await Tarea.find().sort({ creadaEn: -1 }));
  } catch (err) { next(err); }
});

router.get('/:id', validarId, async (req, res, next) => {
  try {
    const tarea = await Tarea.findById(req.params.id);
    tarea ? res.json(tarea) : res.status(404).json({ error: 'Tarea no encontrada' });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { titulo, prioridad } = req.body;
    if (!titulo || !titulo.trim()) return res.status(400).json({ error: 'El título es obligatorio' });
    res.status(201).json(await Tarea.create({ titulo, prioridad }));
  } catch (err) { next(err); }
});

router.patch('/:id', validarId, async (req, res, next) => {
  try {
    const { titulo, completada, prioridad } = req.body;
    const tarea = await Tarea.findByIdAndUpdate(
      req.params.id,
      { $set: Object.fromEntries(Object.entries({ titulo, completada, prioridad }).filter(([, v]) => v !== undefined)) },
      { new: true, runValidators: true }
    );
    tarea ? res.json(tarea) : res.status(404).json({ error: 'Tarea no encontrada' });
  } catch (err) { next(err); }
});

router.delete('/:id', validarId, async (req, res, next) => {
  try {
    const tarea = await Tarea.findByIdAndDelete(req.params.id);
    tarea ? res.status(204).end() : res.status(404).json({ error: 'Tarea no encontrada' });
  } catch (err) { next(err); }
});

router.use((err, req, res, next) => {
  console.error('[taskflow-api]', err.message);
  res.status(err.name === 'ValidationError' ? 400 : 500).json({ error: err.message });
});

module.exports = router;
