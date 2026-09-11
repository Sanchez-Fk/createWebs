/* Demos: flujos completos, entradas maliciosas, datos guardados corruptos y fuzzing. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_IDS, click, clean, demoFile, enabled, loadDemos, makeSandbox, mount, read, type } from '../helpers/sandbox.mjs';

const XSS = '<img src=x onerror=alert(1)>Ana <script>alert(2)</script> Pérez';
const PHONE = '300 123 4567';
const LANGS = ['es', 'en'];
const G = loadDemos(makeSandbox());
const off = (m) => { if (typeof m.off === 'function') m.off(); };

test('las cuatro demos se registran con una función mount', () => {
  assert.deepEqual(Object.keys(G.DEMOS), DEMO_IDS);
  DEMO_IDS.forEach((id) => assert.equal(typeof G.DEMOS[id].mount, 'function', id));
});

test('dental: cita completa con nombre malicioso, escapado en pantalla', () => {
  for (const l of LANGS) {
    const m = mount(G, 'dental', l), { d, root } = m;
    click(root, 'treat', '0'); click(root, 'next'); click(root, 'pro', '0'); click(root, 'next');
    let slot = null;
    for (let i = 0; i < 10 && !slot; i++) { click(root, 'day', String(i)); slot = enabled(d, 'slot'); }
    assert.ok(slot, 'no hay huecos libres en 10 días');
    click(root, 'slot', slot); click(root, 'next');
    type(root, 'dxName', XSS); type(root, 'dxPhone', PHONE); type(root, 'dxConsent', '', true);
    click(root, 'confirm');
    assert.match(d.html(), /AUR-[A-Z0-9]{4}/, 'la cita no se confirmó');
    clean(d, 'dental/' + l);
    off(m);
  }
});

test('restaurante: pedido y reserva con datos maliciosos, escapados', () => {
  for (const l of LANGS) {
    const m = mount(G, 'restaurante', l), { d, root } = m;
    click(root, 'inc', 'spag'); click(root, 'inc', 'spag'); click(root, 'dec', 'spag'); click(root, 'mode', 'dom');
    type(root, 'rtName', XSS); type(root, 'rtPhone', PHONE); type(root, 'rtAddr', XSS); type(root, 'rtNotes', XSS);
    click(root, 'checkout');
    assert.match(d.html(), /TN-[A-Z0-9]{4}/, 'el pedido no se generó');
    let t = null;
    for (let i = 0; i < 10 && !t; i++) { click(root, 'rday', String(i)); t = enabled(d, 'rtime'); }
    assert.ok(t, 'no hay horas de reserva');
    click(root, 'rtime', t);
    type(root, 'rsName', XSS); type(root, 'rsPhone', PHONE); type(root, 'rsOcc', '__proto__');
    click(root, 'reserve');
    clean(d, 'restaurante/' + l);
    off(m);
  }
});

test('barbería: reserva con nombre malicioso, escapado', () => {
  for (const l of LANGS) {
    const m = mount(G, 'barberia', l), { d, root } = m;
    click(root, 'sv', 'fade'); click(root, 'barber', '0');
    let t = null;
    for (let i = 0; i < 7 && t === null; i++) { click(root, 'day', String(i)); t = enabled(d, 'time'); }
    assert.notEqual(t, null, 'no hay horas libres');
    click(root, 'time', t);
    type(root, 'bbName', XSS); type(root, 'bbPhone', PHONE);
    click(root, 'confirm');
    assert.match(d.html(), /CN-[A-Z0-9]{4}/, 'la silla no se reservó');
    clean(d, 'barbería/' + l);
    off(m);
  }
});

test('gimnasio: reservar y cancelar clase, planes y prueba sin romperse', () => {
  for (const l of LANGS) {
    const m = mount(G, 'gimnasio', l), { d, root } = m;
    click(root, 'type', 'all');
    let key = null;
    for (let i = 0; i < 7 && !key; i++) { click(root, 'day', String(i)); key = enabled(d, 'book'); }
    if (key) {
      click(root, 'book', key);
      assert.match(d.html(), /Reservada|Booked/, 'la clase no se reservó');
      click(root, 'book', key);
    }
    click(root, 'term', '12'); click(root, 'plan', 'duo'); click(root, 'goal', 'peso'); click(root, 'ttype', 'yoga'); click(root, 'tday', '2');
    type(root, 'fjName', XSS); type(root, 'fjPhone', PHONE); click(root, 'trial');
    clean(d, 'gimnasio/' + l);
    off(m);
  }
});

test('fuzz: ninguna acción con valores inválidos rompe una demo', () => {
  const VALUES = [undefined, '', '0', '1', '-1', '2.5', '999', 'abc', '__proto__', 'constructor', 'toString', '<b>x</b>', 'a|b', 'NaN'];
  for (const id of DEMO_IDS) {
    const acts = [...new Set([...read(demoFile(id)).matchAll(/act === '([a-z]+)'/g)].map((x) => x[1]))];
    assert.ok(acts.length > 3, id + ': no se detectaron acciones');
    for (const l of LANGS) {
      const m = mount(G, id, l);
      for (const a of acts) {
        for (const v of VALUES) {
          try { click(m.root, a, v); }
          catch (e) { throw new Error(id + '/' + l + ' · acción «' + a + '» con ' + JSON.stringify(v) + ': ' + e.message); }
        }
      }
      clean(m.d, id + '/' + l + ' tras fuzz');
      off(m);
    }
  }
});

test('datos guardados corruptos o manipulados no rompen las demos', () => {
  const junk = ['{no es json', '"texto"', '42', 'null', '[1,2,3]', '{"__proto__":{"n":1}}', '{"spag":"999999","hack":5}', '[{"code":"<script>x</script>"}]'];
  const keys = ['aurora.citas', 'trattoria.cart', 'navaja.reservas', 'navaja.sellos', 'forja.clases'];
  const reset = () => Object.keys(G.__store).forEach((k) => delete G.__store[k]);
  for (const id of DEMO_IDS) {
    for (const j of junk) {
      reset();
      keys.forEach((k) => { G.__store['demo.' + k] = j; });
      const m = mount(G, id, 'es');
      click(m.root, 'cancel', '0'); click(m.root, 'book', 'x|y'); click(m.root, 'inc', 'spag');
      clean(m.d, id + ' con almacenamiento ' + j);
      off(m);
    }
  }
  reset();
});

test('almacenamiento bloqueado (modo privado) no rompe las demos', () => {
  const thrower = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); }, removeItem() { throw new Error('bloqueado'); } };
  const c = loadDemos(makeSandbox({ localStorage: thrower }));
  for (const id of DEMO_IDS) {
    const m = mount(c, id, 'es');
    click(m.root, 'inc', 'spag'); click(m.root, 'cancel', '0');
    clean(m.d, id + ' sin almacenamiento');
    off(m);
  }
});

test('sin fotos, las demos siguen funcionando', () => {
  const c = loadDemos(makeSandbox(), { images: false });
  for (const id of DEMO_IDS) {
    const m = mount(c, id, 'en');
    clean(m.d, id + ' sin fotos');
    off(m);
  }
});
