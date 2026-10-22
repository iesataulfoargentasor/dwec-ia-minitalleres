import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearSeguimiento } from '../03-gestos/seguimiento.mjs';

test('un segundo de pulgar activa una sola vez aunque se mantenga', () => {
  const leer = crearSeguimiento();
  let acciones = 0;
  for (let t = 0; t <= 3000; t += 100) acciones += Number(leer(true, t).activar);
  assert.equal(acciones, 1);
});
test('una lectura fallida breve pausa el tiempo, no borra el progreso', () => {
  const leer = crearSeguimiento();
  for (let t = 0; t <= 500; t += 100) leer(true, t);
  assert.equal(leer(false, 600).progreso, 50);
  assert.equal(leer(true, 700).progreso, 50);
  for (let t = 800; t <= 1100; t += 100) assert.equal(leer(true, t).activar, false);
  assert.equal(leer(true, 1200).activar, true);
});
test('gestos breves separados no se suman', () => {
  const leer = crearSeguimiento();
  for (let t = 0; t <= 500; t += 100) leer(true, t);
  assert.equal(leer(false, 900).progreso, 0);
  assert.equal(leer(true, 1000).activar, false);
});
test('se necesita medio segundo de retirada para repetir', () => {
  const leer = crearSeguimiento();
  for (let t = 0; t <= 1000; t += 100) leer(true, t);
  leer(false, 1100);
  assert.equal(leer(true, 1200).bloqueado, true);
  for (let t = 1300; t <= 1800; t += 100) leer(false, t);
  let acciones = 0;
  for (let t = 1900; t <= 2900; t += 100) acciones += Number(leer(true, t).activar);
  assert.equal(acciones, 1);
});
test('un salto grande de tiempo no cuenta como gesto mantenido', () => {
  const leer = crearSeguimiento();
  leer(true, 0);
  assert.equal(leer(true, 5000).activar, false);
});
