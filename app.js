/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} text
 * @property {boolean} done
 * @property {"low" | "medium" | "high"} priority
 * @property {string | null} dueDate
 * @property {string} category
 */

// ---------- Selectores de DOM ----------

const taskFormElement = document.getElementById("task-form");
const taskInputElement = document.getElementById("task-input");
const taskCategoryElement = document.getElementById("task-category");
const taskPriorityElement = document.getElementById("task-priority");
const taskDueDateElement = document.getElementById("task-due-date");
const bulkCompleteAllButton = document.getElementById("bulk-complete-all");
const bulkDeleteCompletedButton = document.getElementById("bulk-delete-completed");
const bulkClearAllButton = document.getElementById("bulk-clear-all");

const pendingTasksContainer = document.getElementById("task-list");
const completedTasksContainer = document.getElementById("completed-list");

const searchInputElement = document.getElementById("task-search");
const taskCountElement = document.getElementById("task-count");
const categoryInputElement = document.getElementById("category-input");
const categoryAddButton = document.getElementById("category-add");
const categoryListElement = document.getElementById("category-list");

// ---------- Estado y constantes ----------

const TASKS_STORAGE_KEY = "tareas";
const CATEGORIES_STORAGE_KEY = "categorias";

/** @type {Task[]} */
let tasks = [];

/** @type {string[]} */
let categories = [];

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
 * @param {string | { id?: string; text?: string; done?: boolean; priority?: string; dueDate?: string | null; category?: string }} rawItem
 * @returns {Task}
 */
function normalizeTask(rawItem) {
  if (typeof rawItem === "string") {
    return {
      id: generateTaskId(),
      text: rawItem,
      done: false,
      priority: "medium",
      dueDate: null,
      category: "General",
    };
  }

  const text = typeof rawItem?.text === "string" ? rawItem.text.trim() : "";
  const priorityRaw = typeof rawItem?.priority === "string" ? rawItem.priority : "medium";
  const normalizedPriority =
    priorityRaw === "high" || priorityRaw === "low" || priorityRaw === "medium"
      ? priorityRaw
      : "medium";
  const dueDateRaw =
    typeof rawItem?.dueDate === "string" && rawItem.dueDate.trim()
      ? rawItem.dueDate
      : null;
  const categoryRaw = typeof rawItem?.category === "string" ? rawItem.category.trim() : "";
  const normalizedCategory = categoryRaw || "General";

  return {
    id: rawItem?.id || generateTaskId(),
    text,
    done: Boolean(rawItem?.done),
    priority: normalizedPriority,
    dueDate: dueDateRaw,
    category: normalizedCategory,
  };
}

function normalizeCategoryName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

function saveCategoriesToStorage(categoriesSnapshot = categories) {
  const dataToPersist = Array.isArray(categoriesSnapshot) ? categoriesSnapshot : [];
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(dataToPersist));
  } catch (error) {
    console.error("[TaskFlow] Error al guardar categorías:", error);
  }
}

function loadCategoriesFromStorage() {
  const parsed = safeJsonParse(localStorage.getItem(CATEGORIES_STORAGE_KEY));
  const rawList = Array.isArray(parsed) ? parsed : [];
  const defaults = ["General", "Trabajo", "Estudio", "Personal"];
  const normalized = rawList.map(normalizeCategoryName).filter(Boolean);
  categories = Array.from(new Set([...defaults, ...normalized]));
  saveCategoriesToStorage();
}

function renderCategoryList() {
  if (!categoryListElement) return;
  categoryListElement.innerHTML = "";

  categories.forEach((cat) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-semibold transition bg-white text-gray-800 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700/60";
    button.textContent = cat;
    button.addEventListener("click", () => {
      if (taskCategoryElement) taskCategoryElement.value = cat;
    });
    li.appendChild(button);
    categoryListElement.appendChild(li);
  });
}

function renderCategorySelect() {
  if (!taskCategoryElement) return;
  taskCategoryElement.innerHTML = "";

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    taskCategoryElement.appendChild(option);
  });

  if (!taskCategoryElement.value) taskCategoryElement.value = "General";
}

function getPriorityBadgeClasses(priority) {
  if (priority === "high") return ["bg-red-500", "text-white", "border-red-700"];
  if (priority === "low") return ["bg-green-500", "text-white", "border-green-700"];
  return ["bg-yellow-400", "text-black", "border-yellow-600"];
}

function getPriorityLabel(priority) {
  if (priority === "high") return "Alta";
  if (priority === "low") return "Baja";
  return "Media";
}

