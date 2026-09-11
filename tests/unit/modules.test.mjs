/* Estructura: imports que existen, fotos registradas con su archivo y sectores con demo. */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { exists, jsFiles, makeSandbox, read, run } from '../helpers/sandbox.mjs';

const FILES = [...jsFiles('src/scripts'), 'src/data/images.js'];

function exportsOf(src) {
  const names = new Set();
  for (const m of src.matchAll(/^export\s+\{([^}]*)\};$/gm)) m[1].split(',').map((s) => s.trim()).filter(Boolean).forEach((n) => names.add(n));
  for (const m of src.matchAll(/^export\s+(?:const|let|var|(?:async\s+)?function)\s+([\w$]+)/gm)) names.add(m[1]);
  return names;
}

test('cada import apunta a un archivo que existe y exporta lo que se pide', () => {
  for (const file of FILES) {
    const src = read(file);
    for (const m of src.matchAll(/^import\s+(\w+|\{([^}]*)\})\s+from\s+'([^']+)';$/gm)) {
      const spec = m[3];
      if (!spec.startsWith('.')) {
        assert.ok(exists('node_modules/' + spec + '/package.json'), file + ': dependencia no instalada «' + spec + '»');
        continue;
      }
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), spec));
      assert.ok(exists(target), file + ': no existe ' + target);
      if (m[2]) {
        const available = exportsOf(read(target));
        m[2].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean)
          .forEach((name) => assert.ok(available.has(name), file + ': ' + target + ' no exporta «' + name + '»'));
      }
    }
  }
});

test('cada foto registrada existe, con su versión de 800 px y su autor', () => {
  const c = run(makeSandbox(), 'src/data/images.js');
  for (const [key, url] of Object.entries(c.IMG)) {
    assert.ok(exists('public' + url), key + ': falta ' + url);
    assert.ok(c.CREDITS[key], key + ': sin autor en CREDITS');
  }
  for (const [key, set] of Object.entries(c.IMG_SRCSET)) {
    assert.ok(c.IMG[key], key + ': srcset sin foto principal');
    set.split(',').map((s) => s.trim().split(/\s+/)[0]).forEach((url) => assert.ok(exists('public' + url), key + ': falta ' + url));
  }
});

test('cada sector del contenido tiene demo registrada y foto', () => {
  const sectors = [...read('src/data/content.ts').matchAll(/\{ id: '(\w+)', img: '(\w+)'/g)].map((m) => ({ id: m[1], img: m[2] }));
  const demos = read('src/scripts/demos/index.js').match(/export const DEMOS = \{([^}]*)\};/)[1].split(',').map((s) => s.trim());
  const c = run(makeSandbox(), 'src/data/images.js');
  assert.equal(sectors.length, 4);
  assert.deepEqual(sectors.map((s) => s.id), demos);
  sectors.forEach((s) => assert.ok(c.IMG[s.img], s.id + ': sin foto ' + s.img));
});
