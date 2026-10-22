# Taller 1 · OCR: de imagen a texto

[Volver a la guía general](../README.md) · [Ver el HTML](index.html) · [Ver el JavaScript completo](app.js)

**Objetivo:** seleccionar una imagen con texto impreso y convertirla en texto editable en español. Tiempo orientativo: 45–55 minutos.

## 1. Prueba el ejemplo antes de modificarlo

1. Abre el menú principal con Live Server y entra en **OCR**.
2. Descarga la imagen de prueba desde el enlace de la página.
3. Selecciónala mediante el campo de archivo.
4. Pulsa **Extraer texto** y espera a que termine la descarga inicial.
5. Comprueba que aparece «TALLER DE LECTURA» y el horario.
6. Si una letra o un signo no coincide, corrígelo directamente en el cuadro de texto.

No se exige una coincidencia exacta: el OCR es un reconocimiento, no una copia del texto original.

## 2. Identifica los elementos del HTML

Los elementos fundamentales son:

```html
<label for="imagen">Selecciona una imagen</label>
<input id="imagen" type="file" accept="image/png,image/jpeg">
<button id="extraer" disabled>Extraer texto</button>
<p id="estado" role="status">Selecciona una imagen.</p>
<label for="resultado">Texto reconocido</label>
<textarea id="resultado"></textarea>
```

- `type="file"` permite seleccionar un archivo del dispositivo.
- `accept` orienta al selector, pero no sustituye a la comprobación en JavaScript.
- `disabled` evita empezar sin imagen.
- `role="status"` permite anunciar cambios de estado a tecnologías de apoyo.
- El `textarea` permite revisar y corregir el resultado.

La página completa añade una vista previa, límites de tamaño y un enlace de regreso. El script se carga con `defer` para esperar a que el HTML esté preparado.

## 3. Obtén el archivo elegido

```javascript
const imagen = document.querySelector('#imagen');
const archivo = imagen.files[0];
```

`files` es la lista de archivos seleccionados. `[0]` obtiene el primero. El ejemplo comprueba el tipo y el tamaño antes de habilitar el botón.

Para mostrarlo sin subirlo a un servidor:

```javascript
const url = URL.createObjectURL(archivo);
vista.src = url;
```

Es una dirección temporal dentro del navegador. Cuando dejamos de necesitarla, `URL.revokeObjectURL(url)` libera el recurso asociado.

## 4. Carga Tesseract y el idioma

El núcleo del taller está dentro del evento `click`:

```javascript
const { default: Tesseract } = await import(
  'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.esm.min.js'
);
const worker = await Tesseract.createWorker('spa');
```

`import()` descarga la librería. `createWorker` prepara el motor en un trabajador que realiza el cálculo fuera del hilo de la interfaz. `spa` selecciona el modelo de español.

`await` significa «espera a que termine esta operación antes de continuar». La función que lo contiene se declara `async`.

## 5. Reconoce y presenta el texto

```javascript
const respuesta = await worker.recognize(archivo);
resultado.value = respuesta.data.text;
await worker.terminate();
```

La respuesta es un objeto. El texto se encuentra en `data.text`. Utilizamos `.value` porque estamos escribiendo en un campo de formulario.

En el ejemplo completo, `logger` actualiza el progreso, `catch` explica un fallo y `finally` libera el worker. Los controles se deshabilitan mientras se procesa para evitar dos trabajos a la vez.

## 6. Qué puede y qué no puede hacer

- Funciona mejor con texto impreso, horizontal, nítido y con contraste.
- No describe el significado de una fotografía: extrae letras.
- No garantiza buena lectura de manuscritos o documentos complejos.
- Este taller no admite PDF.
- El resultado sigue necesitando una interfaz accesible y revisión; instalar una librería no convierte una aplicación en accesible por sí solo.

## 7. Ejercicios

1. **Inicial:** añade un contador de caracteres después de reconocer la imagen. Pista: `resultado.value.length`.
2. **Inicial:** añade un botón «Borrar texto». Debe vaciar el resultado sin recargar.
3. **Intermedio:** añade dos botones para ajustar el tamaño del texto del resultado. Conserva un tamaño mínimo legible.
4. **Ampliación:** añade «Leer texto» y «Detener lectura» con `speechSynthesis`. Comprueba disponibilidad y no inicies la voz automáticamente. Las voces disponibles y su ejecución local dependen del dispositivo.

## 8. Comprueba y explica

Prueba la imagen del repositorio, una fotografía de un aviso ficticio y una imagen sin texto. Anota qué cambió en el resultado.

Responde:

- ¿Qué parte de la aplicación hace la IA?
- ¿Por qué no escribimos `resultado.innerHTML`?
- ¿Por qué deshabilitamos el botón durante el proceso?
- ¿Qué tendría que mejorar una persona que no puede encuadrar la imagen cómodamente?
- ¿En qué punto debe poder corregirse un error del OCR?

**Resultado mínimo:** imagen seleccionable, proceso visible, texto editable y error comprensible.
