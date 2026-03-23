let tasks = [];

function getAllTasks() {
  return tasks;
}

function createTask(data) {
  const newTask = {
    id: Date.now().toString(),
    text: data.text,
    done: false,
    priority: data.priority || "medium",
    dueDate: data.dueDate || null,
    category: data.category || "General",
  };

  tasks.push(newTask);
  return newTask;
}

function updateTask(id, updates) {
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    throw new Error("NOT_FOUND");
  }

  if (typeof updates.text === "string") {
    task.text = updates.text;
  }

  if (typeof updates.done === "boolean") {
    task.done = updates.done;
  }

  if (["low", "medium", "high"].includes(updates.priority)) {
    task.priority = updates.priority;
  }

  if (typeof updates.dueDate === "string" || updates.dueDate === null) {
    task.dueDate = updates.dueDate;
  }

  if (typeof updates.category === "string" && updates.category.trim()) {
    task.category = updates.category.trim();
  }

  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    throw new Error("NOT_FOUND");
  }

  tasks.splice(index, 1);
}

function deleteCompletedTasks() {
  tasks = tasks.filter((task) => !task.done);
}

function clearAllTasks() {
  tasks = [];
}

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteCompletedTasks,
  clearAllTasks,
};