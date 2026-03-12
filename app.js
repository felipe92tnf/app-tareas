const taskFormElement = document.getElementById("task-form");
const taskInputElement = document.getElementById("task-input");

const pendingTasksContainer = document.getElementById("task-list");
const completedTasksContainer = document.getElementById("completed-list");

const searchInputElement = document.getElementById("task-search");

const TASKS_STORAGE_KEY = "tareas";

let tasks = [];

// ---------- LocalStorage ----------

/**
 * Persiste el estado actual de las tareas en localStorage.
 *
 * @param {{ id: string; text: string; done: boolean }[]} [tasksToSave=tasks]
 *   Lista de tareas a guardar. Por defecto usa el array global `tasks`.
 */
function saveTasksToStorage(tasksToSave = tasks) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasksToSave));
}

/**
 * Carga las tareas desde localStorage y las normaliza al formato actual.
 *
 * - Convierte strings antiguos en objetos tarea.
 * - Asegura que cada tarea tenga `id`, `text` y `done`.
 * - Elimina tareas sin texto.
 */
function loadTasksFromStorage() {
  const raw = localStorage.getItem(TASKS_STORAGE_KEY);
  const data = raw ? JSON.parse(raw) : [];

  /**
   * Genera un identificador único para una tarea.
   *
   * @returns {string} Id único.
   */
  const createId = () =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random();

  /**
   * Normaliza un item procedente de localStorage al formato de tarea actual.
   *
   * @param {string | { id?: string; text?: string; done?: boolean }} rawItem
   * @returns {{ id: string; text: string; done: boolean }}
   */
  const normalizeTask = (rawItem) => {
    if (typeof rawItem === "string") {
      return {
        id: createId(),
        text: rawItem,
        done: false,
      };
    }

    const text = (rawItem.text ?? "").trim();

    return {
      id: rawItem.id ?? createId(),
      text,
      done: Boolean(rawItem.done),
    };
  };

  tasks = Array.isArray(data)
    ? data.map(normalizeTask).filter((t) => t.text !== "")
    : [];

  // Guardar ya normalizado para no volver a fallar
  saveTasksToStorage();
}

// ---------- UI ----------

/**
 * Crea el nodo DOM que representa visualmente una tarea.
 *
 * @param {{ id: string; text: string; done: boolean }} task
 *   Tarea a representar.
 * @returns {HTMLElement} Artículo con la tarjeta de tarea.
 */
function createTaskCard(task) {
  const taskEl = document.createElement("article");
  taskEl.className =
    "flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 shadow-sm";

  const info = document.createElement("div");
  info.className = "min-w-0";

  const title = document.createElement("h3");
  title.className = "font-semibold text-gray-900 dark:text-gray-100 truncate";
  title.textContent = task.text;

  const category = document.createElement("p");
  category.className = "text-sm text-gray-500 dark:text-gray-300";
  category.textContent = "General";

  info.appendChild(title);
  info.appendChild(category);

  const actionsContainer = document.createElement("div");
  actionsContainer.className = "flex items-center gap-2 shrink-0";

  const createButton = (text, classNames, onClick) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.className = classNames.join(" ");
    button.addEventListener("click", onClick);
    return button;
  };

  const refreshListView = () => {
    saveTasksToStorage();
    renderTaskLists(searchInputElement ? searchInputElement.value : "");
  };

  const completeBtn = createButton(
    task.done ? "Deshacer" : "Completar",
    [
      "px-3 py-2 rounded-lg text-sm font-semibold",
      "bg-blue-600 text-white hover:bg-blue-700",
      "active:scale-[0.98] transition",
      "focus:outline-none focus:ring-2 focus:ring-blue-400",
    ],
    () => {
      task.done = !task.done;
      refreshListView();
    }
  );

  const deleteBtn = createButton(
    "✕",
    [
      "px-3 py-2 rounded-lg text-sm font-semibold",
      "bg-red-600 text-white hover:bg-red-700",
      "active:scale-[0.98] transition",
      "focus:outline-none focus:ring-2 focus:ring-red-400",
    ],
    () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      refreshListView();
    }
  );

  actionsContainer.appendChild(completeBtn);
  actionsContainer.appendChild(deleteBtn);

  taskEl.appendChild(info);
  taskEl.appendChild(actionsContainer);

  // extra visual para completadas
  if (task.done) {
    taskEl.classList.add("opacity-70");
    title.classList.add("line-through");
  }

  return taskEl;
}

/**
 * Renderiza las listas de tareas pendientes y completadas en la interfaz.
 *
 * @param {string} [filterText=""]
 *   Texto de búsqueda para filtrar tareas por su descripción.
 */
function renderTaskLists(filterText = "") {
  pendingTasksContainer.innerHTML = "";
  completedTasksContainer.innerHTML = "";

  const query = (filterText || "").toLowerCase();

  const filteredTasks = tasks.filter((task) =>
    (task.text || "").toLowerCase().includes(query)
  );

  const pendingTasks = tasks.filter((task) => !task.done);
  const counterEl = document.getElementById("task-count");
  if (counterEl) {
    counterEl.textContent = pendingTasks.length;
  }

  filteredTasks.forEach((task) => {
    const card = createTaskCard(task);
    const list = task.done ? completedTasksContainer : pendingTasksContainer;
    list.appendChild(card);
  });
}

// ---------- Eventos ----------
taskFormElement.addEventListener("submit", (event) => {
  event.preventDefault();

  const newTaskText = taskInputElement.value.trim();
  if (!newTaskText) return;

  tasks.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
    text: newTaskText,
    done: false,
  });

  saveTasksToStorage();
  renderTaskLists(searchInputElement ? searchInputElement.value : "");

  taskInputElement.value = "";
  taskInputElement.focus();
});

if (searchInputElement) {
  searchInputElement.addEventListener("input", () => {
    renderTaskLists(searchInputElement.value);
  });
}

// ---------- Init ----------
loadTasksFromStorage();
renderTaskLists();
