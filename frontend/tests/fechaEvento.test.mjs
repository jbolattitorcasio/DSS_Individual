import test from 'node:test';
import assert from 'node:assert/strict';
import { combinarFechaHora, esFechaFutura, formatearFecha, formatearHora } from '../src/utils/fechaEvento.js';

test('formatea día, mes, horas y minutos con dos dígitos', () => {
  const valor = new Date(2027, 0, 2, 3, 4);
  assert.equal(formatearFecha(valor), '02/01/2027');
  assert.equal(formatearHora(valor), '03:04');
});

test('combina componentes locales sin mutar los originales y normaliza segundos', () => {
  const fecha = new Date(2027, 11, 31, 12);
  const hora = new Date(2026, 0, 1, 23, 59, 45);
  const combinado = combinarFechaHora(fecha, hora);
  assert.equal(formatearFecha(combinado), '31/12/2027');
  assert.equal(formatearHora(combinado), '23:59');
  assert.equal(combinado.getSeconds(), 0);
  assert.equal(fecha.getHours(), 12);
  assert.equal(hora.getSeconds(), 45);
  const restaurado = new Date(combinado.toISOString());
  assert.equal(restaurado.getHours(), 23);
  assert.equal(restaurado.getDate(), 31);
  if (process.env.TZ === 'America/Argentina/Buenos_Aires') {
    assert.equal(combinado.toISOString(), '2028-01-01T02:59:00.000Z');
  }
});

test('permite hoy con hora futura y rechaza horarios pasados o iguales', () => {
  const ahora = new Date(2027, 2, 20, 15, 30);
  for (const [hora, minuto, esperado] of [[15, 31, true], [15, 30, false], [15, 29, false]]) {
    assert.equal(esFechaFutura(combinarFechaHora(ahora, new Date(2027, 2, 20, hora, minuto)), ahora), esperado);
  }
  assert.equal(esFechaFutura(new Date(2027, 2, 19, 23, 59), ahora), false);
  assert.equal(esFechaFutura(new Date(2027, 2, 21, 0, 0), ahora), true);
});

test('rechaza selecciones incompletas, inválidas y horarios vencidos mientras se completa el formulario', () => {
  assert.equal(esFechaFutura(combinarFechaHora(null, new Date())), false);
  assert.equal(esFechaFutura(combinarFechaHora(new Date(), null)), false);
  assert.equal(esFechaFutura(new Date(NaN)), false);
  const fecha = new Date(2027, 2, 20, 15, 31);
  assert.equal(esFechaFutura(fecha, new Date(2027, 2, 20, 15, 32)), false);
});
