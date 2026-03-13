# Experimentos con MCP en Cursor

# Instalación del servidor MCP

Para realizar los experimentos se instaló el servidor MCP **filesystem**, que permite a la IA acceder a los archivos del proyecto.

## Pasos realizados

1. Abrir Cursor y acceder a **Settings**.
2. Ir a la sección **Tools & MCP**.
3. Crear la carpeta `.cursor` dentro del proyecto.
4. Crear el archivo:
5. Añadir la siguiente configuración:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "."
      ]
    }
  }
}
6.Guardar el archivo.

7.Reiniciar Cursor para que detecte el servidor MCP.

##Experimentos realizados##
**Consulta 1: Explorar estructura del proyecto
Prompt utilizado:Explora la estructura del proyecto TaskFlow
Respuesta de la IA:
Estructura del proyecto TaskFlow
Raíz del proyecto (app-tareas/)
index.html: estructura de la interfaz (layout, formularios, listas y carga de scripts).
app.js: lógica principal de la app (gestión de tareas, localStorage, renderizado, eventos).
theme.js: lógica del modo claro/oscuro (guarda preferencia en localStorage y aplica clase dark).
input.css / output.css: entrada de Tailwind y CSS compilado.
styles.css: CSS adicional propio.
tailwind.config.js / postcss.config.js: configuración de Tailwind/PostCSS.
package.json / package-lock.json: dependencias y scripts de Node.
node_modules/: dependencias instaladas.
.git/: repositorio Git.
.cursor/mcp.json: configuración de Cursor (MCP).
README.md: actualmente vacío (0 bytes).
Documentación (docs/)
docs/ai/:
ai-comparison.md
cursor-workflow.md
experiments.md (vacío)
prompt-engineering.md (vacío)
reflection.md (vacío)
Untitled
Si quieres, te hago también un “mapa” rápido de qué responsabilidades tiene cada archivo JS (app.js vs theme.js) y dónde tocar para añadir features (categorías, filtros, etc.).

**Consulta 2: Análisis del archivo app.js
Prompt utilizado:Analiza el archivo app.js del proyecto
Respuesta de la IA:
Visión general de app.js
Propósito: gestionar una lista de tareas en el navegador (crear, completar/deshacer, eliminar, buscar) guardándolas en localStorage y renderizando dos listas: pendientes y completadas.
Modelo de datos: tasks es un array de objetos con forma:
{ id: string, text: string, done: boolean }
Partes principales (qué hace cada bloque)
Referencias al DOM

taskFormElement, taskInputElement, searchInputElement
pendingTasksContainer, completedTasksContainer
Persistencia (localStorage)

saveTasksToStorage(tasksToSave = tasks): guarda el array en localStorage bajo TASKS_STORAGE_KEY.
loadTasksFromStorage(): lee localStorage, normaliza datos antiguos (por ejemplo strings) a objetos {id,text,done}, elimina textos vacíos y vuelve a guardar ya normalizado.
UI / render

createTaskCard(task): crea un <article> con el texto de la tarea y dos botones:
Completar/Deshacer: invierte task.done, guarda y re-renderiza.
Eliminar: filtra el array tasks para quitarla, guarda y re-renderiza.
renderTaskLists(filterText = ""):
Limpia contenedores, filtra por búsqueda (solo por text), actualiza el contador #task-count con pendientes totales (no depende del filtro) y pinta cada tarea en su lista correspondiente.
Eventos

Submit del formulario: crea una tarea nueva y la añade a tasks, guarda y renderiza.
Input del buscador: llama a renderTaskLists con el texto.
Arranque

