/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} text
 * @property {boolean} done
 * @property {"low" | "medium" | "high"} priority
 * @property {string | null} dueDate
 * @property {string} category
 */

// ---------- Config API ----------
const API_URL = "http://localhost:3000/api/v1/tasks";

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

// ---------- Estado ----------
/** @type {Task[]} */
let tasks = [];

/** @type {string[]} */
let categories = ["General", "Trabajo", "Estudio", "Personal"];

// ---------- API ----------
async function parseApiResponse(response) {
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data.error === "string"
        ? data.error
        : "Error en la comunicación con el servidor";
    throw new Error(message);
  }

  return data;
}

/**
 * Obtiene todas las tareas del backend.
 * @returns {Promise<Task[]>}
 */
async function fetchTasks() {
  const response = await fetch(API_URL);
  const data = await parseApiResponse(response);
  return Array.isArray(data) ? data : [];
}

/**
 * Crea una tarea en el backend.
 * @param {{ text: string; priority: "low" | "medium" | "high"; dueDate: string | null; category: string }} taskData
 * @returns {Promise<Task>}
 */
async function createTaskRequest(taskData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  return await parseApiResponse(response);
}

/**
 * Actualiza parcialmente una tarea.
 * @param {string} id
 * @param {Partial<Task>} updates
 * @returns {Promise<Task>}
 */
async function updateTaskRequest(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  return await parseApiResponse(response);
}

/**
 * Elimina una tarea por id.
 * @param {string} id
 * @returns {Promise<void>}
 */
async function deleteTaskRequest(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  await parseApiResponse(response);
}

/**
 * Elimina todas las tareas completadas.
 * @returns {Promise<void>}
 */
async function deleteCompletedTasksRequest() {
  const response = await fetch(`${API_URL}/completed`, {
    method: "DELETE",
  });

  await parseApiResponse(response);
}

/**
 * Elimina todas las tareas.
 * @returns {Promise<void>}
 */
async function clearAllTasksRequest() {
  const response = await fetch(API_URL, {
    method: "DELETE",
  });

  await parseApiResponse(response);
}

// ---------- Utilidades ----------
function normalizeCategoryName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

function mergeCategoriesFromTasks(tasksList) {
  const taskCategories = tasksList
    .map((task) => normalizeCategoryName(task.category || ""))
    .filter(Boolean);

  categories = Array.from(
    new Set(["General", "Trabajo", "Estudio", "Personal", ...taskCategories, ...categories])
  );
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
 * Devuelve solo las tareas completadas.
 * @param {Task[]} tasksList
 * @returns {Task[]}
 */
function getCompletedTasks(tasksList) {
  return tasksList.filter((task) => task.done === true);
}

/**
 * Crea un botón de acción reutilizable.
 * @param {string} label
 * @param {string[]} classNames
 * @param {() => void | Promise<void>} onClick
 * @returns {HTMLButtonElement}
 */
function createActionButton(label, classNames, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = classNames.join(" ");
  button.addEventListener("click", async () => {
    try {
      button.disabled = true;
      await onClick();
    } catch (error) {
      alert(error.message || "Ha ocurrido un error");
      console.error(error);
    } finally {
      button.disabled = false;
    }
  });
  return button;
}

// ---------- Categorías ----------
function renderCategoryList() {
  if (!categoryListElement) return;

  categoryListElement.innerHTML = "";

  categories.forEach((category) => {
    const li = document.createElement("li");

    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-semibold transition bg-white text-gray-800 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700/60";
    button.textContent = category;

    button.addEventListener("click", () => {
      if (taskCategoryElement) taskCategoryElement.value = category;
    });

    li.appendChild(button);
    categoryListElement.appendChild(li);
  });
}

function renderCategorySelect() {
  if (!taskCategoryElement) return;

  const currentValue = taskCategoryElement.value;
  taskCategoryElement.innerHTML = "";

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    taskCategoryElement.appendChild(option);
  });

  taskCategoryElement.value = categories.includes(currentValue) ? currentValue : "General";
}

// ---------- UI ----------
/**
 * Vuelve a cargar tareas desde backend y renderiza la vista.
 */
