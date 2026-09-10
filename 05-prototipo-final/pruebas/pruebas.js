#!/usr/bin/env node
/* ===========================================================================
   PRUEBAS DE SEGURIDAD Y ROBUSTEZ DEL PROTOTIPO — sin dependencias (Node 18+)
   Uso:  node 05-prototipo-final/pruebas/pruebas.js
   Sale con código 1 si alguna prueba falla.
   =========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');

const DIR = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(DIR, f), 'utf8').replace(/\r\n/g, '\n');
const HTML = read('prototipo.html');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ✓ ' + name); }
  catch (e) { fail++; console.log('  ✗ ' + name + '\n      ' + (e && e.message ? e.message : e)); }
}
function ok(cond, msg) { if (!cond) throw new Error(msg || 'condición falsa'); }
function section(t) { console.log('\n' + t); }
const stripImg = s => s.split('data:image/webp;base64,').map((c, i) => (i ? c.replace(/^[A-Za-z0-9+/=]+/, 'IMG') : c)).join('');
const BAD = /undefined|NaN|\[object Object\]/;

/* scripts en línea, en el orden del documento */
const scripts = [];
HTML.replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g, (m, attrs, body) => { if (!/\bsrc=/.test(attrs || '')) scripts.push(body); return m; });
function find(marker) {
  const s = scripts.find(x => x.indexOf(marker) !== -1);
  if (!s) throw new Error('no se encontró el script con «' + marker + '»');
  return s;
}

/* ---------------------------------------------------------------------------
   Entorno aislado: navegador mínimo con temporizadores y almacenamiento falsos
   --------------------------------------------------------------------------- */
function fakeCanvas(w, h) {
  const ctx2d = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  return { className: '', setAttribute() {}, getContext: () => ctx2d, clientWidth: w, clientHeight: h, width: 0, height: 0 };
}
function makeSandbox(extra) {
  const store = {}, raf = [];
  const sb = {
    console: { log() {}, error() {}, warn() {} },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    requestAnimationFrame: f => { raf.push(f); return raf.length; }, cancelAnimationFrame() {},
    performance: { now: () => Date.now() },
    localStorage: { getItem: k => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    document: { hidden: false, addEventListener() {}, removeEventListener() {}, createElement: () => fakeCanvas(1280, 800) },
    addEventListener() {}, removeEventListener() {},
    matchMedia: () => ({ matches: false }),
    devicePixelRatio: 1,
    __store: store, __raf: raf
  };
  Object.assign(sb, extra || {});
  sb.window = sb; sb.self = sb;
  return vm.createContext(sb);
}
const MARKERS = ['window.IMG', 'var ROUTES', 'function href(', 'var DS = (function', 'DEMOS.dental =', 'DEMOS.restaurante =', 'DEMOS.barberia =', 'DEMOS.gimnasio =', 'var DSBG'];
function load(c, opts) {
  opts = opts || {};
  (opts.only || MARKERS).forEach(m => { if (opts.skipImages && m === 'window.IMG') return; vm.runInContext(find(m), c, { filename: m }); });
  return c;
}

/* DOM falso para montar demos: cada elemento guarda su último innerHTML */
function dom() {
  const all = [];
  function El() {
    const e = {
      innerHTML: '', textContent: '', value: '', checked: false, hidden: false, disabled: false, className: '', clientWidth: 1200, _l: {}, isConnected: true,
      style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      setAttribute() {}, getAttribute() { return null; }, hasAttribute() { return false; }, removeAttribute() {},
      addEventListener(t, f) { (e._l[t] = e._l[t] || []).push(f); }, removeEventListener() {},
      querySelector() { return El(); }, querySelectorAll() { return []; }, focus() {}, closest() { return El(); }, contains() { return true; },
      insertBefore() {}, appendChild() {}, scrollIntoView() {},
      getBoundingClientRect() { return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }; }
    };
    e.parentNode = { classList: e.classList };
    all.push(e);
    return e;
  }
  return { El, html: () => stripImg(all.map(x => x.innerHTML + '\n' + x.textContent).join('\n')) };
}
function click(root, act, v) {
  const btn = { getAttribute: n => (n === 'data-act' ? act : n === 'data-v' ? (v === undefined ? null : v) : null), hasAttribute: () => false, disabled: false };
  const ev = { target: { closest: sel => (sel.indexOf('data-act') !== -1 ? btn : null) }, preventDefault() {} };
  (root._l.click || []).forEach(f => f(ev));
}
function type(root, id, value, checked) {
  const target = { id, value, checked: !!checked, getAttribute: () => null, closest: () => ({ querySelector: () => null }) };
  (root._l.input || []).forEach(f => f({ target }));
  (root._l.change || []).forEach(f => f({ target }));
}
/* último botón habilitado de una acción: se analiza la etiqueta completa, no un fragmento */
function enabled(d, act) {
  const tags = [...d.html().matchAll(/<button\b[^>]*>/g)].map(m => m[0])
    .filter(tag => tag.indexOf('data-act="' + act + '"') !== -1 && !/\sdisabled(\s|>|=)/.test(tag));
  const last = tags.length ? tags[tags.length - 1].match(/data-v="([^"]+)"/) : null;
  return last ? last[1] : null;
}

