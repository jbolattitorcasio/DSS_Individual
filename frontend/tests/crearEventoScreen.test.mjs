import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import * as fechas from '../src/utils/fechaEvento.js';
const require = createRequire(import.meta.url);

test('ruta real y botones Android: abren calendario/reloj, confirman y cancelan sin cambios', () => {
  const ruta = readFileSync(new URL('../src/app/organizador/eventos/crear.js', import.meta.url), 'utf8');
  assert.match(ruta, /import CrearEventoScreen from '\.\.\/\.\.\/\.\.\/screens\/CrearEventoScreen'/);
  assert.match(ruta, /export default CrearEventoScreen/);
  const source = readFileSync(new URL('../src/screens/CrearEventoScreen.js', import.meta.url), 'utf8');
  const { code } = require('@babel/core').transformSync(source, { configFile: false, babelrc: false,
    plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }], '@babel/plugin-transform-modules-commonjs'] });
  const estados = [];
  let cursor = 0, dialogo;
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    react: { useEffect() {}, useState(valor) { const i = cursor++; if (!(i in estados)) estados[i] = valor; return [estados[i], v => { estados[i] = v; }]; } },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { Platform: { OS: 'android' }, StyleSheet: { create: x => x }, ...Object.fromEntries(['ActivityIndicator', 'Modal', 'Pressable', 'ScrollView', 'Text', 'TextInput', 'View'].map(x => [x, x])) },
    '@react-native-community/datetimepicker': { __esModule: true, default: 'Picker', DateTimePickerAndroid: { open: x => { dialogo = x; } } },
    '../utils/fechaEvento': fechas, 'expo-router': { router: {} },
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    '../context/UsuarioContext': { useUsuario: () => ({ usuarioActivo: null }) },
    '../services/eventosApi': {}, '../theme/colors': { colors: {} },
    '../components/FilterChip': { __esModule: true, default: 'FilterChip' },
    '../components/UsuarioSelector': { __esModule: true, default: 'UsuarioSelector' },
  };
  const exports = {};
  vm.runInNewContext(code, { exports, Date, require: id => { assert.ok(id in mocks, id); return mocks[id]; } });
  function render() {
    cursor = 0;
    const nodos = [];
    function visitar(n) {
      if (!n || typeof n !== 'object') return;
      if (Array.isArray(n)) return n.forEach(visitar);
      if (typeof n.type === 'function') return visitar(n.type(n.props));
      nodos.push(n); visitar(n.props?.children);
    }
    visitar(exports.default()); return nodos;
  }
  const boton = (n, label) => n.find(x => x.type === 'Pressable' && x.props.accessibilityLabel?.startsWith(label));
  let nodos = render();
  for (const [label, modo, display, valor, texto] of [
    ['Fecha del evento', 'date', 'calendar', new Date(2027, 2, 20), '20/03/2027'],
    ['Hora del evento', 'time', 'clock', new Date(2027, 2, 20, 21, 5), '21:05'],
  ]) {
    boton(nodos, label).props.onPress();
    assert.equal(dialogo.mode, modo); assert.equal(dialogo.display, display); assert.equal(dialogo.is24Hour, true);
    if (modo === 'date') assert.equal(dialogo.minimumDate.getHours(), 0);
    dialogo.onValueChange({}, valor); nodos = render();
    assert.equal(boton(nodos, label).props.accessibilityLabel, `${label}: ${texto}`);
    boton(nodos, label).props.onPress(); dialogo.onDismiss(); nodos = render();
    assert.equal(boton(nodos, label).props.accessibilityLabel, `${label}: ${texto}`);
  }
  assert.equal(nodos.some(n => n.type === 'TextInput' && /ISO|AAAA|HH:mm|2027-/.test(n.props.placeholder || '')), false);
});
