# Taller 3 · Cambiar una tarjeta con el pulgar

[Volver a la guía general](../README.md) · [HTML](index.html) · [JavaScript completo](app.js) · [Seguimiento del gesto](seguimiento.mjs)

**Objetivo:** reconocer el gesto de pulgar hacia arriba y usarlo para pasar a la siguiente tarjeta. Tiempo orientativo: 55–75 minutos.

## 1. Prueba primero la alternativa sencilla

Abre el taller con Live Server y pulsa **Siguiente tarjeta**. Debe recorrer tres textos. Prueba también con Tab y Enter o Espacio.

La acción existe antes de añadir IA. El gesto será otra forma de activar esa misma acción, no el único modo de utilizar la aplicación.

## 2. Activa y prueba la cámara

1. Pulsa **Activar cámara** y espera a que se descargue el modelo.
2. Concede permiso cuando lo pida el navegador.
3. Coloca una sola mano completa delante de la cámara, con buena iluminación.
4. Levanta el pulgar y mantenlo aproximadamente un segundo.
5. La tarjeta debe cambiar una vez.
6. Baja la mano antes de repetir el gesto.
7. Pulsa **Apagar cámara** y comprueba que se libera el dispositivo.

La cámara también se apaga al ocultar la pestaña. No se graba vídeo ni se solicita micrófono.

## 3. Separa acción y reconocimiento

```javascript
const tarjetas = ['Consultar actividades', 'Buscar recursos', 'Ver mis notas'];
let indice = 0;

function cambiarTarjeta() {
  indice = (indice + 1) % tarjetas.length;
  tarjeta.textContent = `${indice + 1}. ${tarjetas[indice]}`;
}
```

`%` calcula el resto. Cuando llegamos al final, el índice vuelve a cero. El botón y la detección llaman a la misma función.

## 4. Carga MediaPipe y el modelo

En `app.js`, la importación proporciona dos herramientas:

- `FilesetResolver`: localiza los archivos necesarios para ejecutar el motor.
- `GestureRecognizer`: crea el reconocedor y analiza imágenes.

Después de cargar los archivos, se prepara el modelo:

```javascript
reconocedor = await GestureRecognizer.createFromOptions(archivos, {
  baseOptions: { modelAssetPath: 'URL_DEL_MODELO' },
  runningMode: 'VIDEO',
  numHands: 1
});
```

Este fragmento es explicativo: el archivo `app.js` contiene la dirección real del modelo. `VIDEO` indica una secuencia de fotogramas y `numHands: 1` limita la práctica a una mano.

## 5. Conecta la cámara a un vídeo

```javascript
flujo = await navigator.mediaDevices.getUserMedia({
  video: { width: 640, height: 480 },
  audio: false
});
video.srcObject = flujo;
await video.play();
```

`srcObject` conecta el flujo de cámara con el elemento `<video>`. El tamaño solicitado es una preferencia que el navegador negocia con la cámara.

Para apagarla, no basta con ocultar el vídeo:

```javascript
flujo.getTracks().forEach((pista) => pista.stop());
video.srcObject = null;
```

## 6. Obtén el gesto

```javascript
const respuesta = reconocedor.recognizeForVideo(video, ahora);
const gesto = respuesta.gestures[0]?.[0];
```

`ahora` es la marca de tiempo que proporciona `requestAnimationFrame`. `gestures[0]` corresponde a la primera mano. El siguiente `[0]` toma su primer resultado. `?.` evita un error cuando no hay mano.

El resultado puede incluir:

```javascript
{ categoryName: 'Thumb_Up', score: 0.91 }
```

`Thumb_Up` es el nombre de la categoría; `score` es una puntuación del modelo. No significa una garantía de acierto del 91 % para una persona concreta.

El modelo preparado también reconoce categorías como `Open_Palm`, `Closed_Fist`, `Pointing_Up`, `Thumb_Down`, `Victory` e `ILoveYou`. No comprende cualquier gesto ni traduce lengua de signos.

## 7. Decide cuándo ejecutar la acción

Sería un error ejecutar la acción en cada fotograma: un único gesto podría cambiar muchas tarjetas.

