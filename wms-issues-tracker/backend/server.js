require('dotenv').config(); // Cargar las variables de entorno desde .env
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const issueRoutes = require('./routes/issues'); // Importar las rutas de los problemas

const app = express();

app.use(cors()); // Habilitar CORS para solicitudes de otros dominios
app.use(bodyParser.json()); // Usar bodyParser para parsear JSON en las solicitudes

// Conectar a MongoDB usando la URI de .env
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch((error) => console.log('Error al conectar a MongoDB', error));

// Usar las rutas de los problemas
app.use('/api', issueRoutes);

// Iniciar el servidor
app.listen(process.env.PORT || 5000, () => {
  console.log('Servidor corriendo en el puerto 5000');
});

