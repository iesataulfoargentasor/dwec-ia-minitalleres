# Taller 2 · Transcribir una frase en español

[Volver a la guía general](../README.md) · [HTML](index.html) · [Interfaz](app.js) · [Modelo](worker.js)

**Objetivo:** grabar una frase o seleccionar un audio y obtener una transcripción editable sin enviarlo a una API de transcripción. Tiempo orientativo: 55–75 minutos.

## 1. Ejecuta el ejemplo

1. Abre el taller con Live Server.
2. Pulsa **Grabar** y concede permiso al micrófono.
3. Di: «Mañana prepararé la lista de actividades para el taller».
4. Pulsa **Detener grabación**. También se detiene automáticamente a los 15 segundos.
5. Escucha la grabación con el reproductor.
6. Pulsa **Transcribir en español**.
7. Espera a que se descargue el modelo y se procese el audio.
8. Compara el resultado con la frase y corrige los errores.

Si no tienes micrófono, utiliza un archivo de audio corto. El ejemplo admite hasta 20 segundos y 10 MB. La extensión por sí sola no garantiza compatibilidad: el navegador debe poder decodificar el formato.

## 2. Entiende las dos partes

```text
app.js: micrófono/archivo → muestras de audio → postMessage
                                                  ↓
worker.js: carga Whisper → transcribe → postMessage
                                           ↓
app.js: muestra el texto en el textarea
```

El archivo `app.js` controla la interfaz. `worker.js` ejecuta el modelo aparte para mantener la página utilizable. No es un servidor: ambos se ejecutan en tu ordenador, dentro del navegador.

Para una primera clase, puedes estudiar primero el paso 5 y utilizar la captura y conversión de audio como código de apoyo.

## 3. Captura la voz

```javascript
const flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
const grabadora = new MediaRecorder(flujo);
grabadora.start();
```

`getUserMedia` pide permiso y obtiene un flujo del micrófono. `MediaRecorder` lo graba. El evento `dataavailable` entrega fragmentos; al detener, se reúnen en un `Blob`:

```javascript
const blob = new Blob(partes, { type: grabadora.mimeType });
```

Un `Blob` es un conjunto de datos binarios: aquí representa la grabación. No fijamos WebM/MP4 porque cada navegador admite formatos diferentes.

`grabadora.stop()` termina la grabación. Para liberar realmente el micrófono se detienen también las pistas:

```javascript
flujo.getTracks().forEach((pista) => pista.stop());
```

Localiza ambos pasos en el código completo. El evento `stop` prepara el reproductor y vuelve a habilitar los controles.

## 4. Prepara el formato del modelo

Whisper necesita muestras de audio a **16 000 Hz y un canal**. No se le entrega directamente el archivo comprimido como si sus bytes fueran muestras.

La función `obtenerMuestras` realiza tres operaciones:

1. `decodeAudioData` convierte los bytes del archivo en un `AudioBuffer`.
2. `OfflineAudioContext` mezcla a mono y remuestrea a 16 000 Hz sin reproducirlo.
3. `getChannelData(0)` obtiene un `Float32Array`: una lista de valores numéricos de la señal.

En este taller se comprueba la duración antes de transcribir. Los audios largos requieren otra estrategia de división y gestión de recursos.

## 5. Carga Whisper y transcribe

Este es el núcleo de `worker.js`:

```javascript
const { pipeline, env } = await import(
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1'
);
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;

const transcriptor = await pipeline(
  'automatic-speech-recognition',
  'Xenova/whisper-tiny',
  { device: 'wasm', dtype: 'q8' }
);

const respuesta = await transcriptor(muestras, {
  language: 'spanish',
  task: 'transcribe'
});
```

- `pipeline` prepara una tarea con un modelo ya entrenado.
- `automatic-speech-recognition` indica la tarea: voz a texto.
- `Xenova/whisper-tiny` es una variante multilingüe compatible con Transformers.js. No usamos una variante `.en`, que es para inglés.
- `wasm` permite ejecutar el cálculo en CPU con WebAssembly; no necesitamos WebGPU.
- `q8` selecciona pesos cuantizados de 8 bits, para reducir recursos frente a pesos de mayor precisión.
- `numThreads = 1` evita exigir cabeceras especiales para múltiples hilos.
- `allowLocalModels = false` significa que los archivos del modelo se buscan en el proveedor remoto, no en una carpeta `/models` del servidor local. **La inferencia sigue siendo local.**
- `task: 'transcribe'` pide transcribir; no traducir al inglés.

El ejemplo conserva `transcriptor` para reutilizarlo en la siguiente frase, sin volver a crear el modelo.

## 6. Comunica el resultado

Desde la página:

```javascript
worker.postMessage({ muestras });
```

Desde el worker:

```javascript
self.postMessage({ tipo: 'resultado', texto: respuesta.text });
```

La página recibe el mensaje y escribe `resultado.value = data.texto`. El campo `tipo` permite distinguir mensajes de estado, resultado y error.

## 7. Ejercicios

1. **Inicial:** añade un contador de palabras al recibir la transcripción. Trata el texto vacío por separado.
2. **Inicial:** añade un botón para borrar el resultado.
3. **Intermedio:** después de corregir el texto, permite añadirlo a una lista de notas de la página. Usa `textContent` para mostrarlas.
4. **Ampliación:** guarda esa lista con `localStorage` utilizando solo notas ficticias. Explica por qué no aparece automáticamente en otro ordenador.

## 8. Pruebas y límites

Compara una frase clara, una con ruido de fondo y unos segundos de silencio. No todos los silencios producen texto vacío: el modelo puede inventar palabras. Antes de utilizar la transcripción hay que revisarla.

Prueba también un archivo de más de 20 segundos, una segunda transcripción y la denegación del permiso. Si cambias un permiso, puede ser necesario recargar.

Responde:

- ¿Qué diferencia hay entre grabar y transcribir?
- ¿Por qué usamos dos archivos JavaScript?
- ¿Qué viaja por Internet y qué se procesa en el dispositivo?
- ¿Por qué una persona debe poder corregir el texto?
- ¿Por qué un trabajador no puede escribir directamente en el `textarea`?

**Resultado mínimo:** audio reproducible, transcripción en español, interfaz utilizable mientras trabaja el modelo y resultado editable. No se promete velocidad de tiempo real.
