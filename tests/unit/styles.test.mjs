/* Estilos: sin fugas del portafolio a las demos, fotos quietas y contraste AA. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_IDS, demoFile, read } from '../helpers/sandbox.mjs';

const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const STYLES = ['portfolio', 'demos', 'motion', 'demos-motion', 'demos-backgrounds', 'site'].map((n) => strip(read('src/styles/' + n + '.css')));

/* recorre reglas simples «selector{cuerpo}» */
function rules(css, fn) {
  css.split('}').forEach((chunk) => {
    const parts = chunk.split('{');
    if (parts.length < 2) return;
    fn(parts[parts.length - 2], parts[parts.length - 1]);
  });
}

test('ninguna regla del portafolio alcanza a las demos por un nombre de clase compartido', () => {
  const dsSrc = ['src/scripts/demos/kit.js', ...DEMO_IDS.map(demoFile)].map(read).join('\n');
  const used = new Set(['dm', 'ds']);
  [...dsSrc.matchAll(/class="([^"]+)"/g)].forEach((m) => m[1].split(/\s+/).forEach((c) => { if (/^[a-zA-Z][\w-]*$/.test(c)) used.add(c); }));
  const hits = [];
  ['portfolio', 'motion', 'site'].forEach((name) => rules(strip(read('src/styles/' + name + '.css')), (sel) => {
    if (!sel || sel.includes('@')) return;
    sel.split(',').forEach((s) => {
      const classes = (s.match(/\.[a-zA-Z][\w-]*/g) || []).map((c) => c.slice(1));
      if (classes.length && classes.every((c) => used.has(c))) hits.push(name + ': ' + s.trim());
    });
  }));
  assert.deepEqual(hits, [], 'reglas que se filtran a las demos');
});

test('ninguna foto se anima de forma continua (evita imágenes que tiemblan o saltan)', () => {
  const offenders = [];
  STYLES.forEach((css) => rules(css, (sel, body) => {
    if (/\bimg\b|__img|figure/.test(sel) && /animation[^;]*infinite/.test(body)) offenders.push(sel.trim());
  }));
  assert.deepEqual(offenders, []);
});

test('contraste AA (4,5:1) en el portafolio y en las cuatro paletas', () => {
  const lum = (hex) => {
    const c = hex.replace('#', '');
    const v = [0, 2, 4].map((i) => parseInt(c.substr(i, 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const vars = (css, sel) => {
    const m = css.match(new RegExp(sel.replace(/\./g, '\\.') + '\\{([^}]*)\\}'));
    assert.ok(m, 'sin paleta ' + sel);
    const o = {};
    m[1].replace(/--([\w-]+):\s*(#[0-9A-Fa-f]{6})/g, (_, k, v) => { o[k] = v; });
    return o;
  };
  const demos = read('src/styles/demos.css');
  const checks = [];
  ['.ds-dental', '.ds-rest', '.ds-barber', '.ds-gym'].forEach((p) => {
    const v = vars(demos, p);
    [['c-fg', 'c-bg'], ['c-muted', 'c-bg'], ['c-acc-ink', 'c-acc'], ['c-acc-t', 'c-bg'], ['c-fg', 'c-surf'], ['c-muted', 'c-surf']]
      .forEach(([a, b]) => checks.push([p + ' ' + a + '/' + b, ratio(v[a], v[b])]));
  });
  const r = vars(read('src/styles/portfolio.css'), ':root');
  [['fg', 'bg'], ['fg-2', 'bg'], ['fg-2', 's1'], ['accent-ink', 'accent']].forEach(([a, b]) => checks.push([':root ' + a + '/' + b, ratio(r[a], r[b])]));
  const low = checks.filter((c) => !(c[1] >= 4.5)).map((c) => c[0] + ' = ' + c[1].toFixed(2));
  assert.deepEqual(low, [], 'por debajo de 4,5:1');
});

test('el acento del portafolio es #E0A200 y no hay negro puro', () => {
  const portfolio = read('src/styles/portfolio.css');
  assert.match(portfolio, /--accent:#E0A200;/);
  assert.doesNotMatch(portfolio, /#000000\b|#000\b(?![0-9a-f])/i, 'el brief prohíbe el negro puro');
});
