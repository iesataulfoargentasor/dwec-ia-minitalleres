# Minitalleres de IA en el navegador · DWEC

Tres prácticas guiadas de **HTML y JavaScript**, pensadas para alumnado de Desarrollo Web en Entorno Cliente que colabora con alumnado de Atención a Personas en Situación de Dependencia.

El objetivo es conocer herramientas que puedan responder a una necesidad real detectada en una entrevista. No hace falta entrenar modelos ni disponer de una clave de API de pago.

**Empieza aquí:** descarga el proyecto, abre la carpeta con Visual Studio Code y ejecuta `index.html` con Live Server. No abras los HTML haciendo doble clic.

## Índice

1. [Qué vamos a construir](#qué-vamos-a-construir)
2. [Preparación paso a paso](#preparación-paso-a-paso)
3. [Cómo está organizado](#cómo-está-organizado)
4. [Qué significa IA local](#qué-significa-ia-local)
5. [Taller 1: OCR](01-ocr/README.md)
6. [Taller 2: transcripción](02-audio/README.md)
7. [Taller 3: gestos](03-gestos/README.md)
8. [Problemas frecuentes](#problemas-frecuentes)
9. [Propuesta para el profesor](#propuesta-para-el-profesor)

## Qué vamos a construir

| Taller | Entrada | Salida | Librería y modelo | Posible utilidad |
|---|---|---|---|---|
| [1. OCR](01-ocr/README.md) | Imagen de texto impreso | Texto editable | Tesseract.js + idioma `spa` | Presentar un aviso en un formato más legible |
| [2. Audio](02-audio/README.md) | Frase grabada o archivo | Transcripción editable en español | Transformers.js + Whisper Tiny multilingüe | Escribir una nota sin teclear |
| [3. Gestos](03-gestos/README.md) | Cámara y una mano | Cambio de tarjeta | MediaPipe Gesture Recognizer | Explorar una forma alternativa de interacción |

Son prototipos didácticos. El OCR y la transcripción pueden equivocarse; el reconocimiento de gestos no es adecuado para todas las personas con movilidad reducida. La entrevista debe determinar qué necesita y puede utilizar cada persona.

## Preparación paso a paso

### 1. Comprueba lo que necesitas

- Un ordenador con un navegador actualizado. Para empezar en clase, prueba Chrome o Edge de escritorio.
- Visual Studio Code y la extensión **Live Server**, de Ritwick Dey.
- Conexión a Internet para descargar librerías y modelos.
- Micrófono para grabar en el taller 2; también puedes usar un archivo de audio.
- Cámara para reconocer gestos en el taller 3. Sin cámara puedes probar el botón alternativo.

No necesitas React, Node.js, npm, Python ni un servidor de IA para seguir la opción de Live Server. El servidor local solo entrega HTML, JavaScript y CSS: la IA se ejecuta en el navegador.

Antes de comenzar conviene conocer variables, funciones, arrays, `querySelector` y `addEventListener`. Durante los talleres aprenderemos `async/await`, importaciones, tratamiento de errores y uso básico de modelos.

### 2. Descarga el repositorio

1. En la página del repositorio, pulsa el botón **Code**.
2. Elige **Download ZIP**.
3. Descomprime el ZIP en una carpeta de tu ordenador.
4. En Visual Studio Code, selecciona **Archivo → Abrir carpeta** y abre la carpeta que contiene este README y el `index.html` principal.

Si ya utilizas Git, puedes hacerlo así:

```bash
git clone https://github.com/iesataulfoargentasor/dwec-ia-minitalleres.git
cd dwec-ia-minitalleres
```

### 3. Instala y utiliza Live Server

1. En Visual Studio Code, abre **Extensiones**.
2. Busca **Live Server**, de Ritwick Dey, e instálala.
3. Haz clic derecho sobre el `index.html` de la carpeta principal.
4. Selecciona **Open with Live Server**.
5. El navegador abrirá una dirección parecida a `http://127.0.0.1:5500`.
6. Elige uno de los tres talleres.

`127.0.0.1` y `localhost` hacen referencia a tu propio ordenador. Si ves una dirección que empieza por `file:///`, no estás utilizando el servidor y debes repetir estos pasos.

**Alternativa si ya tienes Python instalado:** abre una terminal dentro de la carpeta del proyecto, ejecuta `python -m http.server 5500 --bind 127.0.0.1` y visita `http://localhost:5500`. No necesitas ambas opciones.

### 4. Haz la primera prueba

Empieza por el OCR. Descarga la imagen de ejemplo desde su página, selecciónala y pulsa **Extraer texto**. Debe aparecer un aviso que comienza por «TALLER DE LECTURA».

La primera ejecución puede tardar más porque descarga archivos. No pulses repetidamente ni cierres la pestaña mientras carga el modelo. Las siguientes transcripciones reutilizan el modelo mientras la página permanezca abierta.

### 5. Modifica y vuelve a probar

1. Lee la guía del taller.
2. Abre su `index.html` y su `app.js` en el editor.
3. Localiza el código que se explica en cada paso.
4. Cambia una sola cosa, guarda y vuelve a probar.
5. Resuelve los ejercicios del final de la guía.

Puedes trabajar directamente con los ejemplos terminados o, para practicar, crear una carpeta propia y reconstruir el HTML y el JavaScript por bloques. Si copias un taller, conserva la ruta a `../estilos.css` o adáptala.

## Cómo está organizado

```text
dwec-ia-minitalleres/
├── README.md                 Guía general
├── index.html                Menú de talleres
├── estilos.css               Estilos comunes, sin librerías CSS
├── 01-ocr/
│   ├── README.md              Guía del taller 1
│   ├── index.html             Formulario y resultado
│   ├── app.js                 Reconocimiento del texto
│   └── ejemplo.png            Imagen ficticia para practicar
├── 02-audio/
│   ├── README.md              Guía del taller 2
│   ├── index.html             Grabación, archivo y resultado
│   ├── app.js                 Interfaz y preparación del audio
│   └── worker.js              Carga del modelo y transcripción
└── 03-gestos/
    ├── README.md              Guía del taller 3
    ├── index.html             Cámara y tarjetas
    └── app.js                 Detección y acción
```

El código de cada taller es independiente. Solo comparten el CSS para evitar repetir estilos. Las guías contienen pequeños fragmentos explicativos; el código completo que se ejecuta está en los archivos `.js`.

## Qué significa IA local

Una **librería** es código que podemos reutilizar. Un **modelo** contiene los datos aprendidos durante un entrenamiento. Aquí descargamos modelos ya preparados y hacemos **inferencia**, es decir, los utilizamos para obtener resultados a partir de nuestras entradas.

```text
Internet ── descarga de librerías/modelos ──► navegador
Archivo o cámara/micrófono ──► modelo en el navegador ──► resultado
```

- Estos ejemplos no incluyen código para subir imágenes, grabaciones o fotogramas a un servidor.
- Sí hay conexiones con proveedores como jsDelivr, Hugging Face y Google para descargar dependencias. Esos proveedores reciben las peticiones de descarga y sus metadatos de red.
- **Local no equivale a funcionar sin Internet.** La caché puede evitar algunas descargas, pero estos talleres no incluyen una instalación offline completa ni un service worker. No se garantiza funcionamiento sin conexión.
- No se guardan las entradas ni los resultados de forma persistente. Recargar borra el contenido de la interfaz; el navegador puede conservar modelos en caché.
- Trabaja con avisos y notas ficticias, sin datos reales de personas atendidas.
- El audio usa WebAssembly en CPU: no necesita WebGPU. El rendimiento depende del equipo.

Las versiones de las librerías están fijadas en las direcciones de importación para no depender de `latest`. Los modelos remotos pueden cambiar si su proveedor actualiza el recurso: para un despliegue estable convendría fijar también revisiones y alojar los archivos necesarios.

## Conceptos comunes de JavaScript

| Código | Qué significa |
|---|---|
| `document.querySelector('#estado')` | Busca un elemento por su identificador |
| `boton.addEventListener('click', funcion)` | Ejecuta una función al pulsar el botón |
| `async` / `await` | Permite esperar una operación asíncrona sin escribir cadenas de callbacks |
| `import(...)` | Carga un módulo; aquí se hace cuando se necesita y se puede capturar un fallo |
| `try` / `catch` / `finally` | Trata errores y realiza tareas de limpieza |
| `.textContent` | Cambia texto visible sin interpretarlo como HTML |
| `.value` | Lee o escribe el contenido de un campo |
| `.disabled` | Evita acciones simultáneas que podrían interferirse |
| `URL.createObjectURL(...)` | Crea una dirección temporal para un archivo local, sin subirlo |
| `Worker` y `postMessage` | Ejecutan trabajo aparte y comunican sus resultados a la página |

## Problemas frecuentes

| Problema | Qué comprobar |
|---|---|
| Los botones no funcionan | Abre con Live Server. Pulsa F12 y revisa la pestaña Consola por si hay errores de carga. |
| La cámara o el micrófono no se abren | Usa localhost o HTTPS. Revisa los permisos del navegador y del sistema operativo. Comprueba que otro programa no ocupa el dispositivo. |
| La página funciona en el PC pero no en un móvil conectado por IP | Una dirección HTTP de la red local normalmente no permite esos permisos. Utiliza un alojamiento HTTPS. |
| Se queda cargando el modelo | Comprueba Internet y el acceso del centro a los dominios de descarga. Prueba primero en un solo equipo y espera a que finalice. |
| La transcripción tarda | Utiliza una frase de 5–10 segundos, cierra otras pestañas y espera. No se promete transcripción en tiempo real. |
| El audio no se puede preparar | Puede estar dañado o utilizar un códec no admitido. Prueba a grabar desde la propia página o selecciona un WAV/MP3 corto. |
| La transcripción inventa palabras | Prueba voz clara, sin música ni silencios prolongados. Whisper puede producir errores incluso con audio comprensible. |
| No reconoce el pulgar | Mejora la iluminación, muestra una sola mano completa y mantenla un segundo. Prueba la otra mano o utiliza el botón alternativo. |
| El OCR mezcla líneas | Utiliza texto impreso horizontal, bien enfocado, con buen contraste y sin columnas complejas. |

## Propuesta para el profesor

### Organización sugerida

- **Sesión 1 (55 minutos):** preparación, OCR y un cambio sencillo.
- **Sesión 2 (55 minutos):** grabación, transcripción y comparación con lo que se dijo.
- **Sesión 3 (55 minutos):** gestos, umbral, duración y alternativa con teclado.
- **Sesión adicional opcional:** completar ejercicios, comparar resultados y preparar entrevistas.

Son tiempos orientativos; la primera descarga y el nivel del grupo pueden exigir más tiempo. Prueba previamente el modelo de audio en el equipo más modesto y distribuye las primeras descargas para no saturar la red.

En el taller de audio puedes explicar primero el núcleo de `worker.js` y entregar la grabación/conversión como código de apoyo. En el de gestos puedes entregar la carga de cámara y centrarte en la condición que decide cuándo actuar.

### Qué entregar

Cada pareja o grupo entrega:

1. Los tres ejemplos funcionando con una modificación propia en cada uno.
2. Una tabla con entrada utilizada, resultado esperado, resultado obtenido y error observado.
3. Una explicación breve de qué hace la librería y qué han programado ellos.
4. Una propuesta de utilidad para su sector, pendiente de validar en la entrevista.
5. Una alternativa de uso cuando el modelo falla o la persona no puede usar cámara/micrófono.

### Evaluación orientativa

| Criterio | Peso |
|---|---:|
| Comprende y explica eventos, DOM, asincronía y datos del resultado | 30 % |
| Implementa una modificación útil sin romper el ejemplo | 25 % |
| Prueba casos de éxito y de error y documenta lo observado | 20 % |
| Ofrece controles comprensibles, teclado y mensajes accesibles | 15 % |
| Relaciona la propuesta con una necesidad real y sus límites | 10 % |

No se valora que el modelo acierte siempre, sino que el alumnado entienda sus límites y diseñe una interfaz que permita revisarlos.

### Pruebas manuales antes de dar por terminada la actividad

- OCR: imagen del repositorio, foto menos nítida, imagen sin texto y selección de otro archivo.
- Audio: frase corta, archivo demasiado largo, permiso denegado, segunda transcripción y edición del resultado.
- Gestos: sin mano, pulgar mantenido, retirada de la mano, repetición, apagado y encendido de cámara.
- Todos: navegación con Tab, activación con teclado, zoom del 200 % y mensaje comprensible si falla la descarga.

## Comprobaciones de esta versión

Comprobación técnica realizada el **22 de octubre de 2026** en Microsoft Edge de escritorio, con servidor local:

- OCR ejecutado con la imagen incluida: reconoce el título, el horario y las líneas del aviso.
- Whisper ejecutado con un archivo de voz sintética: devuelve texto en español. La voz sintética utilizada pronuncia con acento no español y se observaron errores, que sirven para recordar la necesidad de revisión.
- Segunda transcripción en la misma página: reutiliza el modelo y devuelve resultado.
- Grabación y detención con micrófono simulado: prepara un audio reproducible.
- MediaPipe: descarga y carga el modelo, analiza vídeo simulado sin mano, permite apagar y reiniciar la cámara.
- Botón alternativo de tarjetas: funciona con clic y con teclado.
- JavaScript: comprobación de sintaxis sin errores.

**Pendiente de comprobación presencial:** la precisión de los gestos con manos reales, la calidad del micrófono y el rendimiento en los equipos del alumnado. La prueba con vídeo simulado verifica la integración técnica, no la precisión del reconocimiento ni la adecuación a una persona con discapacidad.

## Fuentes y licencias

Consulta las guías oficiales al ampliar los ejemplos:

- [Tesseract.js](https://github.com/naptha/tesseract.js) y [ejemplos de API](https://github.com/naptha/tesseract.js/blob/master/docs/api.md).
- [Transformers.js](https://huggingface.co/docs/transformers.js/v3.8.1/index) y [Whisper Tiny en ONNX](https://huggingface.co/Xenova/whisper-tiny).
- [MediaPipe Gesture Recognizer para web](https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer/web_js).
- [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder), [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) y [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).

Este repositorio no incluye los pesos de los modelos ni copias de las librerías: se descargan desde sus proveedores. Consulta sus respectivas licencias antes de redistribuirlos. La imagen de ejemplo es material ficticio creado para la práctica.
