/* Arranque, movimiento y red de seguridad: nada puede quedar oculto ni romper la página. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { jsFiles, read } from '../helpers/sandbox.mjs';

const APP = read('src/scripts/app.js');
const MOUNT = read('src/scripts/demos/mount.js');
const MO = read('src/scripts/motion.js');
const HUD = read('src/scripts/hud.js');
const CSS = ['portfolio', 'demos', 'motion', 'demos-motion', 'demos-backgrounds', 'site'].map((n) => read('src/styles/' + n + '.css')).join('\n');

test('las demos se buscan con hasOwnProperty (evita /es/demo/__proto__/)', () => {
  assert.match(MOUNT, /hasOwnProperty\.call\(DEMOS, id\)/);
  assert.doesNotMatch(MOUNT, /\bid in DEMOS\b/);
});

test('montar una demo y su fondo está protegido con try/catch', () => {
  assert.match(APP, /try \{\s*const \{ mountDemo: mount \} = await import\('\.\/demos\/mount\.js'\);/, 'la carga de la demo no está protegida');
  assert.match(MOUNT, /try \{ offBg = DSBG\.mount/, 'el fondo animado no está protegido');
  assert.match(MOUNT, /root\.classList\.contains\('ds'\)/, 'el fondo no reconoce la raíz de la demo (.ds es el propio #demoRoot)');
});

test('el arranque siempre termina mostrando el contenido', () => {
  assert.match(APP, /\} catch \(err\) \{[\s\S]*?classList\.remove\('is-pre'\)/, 'un fallo del arranque no revela el contenido');
  assert.match(APP, /finally \{[\s\S]*?classList\.remove\('is-booting'\)/, 'is-booting no se retira siempre');
  assert.match(CSS, /\.stage\.is-booting \.hdr\{ opacity:0; animation:boot-failsafe 0s linear 2\.5s forwards; \}/, 'falta la salvaguarda CSS si el script no llega');
  assert.match(read('src/layouts/SiteLayout.astro'), /<noscript><style>\.stage\.is-booting/, 'sin JavaScript el contenido quedaría oculto');
});

test('mostrar contenido no depende de IntersectionObserver', () => {
  assert.doesNotMatch(MO, /new IntersectionObserver/);
});

test('movimiento siempre activo, sin interruptor ni prefers-reduced-motion', () => {
  assert.match(APP, /const MOTION_ON = true;/);
  for (const [name, src] of [['app.js', APP], ['motion.js', MO], ['hud.js', HUD]]) {
    assert.doesNotMatch(src, /matchMedia\([^)]*prefers-reduced-motion/, name + ' se apaga con prefers-reduced-motion');
  }
  assert.doesNotMatch(CSS, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'una regla CSS anula las animaciones');
});

test('el movimiento revela todo ante un error, y a los 5 s pase lo que pase', () => {
  assert.match(MO, /function revealAll/);
  assert.match(MO, /addEventListener\('error'/);
  assert.match(MO, /checkReveal\(true\)/);
  assert.match(MO, /sr\.height < 2/);
  assert.match(MO, /catch \(err\) \{ fail\(err\); \}/);
});

test('cada coreografía declarada tiene estilos', () => {
  const m = MO.match(/var STEP = \{([\s\S]*?)\};/);
  assert.ok(m, 'no se encontró STEP');
  const kinds = [...m[1].matchAll(/([a-z]+):/g)].map((x) => x[1]).filter((k) => k !== 'count' && k !== 'fade');
  kinds.forEach((k) => assert.ok(CSS.includes('.rv-' + k), 'sin CSS para la coreografía «' + k + '»'));
});

test('el cliente no ejecuta código dinámico (eval, new Function, document.write)', () => {
  for (const f of jsFiles('src/scripts')) {
    assert.doesNotMatch(read(f), /\beval\s*\(|new Function\s*\(|document\.write\s*\(/, f);
  }
});
