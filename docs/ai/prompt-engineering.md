# Prompt Engineering

## Objetivo

En este documento recopilo distintos prompts utilizados durante el desarrollo del proyecto **TaskFlow** para experimentar con técnicas de prompt engineering.

Se han probado distintos enfoques como:
- definición de rol
- few-shot prompting (ejemplos previos)
- razonamiento paso a paso
- restricciones claras en la respuesta

El objetivo es comprobar cómo la forma de escribir el prompt influye en la calidad del resultado generado por la IA.


# Prompts utilizados

## Prompt 1 — Definir un rol

Actúa como un desarrollador senior especializado en JavaScript.  
Analiza esta función del proyecto TaskFlow y propón una versión refactorizada mejorando la legibilidad y estructura.

---

## Prompt 2 — Explicación educativa

Actúa como un profesor de DAM y explica de forma clara qué hace la función `renderTaskLists` del proyecto TaskFlow.

---

## Prompt 3 — Few-shot prompting (con ejemplos)

Quiero que generes funciones siguiendo este estilo:

Entrada: "Función que suma un array"  
Salida:
function sumArray(arr) {
  return arr.reduce((a,b) => a+b,0);
}

Entrada: "Función que devuelve números pares"  
Salida:
function getEven(numbers){
  return numbers.filter(n => n % 2 === 0);
}

Ahora genera una función que filtre tareas completadas.

---

## Prompt 4 — Generación de documentación

Genera comentarios **JSDoc** para esta función del proyecto TaskFlow.

---

## Prompt 5 — Razonamiento paso a paso

Analiza esta función paso a paso, explica qué hace cada parte del código y después propón una mejora.

---

## Prompt 6 — Detección de errores

Analiza este código JavaScript, detecta posibles errores y explica por qué ocurren antes de mostrar la solución.

---

## Prompt 7 — Restricción técnica

Genera una solución en **JavaScript puro**, sin librerías externas, compatible con un proyecto HTML + Tailwind.

---

## Prompt 8 — Respuesta breve

Responde únicamente con el código final en menos de 10 líneas, sin explicación.

---

## Prompt 9 — Contexto del proyecto

Refactoriza esta función teniendo en cuenta que pertenece al proyecto TaskFlow que utiliza LocalStorage y Tailwind CSS.

---

## Prompt 10 — Generación de documentación del proyecto

Genera una explicación breve para el README del proyecto TaskFlow incluyendo objetivo, tecnologías y funcionalidades.

---

# Resultados y conclusiones

Tras realizar los experimentos se observó que la calidad de las respuestas mejora cuando los prompts incluyen más contexto y restricciones claras.

Los prompts que definían un **rol específico** ayudaron a obtener respuestas más técnicas y detalladas.

Los prompts con **ejemplos previos (few-shot prompting)** permitieron generar código con un formato más consistente.

Pedir **razonamiento paso a paso** ayudó a comprender mejor el funcionamiento del código antes de modificarlo.

Por último, añadir **restricciones claras** (como no usar librerías externas o limitar la longitud de la respuesta) permitió obtener resultados más adaptados al proyecto.

En general, el uso de técnicas de prompt engineering facilita trabajar con asistentes de IA de forma más eficiente durante el desarrollo de software.