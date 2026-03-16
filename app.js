/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} text
 * @property {boolean} done
 * @property {"low" | "medium" | "high"} priority
 */

// ---------- Selectores de DOM ----------

const taskFormElement = document.getElementById("task-form");
const taskInputElement = document.getElementById("task-input");
const taskPriorityElement = document.getElementById("task-priority");

const pendingTasksContainer = document.getElementById("task-list");
const completedTasksContainer = document.getElementById("completed-list");

const searchInputElement = document.getElementById("task-search");
const taskCountElement = document.getElementById("task-count");

// ---------- Estado y constantes ----------

const TASKS_STORAGE_KEY = "tareas";

/** @type {Task[]} */
let tasks = [];

// ---------- Utilidades ----------

/**
 * Genera un identificador único para una tarea.
 * @returns {string}
 */
function generateTaskId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return String(Date.now()) + Math.random();
}

/**
 * Intenta parsear JSON de forma segura.
 * @param {string | null} raw
 * @returns {unknown}
 */
function safeJsonParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Normaliza un item procedente de localStorage al formato de tarea actual.
 * @param {string | { id?: string; text?: string; done?: boolean; priority?: string }} rawItem
 * @returns {Task}
 */
function normalizeTask(rawItem) {
  if (typeof rawItem === "string") {
    return {
      id: generateTaskId(),
      text: rawItem,
      done: false,
      priority: "medium",
    };
  }

  const text = typeof rawItem?.text === "string" ? rawItem.text.trim() : "";
  const priorityRaw = typeof rawItem?.priority === "string" ? rawItem.priority : "medium";
  const normalizedPriority =
    priorityRaw === "high" || priorityRaw === "low" || priorityRaw === "medium"
      ? priorityRaw
      : "medium";

  return {
    id: rawItem?.id || generateTaskId(),
    text,
    done: Boolean(rawItem?.done),
    priority: normalizedPriority,
  };
}

/**
 * Devuelve solo las tareas marcadas como completadas.
 *
 * @param {Task[]} tasksList
 *   Lista de tareas a filtrar.
 * @returns {Task[]}
 *   Subconjunto de tareas cuyo campo `done` es true.
 */
function getCompletedTasks(tasksList) {
  return tasksList.filter(task => task.done === true);
}

/**
 * Crea un botón de acción reutilizable.
 * @param {string} label
 * @param {string[]} classNames
 * @param {() => void} onClick
 * @returns {HTMLButtonElement}
 */
function createActionButton(label, classNames, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = classNames.join(" ");
  button.addEventListener("click", onClick);
  return button;
}

/**
 * Guarda la lista de tareas en localStorage.
 *
 * @param {Task[] | null | undefined} tasksSnapshot
 *   Instantánea de tareas a persistir. Por defecto usa el estado global `tasks`.
 */
function saveTasksToStorage(tasksSnapshot = tasks) {
  const dataToPersist = Array.isArray(tasksSnapshot) ? tasksSnapshot : [];

  try {
    const serializedTasks = JSON.stringify(dataToPersist);
    localStorage.setItem(TASKS_STORAGE_KEY, serializedTasks);
  } catch (error) {
    // Útil en desarrollo para detectar problemas de cuota o datos no serializables.
    console.error("[TaskFlow] Error al guardar tareas en localStorage:", error);
  }
}

/**
 * Carga las tareas desde localStorage y las normaliza al formato actual.
 */
function loadTasksFromStorage() {
  const parsed = safeJsonParse(localStorage.getItem(TASKS_STORAGE_KEY));
  const rawList = Array.isArray(parsed) ? parsed : [];

  tasks = rawList
    .map(normalizeTask)
    .filter((task) => task.text !== "");

  // Guardar ya normalizado para no volver a fallar
  saveTasksToStorage();
}

// ---------- UI ----------

/**
 * Refresca el listado en pantalla manteniendo el filtro actual (si lo hay).
 */
function refreshListView() {
  const currentQuery = searchInputElement ? searchInputElement.value : "";
  saveTasksToStorage();
  renderTaskLists(currentQuery);
}

/**
 * Crea el nodo DOM que representa visualmente una tarea.
 * @param {Task} task
 * @returns {HTMLElement}
 */
