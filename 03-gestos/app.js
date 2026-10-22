const iniciar = document.querySelector('#iniciar');
const parar = document.querySelector('#parar');
const video = document.querySelector('#video');
const estado = document.querySelector('#estado');
const deteccion = document.querySelector('#deteccion');
const tarjeta = document.querySelector('#tarjeta');
const siguiente = document.querySelector('#siguiente');
const tarjetas = ['Consultar actividades', 'Buscar recursos', 'Ver mis notas'];
let indice = 0;
let reconocedor;
let flujo;
let animacion;
let activo = false;
let ultimoFotograma = -1;
let ultimoAnalisis = 0;
let inicioGesto = null;
let gestoUtilizado = false;
const CONFIANZA_MINIMA = 0.75;
const DURACION_GESTO = 1000;

// 1. La acción está separada de la IA: también funciona con un botón normal.
function cambiarTarjeta() {
  indice = (indice + 1) % tarjetas.length;
  tarjeta.textContent = `${indice + 1}. ${tarjetas[indice]}`;
}
siguiente.addEventListener('click', cambiarTarjeta);

// 2. Descargamos el modelo antes de pedir la cámara.
iniciar.addEventListener('click', async () => {
  iniciar.disabled = true;
  estado.textContent = 'Cargando el reconocedor de gestos…';
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
    flujo = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
    video.srcObject = flujo;
    await video.play();
    activo = true;
    parar.disabled = false;
    estado.textContent = 'Cámara activa. Mantén el pulgar hacia arriba durante un segundo.';
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
      deteccion.textContent = gesto
        ? `Gesto: ${gesto.categoryName}. Puntuación del modelo: ${Math.round(gesto.score * 100)} %`
        : 'No se detecta una mano.';
      // 4. Exigimos un gesto mantenido; no activamos una acción por fotograma.
      if (gesto?.categoryName === 'Thumb_Up' && gesto.score >= CONFIANZA_MINIMA) {
        if (inicioGesto === null) inicioGesto = ahora;
        if (!gestoUtilizado && ahora - inicioGesto >= DURACION_GESTO) {
          cambiarTarjeta();
          gestoUtilizado = true;
          estado.textContent = 'Tarjeta cambiada. Baja la mano antes de repetir.';
        }
      } else {
        inicioGesto = null;
        gestoUtilizado = false;
      }
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
  inicioGesto = null;
  gestoUtilizado = false;
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
