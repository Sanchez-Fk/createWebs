/* Pantalla de carga: se retira siempre, también sin fotogramas (pestaña oculta) y si ya se vio. */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { asScript, read } from '../helpers/sandbox.mjs';

function setup({ seen = false } = {}) {
  const store = {};
  const classes = new Set();
  const intro = {
    removed: false,
    classList: { add: (c) => classes.add(c), contains: (c) => classes.has(c) },
    querySelector: () => ({ textContent: '', style: {} }),
    remove() { this.removed = true; }
  };
  const vp = { inert: false };
  const ctx = vm.createContext({
    console: { error() {}, log() {} },
    setTimeout, clearTimeout, performance,
    requestAnimationFrame: () => 1,                 /* pestaña oculta: los fotogramas nunca llegan */
    cancelAnimationFrame() {},
    sessionStorage: { setItem: (k, v) => { store[k] = v; } },
    document: {
      getElementById: (id) => (id === 'intro' ? intro : id === 'vp' ? vp : null),
      documentElement: { classList: { contains: (c) => c === 'intro-seen' && seen } }
    }
  });
  vm.runInContext(asScript(read('src/scripts/intro.js')), ctx, { filename: 'intro.js' });
  return { ctx, intro, vp, classes, store };
}

test('primera visita: marca la sesión, bloquea el foco y termina retirándose sin fotogramas', async () => {
  const { ctx, intro, vp, classes, store } = setup();
  const t0 = Date.now();
  const api = ctx.startIntro();
  assert.equal(store['jms:intro'], '1', 'no marca la sesión');
  assert.equal(vp.inert, true, 'el sitio detrás de la cortina debería ser inerte');
  await api.handoff();
  const elapsed = Date.now() - t0;
  assert.ok(classes.has('is-leaving'), 'la cortina no sube');
  assert.equal(vp.inert, false, 'el sitio sigue inerte');
  assert.ok(elapsed >= 1400 && elapsed < 3500, 'duración fuera de rango: ' + elapsed + ' ms');
  await new Promise((r) => setTimeout(r, 1300));
  assert.equal(intro.removed, true, 'la pantalla de carga no se elimina del documento');
  api.leave();                                       /* repetir leave no rompe nada */
});

test('ya vista en la sesión: se elimina al instante y no retrasa el sitio', async () => {
  const { ctx, intro } = setup({ seen: true });
  const t0 = Date.now();
  const api = ctx.startIntro();
  await api.handoff();
  api.leave();
  assert.equal(intro.removed, true);
  assert.ok(Date.now() - t0 < 50, 'no debería esperar nada');
});