function createTaskCard(task) {
  const taskEl = document.createElement("article");
  taskEl.className =
    "flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 shadow-sm";

  const taskInfoContainer = document.createElement("div");
  taskInfoContainer.className = "min-w-0";

  const title = document.createElement("h3");
  title.className = "font-semibold text-gray-900 dark:text-gray-100 truncate";
  title.textContent = task.text;

  const priorityBadge = document.createElement("span");
priorityBadge.className =
  "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mt-1";

const priority = task.priority || "medium";

if (priority === "high") {
  priorityBadge.textContent = "Alta";
  priorityBadge.classList.add("bg-red-500", "text-white", "border-red-700");
} else if (priority === "low") {
  priorityBadge.textContent = "Baja";
  priorityBadge.classList.add("bg-green-500", "text-white", "border-green-700");
} else {
  priorityBadge.textContent = "Media";
  priorityBadge.classList.add("bg-yellow-400", "text-black", "border-yellow-600");
}

  taskInfoContainer.appendChild(title);
  taskInfoContainer.appendChild(priorityBadge);

  const actionsContainer = document.createElement("div");
  actionsContainer.className = "flex items-center gap-2 shrink-0";

  let isEditing = false;
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className =
    "w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600";

  const completeButton = createActionButton(
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

  const editButton = createActionButton(
    "Editar",
    [
      "px-3 py-2 rounded-lg text-sm font-semibold",
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      "active:scale-[0.98] transition",
      "focus:outline-none focus:ring-2 focus:ring-yellow-300",
    ],
    () => {
      if (!isEditing) {
        isEditing = true;
        editInput.value = task.text;
        title.replaceWith(editInput);
        editInput.focus();
        editButton.textContent = "Guardar";
        cancelEditButton.classList.remove("hidden");
        return;
      }

      const updatedText = editInput.value.trim();
      if (!updatedText) return;

      task.text = updatedText;
      title.textContent = updatedText;
      editInput.replaceWith(title);
      isEditing = false;
      editButton.textContent = "Editar";
      cancelEditButton.classList.add("hidden");
      refreshListView();
    }
  );

  const cancelEditButton = createActionButton(
    "Cancelar",
    [
      "px-3 py-2 rounded-lg text-sm font-semibold",
      "bg-gray-100 text-gray-800 hover:bg-gray-200",
      "active:scale-[0.98] transition",
      "focus:outline-none focus:ring-2 focus:ring-gray-400",
    ],
    () => {
      if (!isEditing) return;
      editInput.replaceWith(title);
      isEditing = false;
      editButton.textContent = "Editar";
      cancelEditButton.classList.add("hidden");
    }
  );
  cancelEditButton.classList.add("hidden");

  const deleteButton = createActionButton(
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
  deleteButton.setAttribute("aria-label", "Eliminar tarea");

  actionsContainer.appendChild(completeButton);
  actionsContainer.appendChild(editButton);
  actionsContainer.appendChild(cancelEditButton);
  actionsContainer.appendChild(deleteButton);

  taskEl.appendChild(taskInfoContainer);
  taskEl.appendChild(actionsContainer);

  if (task.done) {
    taskEl.classList.add("opacity-70");
    title.classList.add("line-through");
  }

  return taskEl;
}

/**
 * Renderiza las listas de tareas pendientes y completadas en la interfaz.
 * @param {string} [filterText=""]
 */
function renderTaskLists(filterText = "") {
  pendingTasksContainer.innerHTML = "";
  completedTasksContainer.innerHTML = "";

  const query = (filterText || "").toLowerCase();

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const filteredTasks = tasks
    .filter((task) =>
      (task.text || "").toLowerCase().includes(query)
    )
    .sort((a, b) => {
      const pa = priorityOrder[a.priority || "medium"];
      const pb = priorityOrder[b.priority || "medium"];
      if (pa !== pb) return pa - pb;
      return a.text.localeCompare(b.text);
    });

  const pendingTasks = tasks.filter((task) => !task.done);

  if (taskCountElement) {
    taskCountElement.textContent = String(pendingTasks.length);
  }

  filteredTasks.forEach((task) => {
    const card = createTaskCard(task);
    const targetList = task.done
      ? completedTasksContainer
      : pendingTasksContainer;
    targetList.appendChild(card);
  });
}

// ---------- Eventos ----------

taskFormElement.addEventListener("submit", (event) => {
  event.preventDefault();

  const newTaskText = taskInputElement.value.trim();
  if (!newTaskText) return;

  const priorityValue = taskPriorityElement && taskPriorityElement.value
    ? taskPriorityElement.value
    : "medium";

  tasks.push({
    id: generateTaskId(),
    text: newTaskText,
    done: false,
    priority: priorityValue === "high" || priorityValue === "low" || priorityValue === "medium"
      ? priorityValue
      : "medium",
  });

  refreshListView();

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
