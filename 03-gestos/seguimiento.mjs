// Decide cuándo actuar a partir de lecturas del modelo. No usa cámara ni DOM.
export function crearSeguimiento() {
  let acumulado = 0;
  let anterior = null;
  let anteriorValido = false;
  let ultimoValido = null;
  let bloqueado = false;
  let inicioAusencia = null;

  return function actualizar(valido, ahora) {
    let activar = false;
    if (bloqueado) {
      if (valido) inicioAusencia = null;
      else {
        if (inicioAusencia === null) inicioAusencia = ahora;
        // Medio segundo sin pulgar evita repetir por una sola lectura fallida.
        if (ahora - inicioAusencia >= 500) {
          bloqueado = false;
          acumulado = 0;
          ultimoValido = null;
        }
      }
    } else if (valido) {
      // Reiniciamos si hay una interrupción larga, pero toleramos hasta 300 ms.
      if (ultimoValido === null || ahora - ultimoValido > 300) acumulado = 0;
      else if (anteriorValido) acumulado += ahora - anterior;
      ultimoValido = ahora;
      inicioAusencia = null;
      if (acumulado >= 1000) {
        activar = true;
        bloqueado = true;
      }
    } else if (ultimoValido !== null && ahora - ultimoValido > 300) {
      acumulado = 0;
    }
    anterior = ahora;
    anteriorValido = valido;
    return { activar, bloqueado, progreso: bloqueado ? 100 : Math.min(100, acumulado / 10) };
  };
}
