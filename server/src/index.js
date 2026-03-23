const express = require("express");
const cors = require("cors");
const { PORT } = require("./config/env");

const taskRoutes = require("./routes/task.routes");

const app = express();

app.use(cors());
app.use(express.json());

// rutas
app.use("/api/v1/tasks", taskRoutes);

// prueba rápida
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando" });
});

// middleware de errores
app.use((err, req, res, next) => {
  if (err.message === "NOT_FOUND") {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});