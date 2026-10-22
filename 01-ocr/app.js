// 1. Seleccionamos los elementos del HTML.
const imagen = document.querySelector('#imagen');
const vista = document.querySelector('#vista');
const extraer = document.querySelector('#extraer');
const estado = document.querySelector('#estado');
const resultado = document.querySelector('#resultado');
let urlImagen;

// 2. Mostramos una vista previa sin subir el archivo a Internet.
imagen.addEventListener('change', () => {
  if (urlImagen) URL.revokeObjectURL(urlImagen);
  vista.hidden = true;
  extraer.disabled = true;
  resultado.value = '';
  const archivo = imagen.files[0];
  if (!archivo) return;
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(archivo.type)
      || archivo.size > 10 * 1024 * 1024) {
    estado.textContent = 'Elige un PNG, JPG o WebP de hasta 10 MB.';
    return;
  }
  urlImagen = URL.createObjectURL(archivo);
  vista.src = urlImagen;
  vista.hidden = false;
  extraer.disabled = false;
  estado.textContent = 'Imagen preparada. Pulsa Extraer texto.';
});

// 3. Cargamos la librería solo cuando se necesita.
extraer.addEventListener('click', async () => {
  extraer.disabled = true;
  imagen.disabled = true;
  resultado.value = '';
  estado.textContent = 'Cargando el motor OCR y el idioma español…';
  let worker;
  try {
    const { default: Tesseract } = await import(
      'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.esm.min.js'
    );
    // Un worker realiza el trabajo pesado fuera del hilo de la interfaz.
    worker = await Tesseract.createWorker('spa', 1, {
      logger: (mensaje) => {
        if (mensaje.status === 'recognizing text') {
          estado.textContent = `Reconociendo texto: ${Math.round(mensaje.progress * 100)} %`;
        }
      }
    });
    // 4. Entregamos el archivo al motor y esperamos su resultado.
    const respuesta = await worker.recognize(imagen.files[0]);
    resultado.value = respuesta.data.text;
    estado.textContent = resultado.value.trim()
      ? 'Terminado. Revisa el texto: el OCR puede equivocarse.'
      : 'No se ha encontrado texto. Prueba una imagen más nítida.';
  } catch (error) {
    console.error(error);
    estado.textContent = 'No se pudo leer la imagen. Comprueba la conexión y prueba otra imagen.';
  } finally {
    // 5. Liberamos recursos, también si se ha producido un error.
    if (worker) await worker.terminate();
    extraer.disabled = false;
    imagen.disabled = false;
  }
});
