const form = document.getElementById("task-form");
const input = document.getElementById("task-input");

const pendingList = document.getElementById("task-list");
const completedList = document.getElementById("completed-list");

const searchInput = document.getElementById("task-search");

const STORAGE_KEY = "tareas";

let tareas = [];

// ---------- LocalStorage ----------
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

// Carga y normaliza (convierte strings antiguos a objetos)
function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const data = raw ? JSON.parse(raw) : [];

  tareas = Array.isArray(data)
    ? data
        .map((item) => {
          if (typeof item === "string") {
            return {
              id: crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now()) + Math.random(),
              text: item,
              done: false,
            };
          }

          return {
            id:
              item.id ??
              (crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now()) + Math.random()),
            text: item.text ?? "",
            done: Boolean(item.done),
          };
        })
        .filter((t) => t.text.trim() !== "")
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

  const completeBtn = document.createElement("button");
  completeBtn.type = "button";
  completeBtn.className =
    "px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-blue-400";
  completeBtn.textContent = task.done ? "Deshacer" : "Completar";

  completeBtn.addEventListener("click", () => {
    task.done = !task.done;
    saveTasks();
    render(searchInput ? searchInput.value : "");
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = [
    "px-3 py-2 rounded-lg text-sm font-semibold",
    "bg-red-600 text-white hover:bg-red-700",
    "active:scale-[0.98] transition",
    "focus:outline-none focus:ring-2 focus:ring-red-400",
  ].join(" ");
  deleteBtn.textContent = "✕";

  deleteBtn.addEventListener("click", () => {
    tareas = tareas.filter((t) => t.id !== task.id);
    saveTasks();
    render(searchInput ? searchInput.value : "");
  });

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

  const texto = (filterText || "").toLowerCase();

  const filteredTasks = tareas.filter((t) =>
    (t.text || "").toLowerCase().includes(texto)
  );

  const pendingCount = tareas.filter((t) => !t.done).length;
  const counterEl = document.getElementById("task-count");
  if (counterEl) {
    counterEl.textContent = pendingCount;
  }

  filteredTasks.forEach((task) => {
    const card = createTaskCard(task);
    if (task.done) {
      completedList.appendChild(card);
    } else {
      pendingList.appendChild(card);
    }
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
