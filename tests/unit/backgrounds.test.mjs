/* Fondos animados de las demos: cada escena dibuja sin romperse a cualquier tamaño. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_IDS, fakeCanvas, makeSandbox, run } from '../helpers/sandbox.mjs';

const doc = (w, h) => ({ hidden: false, addEventListener() {}, removeEventListener() {}, createElement: () => fakeCanvas(w, h) });

test('4 escenas, con y sin movimiento, a varios tamaños (incluido 0×0)', () => {
  for (const id of DEMO_IDS) {
    for (const on of [true, false]) {
      for (const [w, h] of [[1280, 800], [390, 844], [0, 0]]) {
        const c = run(makeSandbox({ document: doc(w, h) }), 'src/scripts/demos/backgrounds.js');
        const root = { firstChild: null, insertBefore() {}, classList: { add() {} } };
        let stop;
        try {
          stop = c.DSBG.mount(root, id, () => on);
          for (let i = 0, t = 0; i < 90 && c.__raf.length; i++) c.__raf.splice(0).forEach((f) => f((t += 16.7)));
        } catch (e) {
          throw new Error(id + ' ' + w + '×' + h + ' movimiento=' + on + ': ' + e.message);
        }
        assert.equal(typeof stop, 'function', id + ': sin función de limpieza');
        stop();
      }
    }
  }
});

test('un sector desconocido o heredado del prototipo no monta fondo', () => {
  const c = run(makeSandbox(), 'src/scripts/demos/backgrounds.js');
  for (const id of ['__proto__', 'constructor', 'toString', 'spa']) {
    assert.equal(c.DSBG.mount({ insertBefore() {}, classList: { add() {} } }, id, () => true), null, id);
  }
});