El ejemplo exige:

1. Categoría `Thumb_Up`.
2. Puntuación mínima de `0.60` inicialmente, ajustable con el control de umbral. La versión inicial exigía `0.75`, por lo que rechazaba un pulgar reconocido al 60 %.
3. Acumular `1000` milisegundos de lecturas válidas, tolerando pequeñas interrupciones.
4. No haber utilizado ya ese gesto mantenido.

El archivo `seguimiento.mjs` recuerda el tiempo acumulado y si ya se ejecutó la acción. Una lectura fallida breve pausa el progreso; una interrupción de más de 300 ms lo reinicia. La barra muestra cuánto falta. Después de activar la acción hay que retirar el gesto durante al menos 500 ms antes de repetirlo.

Esto evita reiniciar todo el progreso por una fluctuación aislada y evita repetir la acción por un solo fotograma fallido. No aumenta la precisión del modelo: mejora cómo responde nuestra interfaz a sus resultados.

Para reducir trabajo, analizamos como máximo unos diez fotogramas por segundo. `recognizeForVideo` es síncrono y puede bloquear brevemente la interfaz; esta versión didáctica limita la frecuencia. Para vídeo más exigente, una ampliación sería mover la inferencia a un worker.

## 8. Ejercicios

1. **Inicial:** añade dos tarjetas nuevas al array.
2. **Inicial:** cambia el gesto a `Open_Palm` y modifica también las instrucciones visibles.
3. **Intermedio:** añade un selector de duración (por ejemplo, 1, 1.5 y 2 segundos), modificando el tiempo del módulo de seguimiento.
4. **Intermedio:** añade a la barra un porcentaje visible de progreso.
5. **Ampliación:** compara la retirada actual de medio segundo con una retirada de un segundo. Anota si reduce repeticiones accidentales o resulta demasiado lenta.

## 9. Comprueba y reflexiona

Prueba sin mano, con el gesto breve, con el gesto mantenido y con iluminación diferente. Apaga y vuelve a encender la cámara. Comprueba que el botón sigue funcionando cuando la cámara está apagada o se deniega el permiso.

Responde:

- ¿Qué parte hace el modelo y qué parte decide nuestro código?
- ¿Qué pasaría si quitásemos el estado `bloqueado` del seguimiento?
- ¿Subir el umbral siempre mejora la experiencia?
- ¿Puede la persona destinataria mantener este gesto sin dolor o fatiga?
- ¿Qué alternativa ofrecerías si no puede hacerlo?

**Resultado mínimo:** cámara controlable, detección visible, gesto mantenido que cambia una tarjeta y botón alternativo utilizable con teclado. Es un prototipo de interacción, no una ayuda técnica validada.

## 10. Si el gesto no activa la acción

1. Espera al mensaje «Modelo cargado y cámara activa». Los estados 1/3 y 2/3 distinguen la carga del modelo del permiso de cámara.
2. Observa la línea de detección: «No se detecta una mano» significa que debes encuadrar mejor; `None` significa que se detecta la mano pero no se reconoce un gesto del catálogo.
3. Compara la puntuación de `Thumb_Up` con el umbral. Ahora empieza en 60 %; puedes bajarlo a 55 % si fluctúa alrededor de 60 %. Reducirlo también puede aumentar los falsos positivos.
4. Muestra una sola mano completa con los otros dedos cerrados y el pulgar arriba. Evita contraluz y mantén el gesto hasta completar la barra.
5. La acción cambia el texto de la tarjeta; no pulsa visualmente el botón. Baja la mano medio segundo para repetir.

La consola puede mostrar `Custom gesture classifier is not defined`: usamos el clasificador de gestos predefinidos, no uno personalizado. `Graph successfully started running` indica que el motor se ha iniciado. Los avisos internos de OpenGL, feedback o proyección, por sí solos, no demuestran un fallo de descarga. Comprueba los estados de la página y si el análisis sigue produciendo resultados.

Si estabas usando una descarga anterior del proyecto, actualiza todos los archivos del taller, incluido `seguimiento.mjs`. En la web publicada, recarga con Ctrl+F5.
