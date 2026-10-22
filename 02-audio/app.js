// La interfaz prepara el audio; worker.js ejecuta la IA sin bloquear la página.
const grabar = document.querySelector('#grabar');
const detener = document.querySelector('#detener');
const archivo = document.querySelector('#archivo');
const transcribir = document.querySelector('#transcribir');
const reproductor = document.querySelector('#reproductor');
const estado = document.querySelector('#estado');
const resultado = document.querySelector('#resultado');
let audioElegido;
let urlAudio;
let grabadora;
let flujo;
let temporizador;
let worker;

function prepararAudio(blob) {
  audioElegido = blob;
  if (urlAudio) URL.revokeObjectURL(urlAudio);
  urlAudio = URL.createObjectURL(blob);
  reproductor.src = urlAudio;
  reproductor.hidden = false;
  transcribir.disabled = false;
  resultado.value = '';
  estado.textContent = 'Audio preparado. Escúchalo y pulsa Transcribir.';
}

function bloquear(ocupado) {
  grabar.disabled = ocupado || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder;
  archivo.disabled = ocupado;
  transcribir.disabled = ocupado || !audioElegido;
}

archivo.addEventListener('change', () => {
  const fichero = archivo.files[0];
  if (!fichero) return;
  if (fichero.size > 10 * 1024 * 1024) {
    estado.textContent = 'El archivo supera 10 MB. Elige uno más pequeño.';
    return;
  }
  prepararAudio(fichero);
});

// 1. Pedimos permiso y grabamos. No fijamos un formato: decide el navegador.
grabar.addEventListener('click', async () => {
  bloquear(true);
  estado.textContent = 'Esperando permiso para utilizar el micrófono…';
  try {
    flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
    grabadora = new MediaRecorder(flujo);
    const partes = [];
    grabadora.addEventListener('dataavailable', (evento) => {
      if (evento.data.size > 0) partes.push(evento.data);
    });
    grabadora.addEventListener('stop', () => {
      clearTimeout(temporizador);
      flujo.getTracks().forEach((pista) => pista.stop());
      detener.disabled = true;
      prepararAudio(new Blob(partes, { type: grabadora.mimeType }));
      bloquear(false);
    });
    grabadora.start();
    detener.disabled = false;
    estado.textContent = 'Grabando… Di una frase y pulsa Detener (máximo 15 segundos).';
    temporizador = setTimeout(pararGrabacion, 15000);
  } catch (error) {
    console.error(error);
    flujo?.getTracks().forEach((pista) => pista.stop());
    estado.textContent = 'No se pudo abrir el micrófono. Revisa los permisos o selecciona un archivo.';
    bloquear(false);
  }
});

function pararGrabacion() {
  if (grabadora?.state === 'recording') grabadora.stop();
}
detener.addEventListener('click', pararGrabacion);

// 2. Convertimos cualquier formato que el navegador pueda decodificar a
// muestras mono de 16 kHz: es la entrada que espera este modelo Whisper.
async function obtenerMuestras(blob) {
  const contexto = new AudioContext();
  let audio;
  try {
    audio = await contexto.decodeAudioData(await blob.arrayBuffer());
  } finally {
    await contexto.close();
  }
  if (audio.duration > 20) throw new Error('El audio debe durar como máximo 20 segundos.');
  const offline = new OfflineAudioContext(1, Math.ceil(audio.duration * 16000), 16000);
  const fuente = offline.createBufferSource();
  fuente.buffer = audio;
  fuente.connect(offline.destination);
  fuente.start();
  const convertido = await offline.startRendering();
  return convertido.getChannelData(0);
}

// 3. Creamos el worker la primera vez y escuchamos sus mensajes.
function obtenerWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  worker.addEventListener('message', ({ data }) => {
    if (data.tipo === 'estado') estado.textContent = data.texto;
    if (data.tipo === 'resultado') {
      resultado.value = data.texto;
      estado.textContent = 'Terminado. Revisa la transcripción antes de utilizarla.';
      bloquear(false);
    }
    if (data.tipo === 'error') {
      estado.textContent = data.texto;
      bloquear(false);
    }
  });
  worker.addEventListener('error', () => {
    estado.textContent = 'No se pudo iniciar la IA. Comprueba la conexión y vuelve a intentarlo.';
    worker.terminate();
    worker = null;
    bloquear(false);
  });
  return worker;
}

transcribir.addEventListener('click', async () => {
  bloquear(true);
  resultado.value = '';
  estado.textContent = 'Preparando el audio…';
  try {
    const muestras = await obtenerMuestras(audioElegido);
    obtenerWorker().postMessage({ muestras });
  } catch (error) {
    console.error(error);
    estado.textContent = `No se pudo preparar el audio: ${error.message}`;
    bloquear(false);
  }
});

window.addEventListener('pagehide', () => {
  clearTimeout(temporizador);
  flujo?.getTracks().forEach((pista) => pista.stop());
  worker?.terminate();
  worker = null;
});
bloquear(false);
