const form = document.getElementById("task-form");
const input = document.getElementById("task-input");

const pendingList = document.getElementById("task-list");
const completedList = document.getElementById("completed-list");

const searchInput = document.getElementById("task-search");

const STORAGE_KEY = "tareas";

let tareas = [];

// ---------- LocalStorage ----------
function saveTasks(tasks = tareas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Carga y normaliza (convierte strings antiguos a objetos)
function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const data = raw ? JSON.parse(raw) : [];

  const createId = () =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random();

  const normalizeTask = (item) => {
    if (typeof item === "string") {
      return {
        id: createId(),
        text: item,
        done: false,
      };
    }

    const text = (item.text ?? "").trim();

    return {
      id: item.id ?? createId(),
      text,
      done: Boolean(item.done),
    };
  };

  tareas = Array.isArray(data)
    ? data.map(normalizeTask).filter((t) => t.text !== "")
    : [];

  // Guardar ya normalizado para no volver a fallar
  saveTasks();
}

// ---------- UI ----------
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

  const actions = document.createElement("div");
  actions.className = "flex items-center gap-2 shrink-0";

  const createButton = (text, classNames, onClick) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.className = classNames.join(" ");
    button.addEventListener("click", onClick);
    return button;
  };

  const refresh = () => {
    saveTasks();
    render(searchInput ? searchInput.value : "");
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
      refresh();
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
      tareas = tareas.filter((t) => t.id !== task.id);
      refresh();
    }
  );

  actions.appendChild(completeBtn);
  actions.appendChild(deleteBtn);

  taskEl.appendChild(info);
  taskEl.appendChild(actions);

  // extra visual para completadas
  if (task.done) {
    taskEl.classList.add("opacity-70");
    title.classList.add("line-through");
  }

  return taskEl;
}

function render(filterText = "") {
  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  const query = (filterText || "").toLowerCase();

  const filteredTasks = tareas.filter((task) =>
    (task.text || "").toLowerCase().includes(query)
  );

  const pendingTasks = tareas.filter((task) => !task.done);
  const counterEl = document.getElementById("task-count");
  if (counterEl) {
    counterEl.textContent = pendingTasks.length;
  }

  filteredTasks.forEach((task) => {
    const card = createTaskCard(task);
    const list = task.done ? completedList : pendingList;
    list.appendChild(card);
  });
}

// ---------- Eventos ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  tareas.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
    text,
    done: false,
  });

  saveTasks();
  render(searchInput ? searchInput.value : "");

  input.value = "";
  input.focus();
});

if (searchInput) {
  searchInput.addEventListener("input", () => {
    render(searchInput.value);
  });
}

// ---------- Init ----------
loadTasks();
render();
