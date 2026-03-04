const form = document.getElementById("task-form");
const input = document.getElementById("task-input");

const pendingList = document.getElementById("task-list");
const completedList = document.getElementById("completed-list");

const searchInput = document.getElementById("task-search");

const STORAGE_KEY = "tareas";

let tareas = [];

// guardar en localStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

// cargar tareas guardadas
function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  tareas = raw ? JSON.parse(raw) : [];
}

// crear tarjeta de tarea
function createTaskCard(task) {

  const taskEl = document.createElement("article");
  taskEl.classList.add("tarea");

  const info = document.createElement("div");
  info.classList.add("info");

  const title = document.createElement("h3");
  title.textContent = task.text;

  const category = document.createElement("p");
  category.classList.add("categoria");
  category.textContent = "General";

  info.appendChild(title);
  info.appendChild(category);

  const actions = document.createElement("div");

  const completeBtn = document.createElement("button");
  completeBtn.textContent = task.done ? "Deshacer" : "Completar";

  completeBtn.addEventListener("click", function () {

    task.done = !task.done;

    saveTasks();
    render();

  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Eliminar";

  deleteBtn.addEventListener("click", function () {

    tareas = tareas.filter(t => t.id !== task.id);

    saveTasks();
    render();

  });

  actions.appendChild(completeBtn);
  actions.appendChild(deleteBtn);

  taskEl.appendChild(info);
  taskEl.appendChild(actions);

  return taskEl;
}

// renderizar tareas
function render(filterText = "") {

  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  const texto = filterText.toLowerCase();

  tareas
    .filter(t => t.text.toLowerCase().includes(texto))
    .forEach(task => {

      const card = createTaskCard(task);

      if (task.done) {
        completedList.appendChild(card);
      } else {
        pendingList.appendChild(card);
      }

    });
}

// añadir tarea
form.addEventListener("submit", function (e) {

  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  tareas.push({
    id: crypto.randomUUID(),
    text: text,
    done: false
  });

  saveTasks();
  render();

  input.value = "";

});

// buscador
searchInput.addEventListener("input", function () {

  render(searchInput.value);

});

// iniciar app
loadTasks();
render();