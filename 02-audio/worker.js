// Un worker no accede al DOM: se comunica con app.js mediante mensajes.
let transcriptor;

self.addEventListener('message', async ({ data }) => {
  try {
    if (!transcriptor) {
      self.postMessage({ tipo: 'estado', texto: 'Descargando Whisper Tiny… La primera vez puede tardar varios minutos.' });
      const { pipeline, env } = await import(
        'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1'
      );
      env.allowLocalModels = false;
      // Un solo hilo evita necesitar cabeceras especiales en Live Server/Pages.
      env.backends.onnx.wasm.numThreads = 1;
      transcriptor = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
        device: 'wasm',
        dtype: 'q8'
      });
    }
    self.postMessage({ tipo: 'estado', texto: 'Transcribiendo en tu dispositivo…' });
    const respuesta = await transcriptor(data.muestras, {
      language: 'spanish',
      task: 'transcribe'
    });
    self.postMessage({ tipo: 'resultado', texto: respuesta.text });
  } catch (error) {
    console.error(error);
    self.postMessage({ tipo: 'error', texto: 'No se pudo transcribir. Comprueba la conexión, prueba un audio más corto o recarga la página.' });
  }
});