loadTasksFromStorage(); renderTaskLists();
Cosas buenas del código
Normalización de datos al cargar: evita romperse si cambió el formato guardado anteriormente.
Render centralizado: la interfaz se refresca desde un único sitio.
Separación razonable: persistencia, UI y eventos están en secciones claras.
Buen naming tras el refactor: variables del DOM y funciones son descriptivas.
Mejoras útiles (recomendadas)
Reutilizar generación de id: ahora se usa createId() en loadTasksFromStorage, pero en el submit se repite la lógica con crypto.randomUUID ? .... Lo ideal es una función generateTaskId() global y usarla en ambos sitios.
Cachear elementos del DOM que se consultan en cada render
document.getElementById("task-count") se podría guardar una vez (ej. taskCountElement) para evitar búsquedas repetidas.
Evitar doble filtrado de tasks en render
En renderTaskLists haces:
filteredTasks = tasks.filter(...)
pendingTasks = tasks.filter(...)
No es grave, pero podrías calcular contadores en una sola pasada si crece el número de tareas.
Accesibilidad de botones
El botón de borrar muestra “✕”; sería mejor añadir aria-label="Eliminar tarea" desde createTaskCard.
Categoría fija
category.textContent = "General" está hardcodeado; si vas a implementar categorías, el modelo debería incluir category.
Si me dices qué objetivo tienes (por ejemplo “añadir categorías” o “mejorar rendimiento/estructura”), te propongo un refactor concreto con cambios en el código.

**Consulta 3: Explicación de una función
Prompt utilizado:Explica cómo funciona la función renderTaskLists
Respuesta de la IA:
Cómo funciona renderTaskLists(filterText = "")
renderTaskLists se encarga de repintar toda la interfaz de tareas (pendientes y completadas) y actualizar el contador cada vez que cambian los datos o el texto de búsqueda.

Pasos que hace:

1) Limpia las listas en pantalla

Vacía el contenido HTML de:
pendingTasksContainer (pendientes)
completedTasksContainer (completadas)
Así evita que se dupliquen tarjetas al volver a pintar.
2) Prepara el texto de filtro

Convierte filterText a minúsculas (query) para comparar sin importar mayúsculas/minúsculas.
3) Filtra las tareas por búsqueda

Crea filteredTasks con las tareas cuyo task.text incluye query.
Si filterText está vacío, realmente quedan “todas”.
4) Calcula pendientes (para el contador)

Calcula pendingTasks = tasks.filter((task) => !task.done).
Busca el elemento #task-count y le pone como texto pendingTasks.length.
Importante: el contador muestra pendientes totales, no “pendientes filtradas”.
5) Pinta cada tarea en la lista correcta

Recorre filteredTasks y por cada tarea:
Crea la tarjeta DOM con createTaskCard(task).
Decide el contenedor destino:
Si task.done es true → completedTasksContainer
Si false → pendingTasksContainer
Inserta la tarjeta con appendChild.
En resumen: borra lo que hay, filtra por búsqueda, actualiza el contador de pendientes, y reconstruye las tarjetas en su lista correspondiente.

**Consulta 4: Detección de mejoras
Prompt utilizado: Busca posibles mejoras en el manejo de localStorage
Respuesta de la IA:
Posibles mejoras en el manejo de localStorage (TaskFlow)
Lectura más segura (datos corruptos)

Ahora haces JSON.parse(raw) sin control; si el JSON está corrupto, la app puede romper.
Mejora: envolver en try/catch y si falla, usar [] (y opcionalmente limpiar la clave).
Validación más estricta del “shape”

Estás normalizando bien, pero podrías comprobar también:
que rawItem sea realmente un objeto (no null)
que rawItem.text sea string antes de trim()
Esto evita errores si alguien mete datos raros en localStorage.
Centralizar generación de IDs

En loadTasksFromStorage usas createId(), pero en el submit repites crypto.randomUUID ? ....
Mejora: una función global generateTaskId() usada en ambos sitios.
Evitar escrituras innecesarias