function toLocalMidnight(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDueDate(dueDateString) {
  if (!dueDateString) return null;
  const [y, m, d] = dueDateString.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function getDueLabel(dueDateString) {
  const dueDate = parseDueDate(dueDateString);
  if (!dueDate) return null;

  const today = toLocalMidnight(new Date());
  const due = toLocalMidnight(dueDate);
  const diffDays = Math.round((due - today) / 86400000);

  if (diffDays === 0) return "Vence hoy";
  if (diffDays === 1) return "Vence mañana";

  const formatted = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(due);

  return `Vence: ${formatted}`;
}

function isTaskOverdue(task) {
  if (task.done) return false;
  const due = parseDueDate(task.dueDate);
  if (!due) return false;
  const today = toLocalMidnight(new Date());
  return toLocalMidnight(due) < today;
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

function completeAllTasks() {
  if (tasks.length === 0) return;
  tasks = tasks.map(task => ({ ...task, done: true }));
  refreshListView();
}

function deleteCompletedTasks() {
  const completedCount = getCompletedTasks(tasks).length;
  if (completedCount === 0) return;
  const ok = confirm(`¿Borrar ${completedCount} tarea(s) completada(s)?`);
  if (!ok) return;
  tasks = tasks.filter(task => task.done !== true);
  refreshListView();
}

function clearAllTasks() {
  if (tasks.length === 0) return;
  const ok = confirm("¿Vaciar todas las tareas? Esta acción no se puede deshacer.");
  if (!ok) return;
  tasks = [];
  refreshListView();
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

  if (isTaskOverdue(task)) {
    taskEl.classList.add("border-red-300", "bg-red-50");
  }

  const taskInfoContainer = document.createElement("div");
  taskInfoContainer.className = "min-w-0";

  const title = document.createElement("h3");
  title.className = "font-semibold text-gray-900 dark:text-gray-100 truncate";
  title.textContent = task.text;

  const metaRow = document.createElement("div");
  metaRow.className = "flex flex-wrap items-center gap-2 mt-1";

  const priorityBadge = document.createElement("span");
  priorityBadge.className =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border";
  const priority = task.priority || "medium";
  priorityBadge.textContent = getPriorityLabel(priority);
  priorityBadge.classList.add(...getPriorityBadgeClasses(priority));

  const dueLabel = getDueLabel(task.dueDate);
  const dueBadge = document.createElement("span");
  dueBadge.className =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border";

  if (dueLabel) {
    dueBadge.textContent = dueLabel;
    if (isTaskOverdue(task)) {
      dueBadge.classList.add("bg-red-500", "text-white", "border-red-700");
    } else if (dueLabel === "Vence hoy") {
      dueBadge.classList.add("bg-yellow-400", "text-black", "border-yellow-600");
    } else if (dueLabel === "Vence mañana") {
      dueBadge.classList.add("bg-green-500", "text-white", "border-green-700");
    } else {
      dueBadge.classList.add("bg-gray-100", "text-gray-800", "border-gray-300");
    }
  } else {
    dueBadge.classList.add("hidden");
  }

  metaRow.appendChild(priorityBadge);
  metaRow.appendChild(dueBadge);

  taskInfoContainer.appendChild(title);
  taskInfoContainer.appendChild(metaRow);

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

  const categoryValue =
    taskCategoryElement && taskCategoryElement.value
      ? taskCategoryElement.value
      : "General";

  const priorityValue = taskPriorityElement && taskPriorityElement.value
    ? taskPriorityElement.value
    : "medium";
  const dueDateValue =
    taskDueDateElement && taskDueDateElement.value
      ? taskDueDateElement.value
      : null;

  tasks.push({
    id: generateTaskId(),
    text: newTaskText,
    done: false,
    priority: priorityValue === "high" || priorityValue === "low" || priorityValue === "medium"
      ? priorityValue
      : "medium",
    dueDate: dueDateValue,
    category: categoryValue,
  });

  refreshListView();

  taskInputElement.value = "";
  if (taskDueDateElement) taskDueDateElement.value = "";
  if (taskCategoryElement) taskCategoryElement.value = "General";
  taskInputElement.focus();
});

if (searchInputElement) {
  searchInputElement.addEventListener("input", () => {
    renderTaskLists(searchInputElement.value);
  });
}

if (bulkCompleteAllButton) {
  bulkCompleteAllButton.addEventListener("click", () => {
    completeAllTasks();
  });
}

if (bulkDeleteCompletedButton) {
  bulkDeleteCompletedButton.addEventListener("click", () => {
    deleteCompletedTasks();
  });
}

if (bulkClearAllButton) {
  bulkClearAllButton.addEventListener("click", () => {
    clearAllTasks();
  });
}

if (categoryAddButton && categoryInputElement) {
  const addCategory = () => {
    const name = normalizeCategoryName(categoryInputElement.value);
    if (!name) return;
    if (categories.includes(name)) {
      categoryInputElement.value = "";
      return;
    }
    categories = [...categories, name];
    saveCategoriesToStorage();
    renderCategoryList();
    renderCategorySelect();
    categoryInputElement.value = "";
  };

  categoryAddButton.addEventListener("click", addCategory);
  categoryInputElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCategory();
    }
  });
}

// ---------- Init ----------

loadCategoriesFromStorage();
renderCategoryList();
renderCategorySelect();
loadTasksFromStorage();
renderTaskLists();
