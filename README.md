## TaskFlow

TaskFlow es una aplicación de tareas sencilla para practicar **JavaScript (ES6+)**, **manipulación del DOM**, **Tailwind CSS** y persistencia con **LocalStorage**.

### Objetivo

Ofrecer una “to‑do list” pequeña, bien estructurada y fácil de extender (prioridad, fechas, categorías, etc.).

### Tecnologías

- **HTML5**: estructura de la interfaz.
- **Tailwind CSS**: estilos y layout responsive.
- **JavaScript puro**: lógica de la app, eventos, renderizado y persistencia.
- **LocalStorage**: guardar tareas y preferencias (tema).

### Funcionalidades

- **Crear tareas** desde un formulario.
- **Editar tareas** (cambiar el texto y guardar).
- **Completar / deshacer** tareas.
- **Eliminar tareas**.
- **Buscar** por texto.
- **Prioridad** (baja / media / alta) con indicador visual y **ordenación por prioridad**.
- **Fecha límite opcional** con etiquetas (“Vence hoy/mañana”) y **resaltado de tareas vencidas**.
- **Acciones masivas**:
  - Completar todas
  - Borrar completadas (con confirmación)
  - Vaciar todo (con confirmación)
- **Contador** de tareas pendientes.
- **Modo claro/oscuro** con preferencia guardada.

### Documentación de funcionalidades (cómo se usan)

#### Añadir tarea

- Escribe un texto en **“Escribe una nueva tarea…”**.
- Elige una **prioridad** (Baja/Media/Alta).
- (Opcional) selecciona una **fecha límite**.
- Pulsa **Añadir**.

#### Completar / deshacer

- En cada tarjeta, pulsa **Completar** para marcarla como hecha.
- Si ya está completada, el botón pasa a **Deshacer**.

#### Editar tarea

- Pulsa **Editar** en una tarjeta.
- Modifica el texto y pulsa **Guardar**.
- Si no quieres aplicar cambios, pulsa **Cancelar**.

#### Buscar

- En el campo **Buscar tareas…** escribe parte del texto.
- Se mostrarán solo las tareas que contengan ese texto (no distingue mayúsculas/minúsculas).

#### Prioridad (baja / media / alta)

- Cada tarea muestra un **badge** con su prioridad:
  - **Alta**: rojo
  - **Media**: amarillo
  - **Baja**: verde
- La lista se **ordena automáticamente** por prioridad (Alta → Media → Baja).

#### Fecha límite

- Si asignas una fecha, la tarea muestra:
  - **“Vence hoy”** si la fecha es hoy
  - **“Vence mañana”** si la fecha es mañana
  - **“Vence: dd/mm/aaaa”** en otros casos
- Las tareas **vencidas** (fecha pasada) se **resaltan** cuando no están completadas.

#### Acciones masivas

- **Completar todas**: marca todas las tareas como completadas.
- **Borrar completadas**: elimina todas las tareas completadas (pide confirmación).
- **Vaciar todo**: elimina todas las tareas (pide confirmación).

### Persistencia (LocalStorage)

- Las tareas se guardan automáticamente en el navegador mediante `localStorage`.
- La preferencia de tema (claro/oscuro) también se guarda para mantenerla entre recargas.

### Estructura del proyecto

- `index.html`: interfaz (formularios, listas, botones).
- `app.js`: lógica principal de tareas (estado, render, localStorage).
- `theme.js`: modo claro/oscuro.
- `input.css` / `output.css`: Tailwind (entrada / compilado).

### Uso

Abre `index.html` en el navegador (o sirve la carpeta con un servidor estático).