saveTasksToStorage() se llama en varias acciones y también al final de loadTasksFromStorage (bien para normalizar), pero puedes evitar guardar si no ha cambiado nada:
ejemplo: comparar el JSON previo con el nuevo antes de escribir (barato para listas pequeñas).
Beneficio: menos I/O y menos “desgaste” (y más fluidez si crece la app).
Guardar “versión” del esquema

Si en el futuro añades campos (p. ej. category, createdAt), te conviene guardar:
{ version: 2, tasks: [...] } en vez de [...]
Así puedes migrar datos de forma explícita (más mantenible que “inferir” formatos).
No bloquear UI (si crece la lista)

localStorage.setItem es síncrono; con muchas tareas podría notarse.
Opcional: “batch/debounce” de guardado (guardar tras 200–300ms de inactividad) o usar requestIdleCallback cuando aplique.
Manejo de cuota

Si se llena el almacenamiento, setItem puede lanzar excepción.
Mejora: try/catch también al guardar, y mostrar un mensaje/alerta si falla.
Si quieres, te implemento las 2-3 mejoras más importantes ya (recomendación mínima: try/catch en JSON.parse + función global de ID + try/catch al guardar).

**Consulta 5: Describe cómo funciona la interfaz de TaskFlow
Prompt utilizado: Explica cómo funciona la aplicación TaskFlow
Respuesta de la IA:
Estructura de la interfaz (TaskFlow)
La interfaz está en index.html y se organiza en tres zonas: cabecera, barra lateral y contenido principal.

Header

Muestra el título “TaskFlow”.
Incluye el botón #theme-toggle que cambia entre modo claro/oscuro (añade o quita la clase dark al documento).
Layout principal (grid)

Un contenedor en forma de rejilla de 4 columnas.
Sidebar ocupa 1 columna y Main ocupa 3 columnas.
Sidebar (izquierda)
Categorías

Lista de botones (Trabajo, Estudio, Personal). Por ahora son elementos visuales: no filtran tareas aún (si no se ha programado en app.js).
Buscador

Input #task-search para escribir texto.
Cuando escribes, la app filtra las tareas por el contenido de su texto y vuelve a pintar la lista.
Main (derecha)
Tiene dos secciones:

Tareas pendientes

Título “Tareas Pendientes” con un contador: <span id="task-count">.
Formulario para añadir tareas:
Input #task-input (texto de la tarea).
Botón “Añadir”.
Contenedor de tareas pendientes: #task-list.
Cada tarea se muestra como una tarjeta con:
Texto de la tarea
Botón Completar/Deshacer
Botón Eliminar
Tareas completadas

Contenedor de tareas completadas: #completed-list.
Las tareas completadas aparecen con un estilo visual distinto (por ejemplo tachado/opacidad, aplicado desde JS).
Qué “mueve” la interfaz por debajo
app.js:

Lee/guarda tareas en localStorage.
Cada vez que añades, completas o eliminas una tarea, ejecuta renderTaskLists():
Vacía #task-list y #completed-list
Filtra por búsqueda si hay texto
Inserta las tarjetas en la lista correcta
Actualiza el contador #task-count con las tareas pendientes
theme.js:

Al cargar la página, aplica el tema guardado.
Al pulsar el botón, alterna tema y lo guarda.
Si quieres, te hago un “recorrido de usuario” (qué pasa exactamente al pulsar Añadir / Completar / Eliminar / Buscar) conectándolo con las funciones concretas del código.

##Conclusiones generales

El uso de MCP permite que la IA acceda directamente a los archivos del proyecto, lo que mejora la calidad de las respuestas.
Esto permite analizar código real, detectar errores y sugerir mejoras de forma más precisa que sin acceso al contexto del proyecto.

En proyectos reales, esta tecnología puede ser muy útil para:

Analizar repositorios grandes.

Detectar errores o problemas de arquitectura.

Generar documentación automáticamente.

Explicar partes complejas del código.

Ayudar en tareas de refactorización.

# Experimentos con IA en programación

## Objetivo

