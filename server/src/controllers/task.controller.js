const taskService = require("../services/task.service");

function getTasks(req, res) {
  const tasks = taskService.getAllTasks();
  res.json(tasks);
}

function createTask(req, res) {
  const { text, priority, dueDate, category } = req.body;

  if (!text || typeof text !== "string" || text.trim().length < 3) {
    return res.status(400).json({
      error: "El texto es obligatorio y debe tener al menos 3 caracteres",
    });
  }

  const newTask = taskService.createTask({
    text: text.trim(),
    priority,
    dueDate,
    category,
  });

  res.status(201).json(newTask);
}

function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const updatedTask = taskService.updateTask(id, req.body);
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    taskService.deleteTask(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

function deleteCompletedTasks(req, res) {
  taskService.deleteCompletedTasks();
  res.status(204).send();
}

function clearAllTasks(req, res) {
  taskService.clearAllTasks();
  res.status(204).send();
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteCompletedTasks,
  clearAllTasks,
};