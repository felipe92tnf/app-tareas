let tareas = [];

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

// Cargar tareas guardadas
const tareasGuardadas = localStorage.getItem("tareas");

if (tareasGuardadas) {
    tareas = JSON.parse(tareasGuardadas);
}

// Mostrar tareas guardadas
tareas.forEach(function(taskText) {

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
    if (index > -1) {
        tareas.splice(index, 1);
    }

    localStorage.setItem("tareas", JSON.stringify(tareas));

});

    taskEl.appendChild(info);
    taskEl.appendChild(deleteBtn);

    taskList.appendChild(taskEl);

});

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const taskText = input.value.trim();
    if (!taskText) return;

    tareas.push(taskText);

    localStorage.setItem("tareas", JSON.stringify(tareas));

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
    if (index > -1) {
        tareas.splice(index, 1);
    }

    localStorage.setItem("tareas", JSON.stringify(tareas));

});

    taskEl.appendChild(info);
    taskEl.appendChild(deleteBtn);

    taskList.appendChild(taskEl);

    input.value = "";
});