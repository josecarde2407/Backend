const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Título del problema
  description: { type: String, required: true }, // Descripción detallada del problema
  status: { type: String, default: 'Nuevo' }, // Estado del problema (ej: Abierto, Cerrado, etc.)
  createdAt: { type: Date, default: Date.now }, // Fecha de creación
  updatedAt: { type: Date, default: Date.now }, // Fecha de última actualización
});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('Issue', issueSchema);
