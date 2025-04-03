const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue'); // Importamos el modelo

// Crear un nuevo problema
router.post('/issues', async (req, res) => {
  try {
    const newIssue = new Issue(req.body); // Creamos un nuevo problema con los datos del cuerpo de la solicitud
    await newIssue.save(); // Guardamos el nuevo problema en la base de datos
    res.status(201).json(newIssue); // Respondemos con el problema creado
  } catch (error) {
    res.status(400).json({ error: error.message }); // Si hay un error, lo respondemos
  }
});

// Obtener todos los problemas
router.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find(); // Buscamos todos los problemas en la base de datos
    res.status(200).json(issues); // Respondemos con la lista de problemas
  } catch (error) {
    res.status(400).json({ error: error.message }); // Si hay un error, lo respondemos
  }
});

// Actualizar un problema por ID
router.put('/issues/:id', async (req, res) => {
  try {
    const updatedIssue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Actualizamos el problema
    if (!updatedIssue) {
      return res.status(404).json({ message: 'Problema no encontrado' });
    }
    res.status(200).json(updatedIssue); // Respondemos con el problema actualizado
  } catch (error) {
    res.status(400).json({ error: error.message }); // Si hay un error, lo respondemos
  }
});

// Eliminar un problema por ID
router.delete('/issues/:id', async (req, res) => {
  try {
    const deletedIssue = await Issue.findByIdAndDelete(req.params.id); // Eliminamos el problema
    if (!deletedIssue) {
      return res.status(404).json({ message: 'Problema no encontrado' });
    }
    res.status(200).json({ message: 'Problema eliminado' }); // Respondemos con un mensaje de éxito
  } catch (error) {
    res.status(400).json({ error: error.message }); // Si hay un error, lo respondemos
  }
});

module.exports = router;
