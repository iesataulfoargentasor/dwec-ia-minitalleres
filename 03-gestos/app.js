import { crearSeguimiento } from './seguimiento.mjs';

const iniciar = document.querySelector('#iniciar');
const parar = document.querySelector('#parar');
const video = document.querySelector('#video');
const estado = document.querySelector('#estado');
const deteccion = document.querySelector('#deteccion');
const tarjeta = document.querySelector('#tarjeta');
const siguiente = document.querySelector('#siguiente');
const umbral = document.querySelector('#umbral');
const valorUmbral = document.querySelector('#valor-umbral');
const progreso = document.querySelector('#progreso');
const ayuda = document.querySelector('#ayuda-gesto');
const tarjetas = ['Consultar actividades', 'Buscar recursos', 'Ver mis notas'];
let indice = 0;
let reconocedor;
let flujo;
let animacion;
let activo = false;
let ultimoFotograma = -1;
let ultimoAnalisis = 0;
let seguimiento = crearSeguimiento();
umbral.addEventListener('input', () => {
  valorUmbral.textContent = `${umbral.value} %`;
  seguimiento = crearSeguimiento();
  progreso.value = 0;
});

// 1. La acción está separada de la IA: también funciona con un botón normal.
function cambiarTarjeta() {
  indice = (indice + 1) % tarjetas.length;
  tarjeta.textContent = `${indice + 1}. ${tarjetas[indice]}`;
}
siguiente.addEventListener('click', cambiarTarjeta);

// 2. Descargamos el modelo antes de pedir la cámara.
iniciar.addEventListener('click', async () => {
  iniciar.disabled = true;
  estado.textContent = '1/3. Descargando y preparando el modelo de gestos…';
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Abre la página en localhost o HTTPS y utiliza un navegador compatible.');
    }
    if (!reconocedor) {
      const { FilesetResolver, GestureRecognizer } = await import(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/vision_bundle.mjs'
      );
      const archivos = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm'
      );
      reconocedor = await GestureRecognizer.createFromOptions(archivos, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task'
        },
        runningMode: 'VIDEO',
        numHands: 1
      });
    }
    estado.textContent = '2/3. Modelo cargado. Esperando permiso para abrir la cámara…';
    flujo = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
    video.srcObject = flujo;
    await video.play();
    activo = true;
    parar.disabled = false;
    estado.textContent = '3/3. Modelo cargado y cámara activa. Se está analizando el vídeo.';
    animacion = requestAnimationFrame(analizar);
  } catch (error) {
    apagar();
    console.error(error);
    estado.textContent = `No se pudo activar: ${error.message}. Puedes usar el botón Siguiente.`;
  }
});

// 3. Analizamos como máximo unas 10 imágenes por segundo.
function analizar(ahora) {
  if (!activo) return;
  try {
    if (video.readyState >= 2 && video.currentTime !== ultimoFotograma && ahora - ultimoAnalisis >= 100) {
      ultimoFotograma = video.currentTime;
      ultimoAnalisis = ahora;
      const respuesta = reconocedor.recognizeForVideo(video, ahora);
      const gesto = respuesta.gestures[0]?.[0];
      const hayMano = respuesta.landmarks.length > 0;
      deteccion.textContent = !hayMano ? 'No se detecta una mano.'
        : `Mano detectada. Gesto: ${gesto?.categoryName ?? 'None'}. Puntuación: ${Math.round((gesto?.score ?? 0) * 100)} %. Umbral: ${umbral.value} %.`;
      // 4. Sumamos tiempo válido sin perderlo por una fluctuación muy breve.
      const valido = gesto?.categoryName === 'Thumb_Up' && gesto.score >= Number(umbral.value) / 100;
      const paso = seguimiento(valido, ahora);
      progreso.value = paso.progreso;
      if (paso.activar) {
        cambiarTarjeta();
        estado.textContent = 'Tarjeta cambiada mediante el gesto. Retira el pulgar medio segundo para repetir.';
      }
      ayuda.textContent = paso.bloqueado ? 'Acción realizada. Baja la mano durante medio segundo.'
        : !hayMano ? 'Muestra la mano completa, con luz de frente y los dedos dentro del vídeo.'
        : gesto?.categoryName !== 'Thumb_Up' ? 'Se ve la mano, pero no el pulgar levantado. Cierra los otros dedos y orienta la mano hacia la cámara.'
        : !valido ? 'Pulgar reconocido, pero por debajo del umbral. Mejora la posición o prueba a bajar el umbral a 60 %.'
        : 'Pulgar reconocido. Mantenlo hasta completar la barra.';
    }
    animacion = requestAnimationFrame(analizar);
  } catch (error) {
    apagar();
    console.error(error);
    estado.textContent = 'Se ha detenido la detección. Puedes reintentar o utilizar el botón Siguiente.';
  }
}

// 5. Detener el vídeo no basta: hay que detener sus pistas.
function apagar() {
  activo = false;
  cancelAnimationFrame(animacion);
  flujo?.getTracks().forEach((pista) => pista.stop());
  video.srcObject = null;
  seguimiento = crearSeguimiento();
  progreso.value = 0;
  ayuda.textContent = 'Activa la cámara para comprobar el gesto.';
  ultimoFotograma = -1;
  iniciar.disabled = false;
  parar.disabled = true;
  estado.textContent = 'La cámara está apagada.';
  deteccion.textContent = 'No se está analizando vídeo.';
}
parar.addEventListener('click', apagar);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && activo) apagar();
});
window.addEventListener('pagehide', apagar);