/* =========================================================================== */
section('1 · Estructura y seguridad del HTML');

test('declara UTF-8 al principio del documento', () => ok(/^\s*<meta charset="utf-8">/i.test(HTML), 'falta <meta charset="utf-8"> al inicio'));
test('etiquetas <style> y <script> equilibradas', () => {
  const c = re => (HTML.match(re) || []).length;
  ok(c(/<style>/g) === c(/<\/style>/g), 'style desequilibrado');
  ok(c(/<script[\s>]/g) === c(/<\/script>/g), 'script desequilibrado');
});
test('scripts externos solo por HTTPS, desde jsDelivr y con versión fija', () => {
  const srcs = [...HTML.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]);
  ok(srcs.length > 0, 'no hay scripts externos');
  srcs.forEach(s => ok(/^https:\/\/cdn\.jsdelivr\.net\/npm\/[a-z0-9-]+@\d+\.\d+\.\d+\//.test(s), 'script no permitido o sin versión fija: ' + s));
});
test('hojas de estilo externas solo de Google Fonts por HTTPS', () => {
  [...HTML.matchAll(/<link[^>]+href="([^"]+)"/g)].forEach(m => ok(/^https:\/\/fonts\.googleapis\.com\//.test(m[1]), 'hoja no permitida: ' + m[1]));
});
test('ningún recurso cargado por http:// sin cifrar', () => ok(!/(src|href)="http:\/\//.test(HTML), 'hay recursos http://'));
test('sin eval, new Function ni document.write', () => scripts.forEach((s, i) => ok(!/\beval\s*\(|new Function\s*\(|document\.write\s*\(/.test(s), 'script ' + i + ' ejecuta código dinámico')));
test('sin manejadores de eventos en línea (onclick=…)', () => ok(!/\son(click|load|error|submit|mouseover|focus|input|change)\s*=\s*["']/i.test(stripImg(HTML)), 'hay manejadores en línea'));
test('todos los scripts compilan', () => scripts.forEach((s, i) => { try { new vm.Script(s, { filename: 'script-' + i }); } catch (e) { throw new Error('script ' + i + ': ' + e.message); } }));
test('build.sh reproduce exactamente prototipo.html', () => {
  const sh = read('fuente/build.sh'), m = sh.match(/ORDER=\(([\s\S]*?)\n\)/);
  ok(m, 'no se reconoce ORDER en build.sh');
  const order = m[1].split('\n').map(l => l.replace(/#.*/, '')).join(' ').split(/\s+/).filter(Boolean);
  const out = order.map(p => read('fuente/' + p + '.html')).join('');
  ok(out === HTML, 'el archivo generado no coincide (' + out.length + ' frente a ' + HTML.length + ' caracteres)');
});

/* =========================================================================== */
section('2 · Plantillas y rutas');
const G = load(makeSandbox());

test('las 4 páginas se generan en ES y EN sin valores vacíos', () => ['es', 'en'].forEach(l => ['home', 'work', 'services', 'contact'].forEach(k => {
  const h = stripImg(G.PAGES[k](l));
  ok(h.length > 1000, l + '/' + k + ' casi vacía');
  ok(!BAD.test(h), l + '/' + k + ' contiene «' + (h.match(BAD) || [])[0] + '»');
})));
test('cada enlace interno apunta a una ruta que existe', () => ['es', 'en'].forEach(l => ['home', 'work', 'services', 'contact'].forEach(k => {
  const h = G.PAGES[k](l) + G.Header(l, k, '') + G.Footer(l, k, '');
  [...h.matchAll(/href="#\/([^"]*)"/g)].forEach(m => {
    const parts = m[1].split('/').filter(Boolean), lang = parts[0], slug = parts[1] || '', sub = parts[2] || '';
    ok(lang === 'es' || lang === 'en', 'idioma inválido en #/' + m[1]);
    const key = Object.keys(G.ROUTES[lang]).find(x => G.ROUTES[lang][x] === slug);
    ok(key !== undefined, 'ruta inexistente #/' + m[1]);
    if (key === 'demo') ok(Object.prototype.hasOwnProperty.call(G.DEMOS, sub), 'demo inexistente #/' + m[1]);
  });
})));
test('cada tarjeta de sector tiene demo y foto', () => G.SECTORS.forEach(s => {
  ok(G.DEMOS[s.id] && typeof G.DEMOS[s.id].mount === 'function', 'sin demo: ' + s.id);
  ok(!s.img || G.IMG[s.img], 'sin foto: ' + s.id);
}));

/* =========================================================================== */
section('3 · Demos: flujos, entradas maliciosas y datos corruptos');
const XSS = '<img src=x onerror=alert(1)>Ana <script>alert(2)</script> Pérez';
const PHONE = '300 123 4567';
function mount(ctx, id, l) { const d = dom(); const root = d.El(); const off = ctx.DEMOS[id].mount(root, l); return { d, root, off }; }
function clean(d, label) {
  const h = d.html();
  ok(!BAD.test(h), label + ': contiene «' + (h.match(BAD) || [])[0] + '»');
  ok(!/<img src=x|<script>alert/i.test(h), label + ': texto del usuario sin escapar');
}

test('dental: cita completa con nombre malicioso, escapado en pantalla', () => ['es', 'en'].forEach(l => {
  const { d, root, off } = mount(G, 'dental', l);
  click(root, 'treat', '0'); click(root, 'next'); click(root, 'pro', '0'); click(root, 'next');
  let slot = null;
  for (let i = 0; i < 10 && !slot; i++) { click(root, 'day', String(i)); slot = enabled(d, 'slot'); }
  ok(slot, 'no hay huecos libres en 10 días');
  click(root, 'slot', slot); click(root, 'next');
  type(root, 'dxName', XSS); type(root, 'dxPhone', PHONE); type(root, 'dxConsent', '', true);
  click(root, 'confirm');
  ok(/AUR-[A-Z0-9]{4}/.test(d.html()), 'la cita no se confirmó');
  clean(d, 'dental/' + l);
  if (typeof off === 'function') off();
}));
test('restaurante: pedido y reserva con datos maliciosos, escapados', () => ['es', 'en'].forEach(l => {
  const { d, root, off } = mount(G, 'restaurante', l);
  click(root, 'inc', 'spag'); click(root, 'inc', 'spag'); click(root, 'dec', 'spag'); click(root, 'mode', 'dom');
  type(root, 'rtName', XSS); type(root, 'rtPhone', PHONE); type(root, 'rtAddr', XSS); type(root, 'rtNotes', XSS);
  click(root, 'checkout');
  ok(/TN-[A-Z0-9]{4}/.test(d.html()), 'el pedido no se generó');
  let t = null;
  for (let i = 0; i < 10 && !t; i++) { click(root, 'rday', String(i)); t = enabled(d, 'rtime'); }
  ok(t, 'no hay horas de reserva');
  click(root, 'rtime', t);
  type(root, 'rsName', XSS); type(root, 'rsPhone', PHONE); type(root, 'rsOcc', '__proto__');
  click(root, 'reserve');
  clean(d, 'restaurante/' + l);
  if (typeof off === 'function') off();
}));
test('barbería: reserva con nombre malicioso, escapado', () => ['es', 'en'].forEach(l => {
  const { d, root, off } = mount(G, 'barberia', l);
  click(root, 'sv', 'fade'); click(root, 'barber', '0');
  let t = null;
  for (let i = 0; i < 7 && t === null; i++) { click(root, 'day', String(i)); t = enabled(d, 'time'); }
  ok(t !== null, 'no hay horas libres');
  click(root, 'time', t);
  type(root, 'bbName', XSS); type(root, 'bbPhone', PHONE);
  click(root, 'confirm');
  ok(/CN-[A-Z0-9]{4}/.test(d.html()), 'la silla no se reservó');
  clean(d, 'barbería/' + l);
  if (typeof off === 'function') off();
}));
test('gimnasio: reservar y cancelar clase, planes y prueba sin romperse', () => ['es', 'en'].forEach(l => {
  const { d, root, off } = mount(G, 'gimnasio', l);
  click(root, 'type', 'all');
  let key = null;
  for (let i = 0; i < 7 && !key; i++) { click(root, 'day', String(i)); key = enabled(d, 'book'); }
  if (key) { click(root, 'book', key); ok(/Reservada|Booked/.test(d.html()), 'la clase no se reservó'); click(root, 'book', key); }
  click(root, 'term', '12'); click(root, 'plan', 'duo'); click(root, 'goal', 'peso'); click(root, 'ttype', 'yoga'); click(root, 'tday', '2');
  type(root, 'fjName', XSS); type(root, 'fjPhone', PHONE); click(root, 'trial');
  clean(d, 'gimnasio/' + l);
  if (typeof off === 'function') off();
}));

test('fuzz: ninguna acción con valores inválidos rompe una demo', () => {
  const VALUES = [undefined, '', '0', '1', '-1', '2.5', '999', 'abc', '__proto__', 'constructor', 'toString', '<b>x</b>', 'a|b', 'NaN'];
  Object.keys(G.DEMOS).forEach(id => {
    const acts = [...new Set([...find('DEMOS.' + id + ' =').matchAll(/act === '([a-z]+)'/g)].map(m => m[1]))];
    ok(acts.length > 3, id + ': no se detectaron acciones');
    ['es', 'en'].forEach(l => {
      const { d, root, off } = mount(G, id, l);
      acts.forEach(a => VALUES.forEach(v => {
        try { click(root, a, v); }
        catch (e) { throw new Error(id + '/' + l + ' · acción «' + a + '» con ' + JSON.stringify(v) + ': ' + e.message); }
      }));
      clean(d, id + '/' + l + ' tras fuzz');
      if (typeof off === 'function') off();
    });
  });
});

test('datos guardados corruptos o manipulados no rompen las demos', () => {
  const junk = ['{no es json', '"texto"', '42', 'null', '[1,2,3]', '{"__proto__":{"n":1}}', '{"spag":"999999","hack":5}', '[{"code":"<script>x</script>"}]'];
  const keys = ['aurora.citas', 'trattoria.cart', 'navaja.reservas', 'navaja.sellos', 'forja.clases'];
  Object.keys(G.DEMOS).forEach(id => junk.forEach(j => {
    Object.keys(G.__store).forEach(k => delete G.__store[k]);
    keys.forEach(k => { G.__store['demo.' + k] = j; });
    const { d, root, off } = mount(G, id, 'es');
    click(root, 'cancel', '0'); click(root, 'book', 'x|y'); click(root, 'inc', 'spag');
    clean(d, id + ' con almacenamiento ' + j);
    if (typeof off === 'function') off();
  }));
  Object.keys(G.__store).forEach(k => delete G.__store[k]);
});

test('almacenamiento bloqueado (modo privado) no rompe las demos', () => {
  const thrower = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); }, removeItem() { throw new Error('bloqueado'); } };
  const c = load(makeSandbox({ localStorage: thrower }));
  Object.keys(c.DEMOS).forEach(id => {
    const { d, root, off } = mount(c, id, 'es');
    click(root, 'inc', 'spag'); click(root, 'cancel', '0');
    clean(d, id + ' sin almacenamiento');
    if (typeof off === 'function') off();
  });
});

test('sin fotos incrustadas, páginas y demos siguen funcionando', () => {
  const c = load(makeSandbox(), { skipImages: true });
  ['es', 'en'].forEach(l => ['home', 'work'].forEach(k => ok(!BAD.test(c.PAGES[k](l)), l + '/' + k + ' sin fotos')));
  Object.keys(c.DEMOS).forEach(id => { const { d, off } = mount(c, id, 'en'); clean(d, id + ' sin fotos'); if (typeof off === 'function') off(); });
});

/* =========================================================================== */
section('4 · Fondos vivos, enrutado y red de seguridad');

test('fondos vivos: 4 escenas, con y sin movimiento, a varios tamaños (incluido 0×0)', () => {
  ['dental', 'restaurante', 'barberia', 'gimnasio'].forEach(id => [true, false].forEach(on => [[1280, 800], [390, 844], [0, 0]].forEach(([w, h]) => {
    const c = load(makeSandbox({ document: { hidden: false, addEventListener() {}, removeEventListener() {}, createElement: () => fakeCanvas(w, h) } }), { only: ['var DSBG'] });
    const root = { firstChild: null, insertBefore() {}, classList: { add() {} } };
    let off;
    try {
      off = c.DSBG.mount(root, id, () => on);
      for (let i = 0, t = 0; i < 90 && c.__raf.length; i++) c.__raf.splice(0).forEach(f => f(t += 16.7));
    } catch (e) { throw new Error(id + ' ' + w + '×' + h + ' movimiento=' + on + ': ' + e.message); }
    ok(typeof off === 'function', id + ': sin función de limpieza');
    off();
  })));
});
test('un oficio desconocido no monta fondo', () => {
  const c = load(makeSandbox(), { only: ['var DSBG'] });
  ok(c.DSBG.mount({ insertBefore() {}, classList: { add() {} } }, '__proto__', () => true) === null, 'debería devolver null');
});

const RT = find('MOTION.init(');
const MO = find('var MOTION = (function');
test('las demos se buscan con hasOwnProperty (evita #/es/demo/__proto__)', () => {
  ok(/hasOwnProperty\.call\(DEMOS, r\.sub\)/.test(RT), 'búsqueda insegura de DEMOS');
  ok(!/r\.sub in DEMOS/.test(RT), 'queda «r.sub in DEMOS»');
});
test('generar una página y montar una demo están protegidos con try/catch', () => {
  ok(/try \{ page\.innerHTML/.test(RT), 'la generación de página no está protegida');
  ok(/try \{ offDemo = dm\.mount/.test(RT), 'el montaje de la demo no está protegido');
  ok(/try \{ offBg = DSBG\.mount/.test(RT), 'el fondo animado no está protegido');
  ok(/dRoot\.classList\.contains\('ds'\)/.test(RT), 'el fondo vivo no reconoce la raíz de la demo (.ds es el propio #demoRoot)');
});
test('mostrar contenido no depende de IntersectionObserver', () => ok(!/new IntersectionObserver/.test(MO), 'aún usa IntersectionObserver para revelar'));
test('el movimiento revela todo ante un error, y a los 5 s pase lo que pase', () => {
  ok(/function revealAll/.test(MO), 'falta revealAll');
  ok(/addEventListener\('error'/.test(MO), 'no escucha errores globales');
  ok(/checkReveal\(true\)/.test(MO), 'falta el barrido de seguridad');
  ok(/sr\.height < 2/.test(MO), 'sin salvaguarda para un contenedor sin tamaño');
  ok(/catch \(err\) \{ fail\(err\); \}/.test(MO), 'run/update sin protección');
});
test('cada coreografía declarada tiene estilos', () => {
  const m = MO.match(/var STEP = \{([\s\S]*?)\};/);
  ok(m, 'no se encontró STEP');
  const kinds = [...m[1].matchAll(/([a-z]+):/g)].map(x => x[1]).filter(k => k !== 'count' && k !== 'fade');
  kinds.forEach(k => ok(HTML.indexOf('.rv-' + k) !== -1, 'sin CSS para la coreografía «' + k + '»'));
});

/* =========================================================================== */
section('5 · Estilos: colisiones y contraste');
const styles = [...HTML.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1].replace(/\/\*[\s\S]*?\*\//g, ''));

test('ninguna regla del portafolio alcanza a las demos por un nombre de clase compartido', () => {
  const dsSrc = ['var DS = (function', 'DEMOS.dental =', 'DEMOS.restaurante =', 'DEMOS.barberia =', 'DEMOS.gimnasio ='].map(find).join('\n');
  const used = new Set(['dm', 'ds']);
  [...dsSrc.matchAll(/class="([^"]+)"/g)].forEach(m => m[1].split(/\s+/).forEach(c => { if (/^[a-zA-Z][\w-]*$/.test(c)) used.add(c); }));
  const hits = [];
  [styles[0], styles[2]].forEach(css => css.split('}').forEach(chunk => {
    const parts = chunk.split('{');
    if (parts.length < 2) return;
    const sel = parts[parts.length - 2];
    if (!sel || sel.indexOf('@') !== -1) return;
    sel.split(',').forEach(s => {
      const classes = (s.match(/\.[a-zA-Z][\w-]*/g) || []).map(c => c.slice(1));
      if (classes.length && classes.every(c => used.has(c))) hits.push(s.trim());
    });
  }));
  ok(!hits.length, 'reglas que se filtran a las demos: ' + hits.join(' | '));
});

test('contraste AA (4,5:1) en el portafolio y en las cuatro paletas', () => {
  const lum = hex => {
    const c = hex.replace('#', '');
    const v = [0, 2, 4].map(i => parseInt(c.substr(i, 2), 16) / 255).map(x => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const vars = sel => {
    const m = HTML.match(new RegExp(sel.replace(/\./g, '\\.') + '\\{([^}]*)\\}'));
    ok(m, 'sin paleta ' + sel);
    const o = {};
    m[1].replace(/--([\w-]+):\s*(#[0-9A-Fa-f]{6})/g, (_, k, v) => { o[k] = v; });
    return o;
  };
  const checks = [];
  ['.ds-dental', '.ds-rest', '.ds-barber', '.ds-gym'].forEach(p => {
    const v = vars(p);
    [['c-fg', 'c-bg'], ['c-muted', 'c-bg'], ['c-acc-ink', 'c-acc'], ['c-acc-t', 'c-bg'], ['c-fg', 'c-surf'], ['c-muted', 'c-surf']]
      .forEach(([a, b]) => checks.push([p + ' ' + a + '/' + b, ratio(v[a], v[b])]));
  });
  const r = vars(':root');
  [['fg', 'bg'], ['fg-2', 'bg'], ['fg-2', 's1'], ['accent-ink', 'accent']].forEach(([a, b]) => checks.push([':root ' + a + '/' + b, ratio(r[a], r[b])]));
  const low = checks.filter(c => !(c[1] >= 4.5)).map(c => c[0] + ' = ' + c[1].toFixed(2));
  ok(!low.length, 'por debajo de 4,5:1 → ' + low.join(', '));
});

console.log('\n' + pass + ' pruebas correctas · ' + fail + ' con fallos');
process.exit(fail ? 1 : 0);
