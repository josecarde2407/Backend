require("dotenv").config({ path: __dirname + "/.env" });
//console.log("BASE_URL from dotenv:", process.env.BASE_URL);

const express = require("express");
const cors = require("cors");
const path = require("path");
const { registerAPIs } = require("./apis");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Ruta de prueba de vida
app.get("/api/ping", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Registrar todas las APIs desde apis.js
registerAPIs(app);

// Arrancar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
  console.log(`🧪 Abre http://localhost:${PORT}/ para probar el dashboard básico`);
});