En este documento se documentan varios experimentos para analizar cómo influye el uso de inteligencia artificial en el desarrollo de software.

# Experimento 1 — Contar tareas completadas

## Problema
Crear una función que reciba un array de tareas y devuelva cuántas están completadas.

 Solución sin IA

Tiempo aproximado: 5 minutos

function countCompleted(tasks) {
  let count = 0;

  for (let task of tasks) {
    if (task.done) {
      count++;
    }
  }

  return count;
}
 Solución con IA

Tiempo aproximado: 10 segundos

function countCompletedTasks(tasks) {
  return tasks.filter(task => task.done === true).length;

  
}

Comparación

La solución con IA fue más rápida y más concisa.

Experimento 2 — Filtrar tareas por texto

## Problema

Crear una función que devuelva las tareas que contienen un texto específico.

Solución sin IA

Tiempo aproximado: 6 minutos

function searchTasks(tasks, query) {
  const results = [];

  for (let task of tasks) {
    if (task.text.toLowerCase().includes(query.toLowerCase())) {
      results.push(task);
    }
  }

  return results;
}

Solución con IA

Tiempo aproximado: 10 segundos

function findTasksByText(tasks, searchText) {
  const query = (searchText || "").toLowerCase();
  return tasks.filter(task => (task.text || "").toLowerCase().includes(query));
}
Comparación

La solución con IA fue más rápida y más concisa.
La solución manual ayudó a comprender mejor el proceso de iteración.

Experimento 3 — Generar ID para tareas

##Problema

Crear una función que genere un identificador único para una tarea.

Solución sin IA

Tiempo aproximado: 4 minutos

function generateId() {
  return Date.now() + Math.random();
}
Solución con IA

Tiempo aproximado: 10 segundos

function generateTaskId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random();
}
Comparación

La IA proporcionó una solución más robusta al considerar crypto.randomUUID().

Experimento 4 — Validación del input (relacionado con TaskFlow)

##Problema

Evitar que el usuario añada tareas vacías.

Solución sin IA

Tiempo aproximado: 3 minutos

if (taskInput.value.trim() === "") {
  return;
}
Solución con IA

Tiempo aproximado: 05 segundos

function validateTask(text) {
  return text.trim().length > 0;
}
Comparación

La solución con IA separa la validación en una función reutilizable.

Experimento 5 — Contador de tareas pendientes

##Problema(relacionado con Taskflow)

Mostrar cuántas tareas pendientes hay en la interfaz.

Solución sin IA

Tiempo aproximado: 5 minutos

const pendingTasks = tasks.filter(task => !task.done);
taskCountElement.textContent = pendingTasks.length;
Solución con IA

Tiempo aproximado: 10 segundos

taskCountElement.textContent = tasks.filter(t => !t.done).length;
Comparación

Ambas soluciones son similares, pero la IA generó el código más rápidamente.

Experimento 6 — Mejora de la función render

##Problema

Optimizar la función encargada de mostrar las tareas en la interfaz de la aplicación TaskFlow.

Solución sin IA

Tiempo aproximado: 6 minutos

tasks.forEach(task => {
  const card = createTaskCard(task);

  if (task.done) {
    completedTasksContainer.appendChild(card);
  } else {
    pendingTasksContainer.appendChild(card);
  }
});

Solución con IA

Tiempo aproximado: 10 segundos


tasks.forEach(task => {
  const card = createTaskCard(task);

  const targetList = task.done
    ? completedTasksContainer
    : pendingTasksContainer;

  targetList.appendChild(card);
});
Comparación

La solución con IA es más clara y reduce la duplicación de código

##Conclusiones generales##

Los experimentos muestran que la inteligencia artificial puede acelerar significativamente ciertas tareas de programación.

Ventajas observadas:

generación rápida de código

sugerencias de mejora

explicación de funciones

Sin embargo, resolver problemas primero sin IA ayuda a comprender mejor la lógica del código.