async function refreshListView() {
  const currentQuery = searchInputElement ? searchInputElement.value : "";
  tasks = await fetchTasks();
  mergeCategoriesFromTasks(tasks);
  renderCategoryList();
  renderCategorySelect();
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

  const categoryBadge = document.createElement("span");
  categoryBadge.className =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-800 border-gray-300";
  categoryBadge.textContent = task.category || "General";

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
  metaRow.appendChild(categoryBadge);
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
    async () => {
      await updateTaskRequest(task.id, { done: !task.done });
      await refreshListView();
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
    async () => {
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
      if (!updatedText) {
        alert("El texto de la tarea no puede estar vacío");
        return;
      }

      await updateTaskRequest(task.id, { text: updatedText });
      isEditing = false;
      editButton.textContent = "Editar";
      cancelEditButton.classList.add("hidden");
      await refreshListView();
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
    async () => {
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
    async () => {
      await deleteTaskRequest(task.id);
      await refreshListView();
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
 * Renderiza las listas de tareas pendientes y completadas.
 * @param {string} [filterText=""]
 */
function renderTaskLists(filterText = "") {
  pendingTasksContainer.innerHTML = "";
  completedTasksContainer.innerHTML = "";

  const query = (filterText || "").toLowerCase();
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const filteredTasks = tasks
    .filter((task) => (task.text || "").toLowerCase().includes(query))
    .sort((a, b) => {
      const priorityA = priorityOrder[a.priority || "medium"];
      const priorityB = priorityOrder[b.priority || "medium"];

      if (priorityA !== priorityB) return priorityA - priorityB;
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

// ---------- Acciones masivas ----------
async function completeAllTasks() {
  if (tasks.length === 0) return;

  for (const task of tasks) {
    if (!task.done) {
      await updateTaskRequest(task.id, { done: true });
    }
  }

  await refreshListView();
}

async function deleteCompletedTasks() {
  const completedCount = getCompletedTasks(tasks).length;
  if (completedCount === 0) return;

  const ok = confirm(`¿Borrar ${completedCount} tarea(s) completada(s)?`);
  if (!ok) return;

  await deleteCompletedTasksRequest();
  await refreshListView();
}

async function clearAllTasks() {
  if (tasks.length === 0) return;

  const ok = confirm("¿Vaciar todas las tareas? Esta acción no se puede deshacer.");
  if (!ok) return;

  await clearAllTasksRequest();
  await refreshListView();
}

// ---------- Eventos ----------
if (taskFormElement) {
  taskFormElement.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const newTaskText = taskInputElement.value.trim();
      if (!newTaskText) {
        alert("La tarea no puede estar vacía");
        return;
      }

      const categoryValue =
        taskCategoryElement && taskCategoryElement.value
          ? taskCategoryElement.value
          : "General";

      const priorityValue =
        taskPriorityElement && taskPriorityElement.value
          ? taskPriorityElement.value
          : "medium";

      const dueDateValue =
        taskDueDateElement && taskDueDateElement.value
          ? taskDueDateElement.value
          : null;

      await createTaskRequest({
        text: newTaskText,
        category: categoryValue,
        priority: priorityValue,
        dueDate: dueDateValue,
      });

      await refreshListView();

      taskInputElement.value = "";
      if (taskDueDateElement) taskDueDateElement.value = "";
      if (taskCategoryElement) taskCategoryElement.value = "General";
      taskInputElement.focus();
    } catch (error) {
      alert(error.message || "No se pudo crear la tarea");
      console.error(error);
    }
  });
}

if (searchInputElement) {
  searchInputElement.addEventListener("input", () => {
    renderTaskLists(searchInputElement.value);
  });
}

if (bulkCompleteAllButton) {
  bulkCompleteAllButton.addEventListener("click", async () => {
    try {
      await completeAllTasks();
    } catch (error) {
      alert(error.message || "No se pudieron completar las tareas");
      console.error(error);
    }
  });
}

if (bulkDeleteCompletedButton) {
  bulkDeleteCompletedButton.addEventListener("click", async () => {
    try {
      await deleteCompletedTasks();
    } catch (error) {
      alert(error.message || "No se pudieron borrar las completadas");
      console.error(error);
    }
  });
}

if (bulkClearAllButton) {
  bulkClearAllButton.addEventListener("click", async () => {
    try {
      await clearAllTasks();
    } catch (error) {
      alert(error.message || "No se pudieron borrar las tareas");
      console.error(error);
    }
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
async function initApp() {
  try {
    tasks = await fetchTasks();
    mergeCategoriesFromTasks(tasks);
    renderCategoryList();
    renderCategorySelect();
    renderTaskLists();
  } catch (error) {
    alert("No se pudieron cargar las tareas desde el servidor");
    console.error(error);
  }
}

initApp();