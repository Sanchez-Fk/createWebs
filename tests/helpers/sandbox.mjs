/* ===========================================================================
   ENTORNO DE PRUEBAS — ejecuta los módulos del cliente en un contexto aislado
   con un navegador mínimo (temporizadores, almacenamiento y DOM falsos).
   Cada módulo ES se convierte en un script estricto equivalente: se quitan los
   import/export y cada export pasa a ser una variable global del contexto.
   =========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
export const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

export const BAD = /undefined|NaN|\[object Object\]/;
export const DEMO_IDS = ['dental', 'restaurante', 'barberia', 'gimnasio'];
export const demoFile = (id) => 'src/scripts/demos/' + id + '.js';

/* archivos .js bajo una carpeta, con rutas relativas a la raíz y separador / */
export function jsFiles(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.js'))
    .map((f) => (dir + '/' + f).replace(/\\/g, '/'))
    .sort();
}

export function asScript(src) {
  return "'use strict';\n" + src
    .replace(/^import\s+(?:\w+|\{[^}]*\})\s+from\s+'[^']+';$/gm, '')
    .replace(/^export\s+\{[^}]*\};$/gm, '')
    .replace(/^export\s+(?:const|let|var)\s+/gm, 'var ')
    .replace(/^export\s+(async\s+)?function\s+/gm, '$1function ');
}

export function fakeCanvas(w, h) {
  const ctx2d = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  return { className: '', setAttribute() {}, getContext: () => ctx2d, clientWidth: w, clientHeight: h, width: 0, height: 0 };
}

export function makeSandbox(extra) {
  const store = {}, raf = [];
  const sb = {
    console: { log() {}, error() {}, warn() {} },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    requestAnimationFrame: (f) => { raf.push(f); return raf.length; }, cancelAnimationFrame() {},
    performance: { now: () => Date.now() },
    localStorage: {
      getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; }
    },
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

export function run(ctx, rel) {
  vm.runInContext(asScript(read(rel)), ctx, { filename: rel });
  return ctx;
}

/* fotos → kit → cuatro demos → registro, en el mismo orden que los imports */
export function loadDemos(ctx, { images = true } = {}) {
  if (images) run(ctx, 'src/data/images.js');
  else vm.runInContext('var IMG = {}, IMG_SRCSET = {}, CREDITS = {};', ctx);
  run(ctx, 'src/scripts/demos/kit.js');
  DEMO_IDS.forEach((id) => run(ctx, demoFile(id)));
  return run(ctx, 'src/scripts/demos/index.js');
}

/* DOM falso para montar demos: cada elemento guarda su último innerHTML */
export function dom() {
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
  return { El, html: () => all.map((x) => x.innerHTML + '\n' + x.textContent).join('\n') };
}

export function click(root, act, v) {
  const btn = { getAttribute: (n) => (n === 'data-act' ? act : n === 'data-v' ? (v === undefined ? null : v) : null), hasAttribute: () => false, disabled: false };
  const ev = { target: { closest: (sel) => (sel.indexOf('data-act') !== -1 ? btn : null) }, preventDefault() {} };
  (root._l.click || []).forEach((f) => f(ev));
}

export function type(root, id, value, checked) {
  const target = { id, value, checked: !!checked, getAttribute: () => null, closest: () => ({ querySelector: () => null }) };
  (root._l.input || []).forEach((f) => f({ target }));
  (root._l.change || []).forEach((f) => f({ target }));
}

/* último botón habilitado de una acción: se analiza la etiqueta completa, no un fragmento */
export function enabled(d, act) {
  const tags = [...d.html().matchAll(/<button\b[^>]*>/g)].map((m) => m[0])
    .filter((tag) => tag.indexOf('data-act="' + act + '"') !== -1 && !/\sdisabled(\s|>|=)/.test(tag));
  const last = tags.length ? tags[tags.length - 1].match(/data-v="([^"]+)"/) : null;
  return last ? last[1] : null;
}

export function mount(ctx, id, l) {
  const d = dom();
  const root = d.El();
  const off = ctx.DEMOS[id].mount(root, l);
  return { d, root, off };
}

export function clean(d, label) {
  const h = d.html();
  const bad = h.match(BAD);
  if (bad) throw new Error(label + ': contiene «' + bad[0] + '»');
  if (/<img src=x|<script>alert/i.test(h)) throw new Error(label + ': texto del usuario sin escapar');
}
