let tareas = [];

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("task-search");

function guardar() {
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

function crearTarjeta(taskText) {
  const taskEl = document.createElement("article");
  taskEl.classList.add("tarea");

  const info = document.createElement("div");
  info.classList.add("info");

  const title = document.createElement("h3");
  title.textContent = taskText;

  const category = document.createElement("p");
  category.classList.add("categoria");
  category.textContent = "General";

  info.appendChild(title);
  info.appendChild(category);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Eliminar";

  deleteBtn.addEventListener("click", function () {
    taskEl.remove();
    const index = tareas.indexOf(taskText);
    if (index > -1) tareas.splice(index, 1);
    guardar();
  });

  taskEl.appendChild(info);
  taskEl.appendChild(deleteBtn);
  taskList.appendChild(taskEl);
}

// Cargar
const tareasGuardadas = localStorage.getItem("tareas");
if (tareasGuardadas) tareas = JSON.parse(tareasGuardadas);
tareas.forEach(crearTarjeta);

// Añadir
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const taskText = input.value.trim();
  if (!taskText) return;

  tareas.push(taskText);
  guardar();
  crearTarjeta(taskText);

  input.value = "";
});

// Buscar (bonus)
if (searchInput) {
  searchInput.addEventListener("input", function () {
    const texto = searchInput.value.toLowerCase();
    const tareasDOM = document.querySelectorAll("#task-list .tarea");

    tareasDOM.forEach(function (tarea) {
      const titulo = tarea.querySelector("h3").textContent.toLowerCase();
      tarea.style.display = titulo.includes(texto) ? "flex" : "none";
    });
  });
}