/* Resultado del build (dist/): rutas, SEO, enlaces, seguridad y pesos.
   Requiere ejecutar antes «npm run build». */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BAD, ROOT, read } from '../helpers/sandbox.mjs';

const DIST = path.join(ROOT, 'dist');
if (!fs.existsSync(path.join(DIST, 'es', 'index.html'))) {
  throw new Error('No hay build en dist/: ejecuta «npm run build» antes de «npm run test:build».');
}

const SECTORS = ['dental', 'restaurante', 'barberia', 'gimnasio'];
const SLUGS = { es: ['', 'proyectos/', 'servicios/', 'contacto/'], en: ['', 'work/', 'services/', 'contact/'] };
const PLACEHOLDERS = ['#wa', '#mail', '#gh', '#li', '#ig'];

/* cada página con su gemela en el otro idioma */
const PAGES = [];
for (const lang of ['es', 'en']) {
  const other = lang === 'es' ? 'en' : 'es';
  SLUGS[lang].forEach((slug, i) => PAGES.push({ lang, url: '/' + lang + '/' + slug, twin: '/' + other + '/' + SLUGS[other][i] }));
  SECTORS.forEach((id) => PAGES.push({ lang, url: '/' + lang + '/demo/' + id + '/', twin: '/' + other + '/demo/' + id + '/', demo: id }));
}

const fileOf = (url) => path.join(DIST, url.replace(/[?#].*$/, '').replace(/\/$/, '/index.html'));
const html = (url) => fs.readFileSync(fileOf(url), 'utf8');
const all = (s, re) => [...s.matchAll(re)].map((m) => m[1]);
const pathOf = (abs) => new URL(abs).pathname;
const distFiles = (dir, ext) => fs.readdirSync(path.join(DIST, dir)).filter((f) => f.endsWith(ext)).map((f) => path.join(DIST, dir, f));

test('se generan las 16 páginas, la 404, el sitemap, robots.txt y la redirección de la raíz', () => {
  assert.equal(PAGES.length, 16);
  for (const p of PAGES) assert.ok(fs.existsSync(fileOf(p.url)), 'falta ' + p.url);
  for (const f of ['404.html', 'sitemap.xml', 'robots.txt', 'favicon.svg', 'index.html']) assert.ok(fs.existsSync(path.join(DIST, f)), 'falta ' + f);
  assert.match(fs.readFileSync(path.join(DIST, 'index.html'), 'utf8'), /url=\/es\//, 'la raíz no redirige a /es/');
});

test('cada página declara UTF-8, idioma, título y descripción únicos', () => {
  const titles = new Set();
  for (const p of PAGES) {
    const h = html(p.url);
    assert.match(h, /^<!DOCTYPE html><html lang="(es|en)"><head><meta charset="utf-8">/i, p.url + ': cabecera del documento');
    assert.ok(h.includes('<html lang="' + p.lang + '"'), p.url + ': idioma incorrecto');
    const title = (h.match(/<title>([^<]+)<\/title>/) || [])[1];
    assert.ok(title && !titles.has(title), p.url + ': título vacío o repetido');
    titles.add(title);
    assert.match(h, /<meta name="description" content="[^"]{40,}">/, p.url + ': sin descripción');
    assert.doesNotMatch(h, /user-scalable=no|maximum-scale/, p.url + ': el zoom debe estar siempre permitido');
  }
});

test('canonical y hreflang enlazan cada página con su gemela ES ⇄ EN', () => {
  for (const p of PAGES) {
    const h = html(p.url);
    const alt = (lang) => (h.match(new RegExp('<link rel="alternate" hreflang="' + lang + '" href="([^"]+)">')) || [])[1];
    const canonical = (h.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
    assert.ok(canonical, p.url + ': sin canonical');
    assert.equal(pathOf(canonical), p.url);
    assert.equal(pathOf(alt(p.lang)), p.url, p.url + ': hreflang propio');
    assert.equal(pathOf(alt(p.lang === 'es' ? 'en' : 'es')), p.twin, p.url + ': hreflang gemelo');
    assert.equal(pathOf(alt('x-default')), p.lang === 'es' ? p.url : p.twin, p.url + ': x-default');
  }
});

test('ningún texto muestra undefined, NaN ni [object Object]', () => {
  for (const p of PAGES) {
    const bad = html(p.url).match(BAD);
    assert.equal(bad, null, p.url + ': contiene «' + (bad || [])[0] + '»');
  }
});

test('cada enlace y recurso interno existe en el build', () => {
  const missing = new Set();
  for (const p of [...PAGES, { url: '/404.html' }]) {
    const h = p.url === '/404.html' ? fs.readFileSync(path.join(DIST, '404.html'), 'utf8') : html(p.url);
    const refs = [...all(h, /\s(?:href|src)="([^"]*)"/g), ...all(h, /\ssrcset="([^"]*)"/g).flatMap((s) => s.split(',').map((x) => x.trim().split(/\s+/)[0]))];
    for (const ref of refs) {
      if (/^https?:\/\//.test(ref)) continue;                          /* canonical, hreflang, og:url */
      if (ref.startsWith('#')) { assert.ok(PLACEHOLDERS.includes(ref), p.url + ': ancla desconocida ' + ref); continue; }
      assert.ok(ref.startsWith('/'), p.url + ': ruta relativa ' + ref);
      if (!fs.existsSync(fileOf(ref))) missing.add(p.url + ' → ' + ref);
    }
  }
  for (const css of distFiles('_astro', '.css')) {
    for (const ref of all(fs.readFileSync(css, 'utf8'), /url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      if (ref.startsWith('data:') || ref.startsWith('#')) continue;
      assert.ok(!/^https?:/.test(ref), path.basename(css) + ': recurso externo ' + ref);
      if (ref.startsWith('/') && !fs.existsSync(fileOf(ref))) missing.add(path.basename(css) + ' → ' + ref);
    }
  }
  assert.deepEqual([...missing], []);
});

test('compatible con la CSP: sin scripts en línea, manejadores ni recursos de terceros', () => {
  for (const p of PAGES) {
    const h = html(p.url);
    for (const tag of all(h, /(<script\b[^>]*>)/g)) {
      assert.ok(/^<script type="module" src="\/_astro\/[^"]+\.js"><\/?/.test(tag + '</') || tag === '<script type="application/ld+json">', p.url + ': script no permitido ' + tag);
    }
    assert.doesNotMatch(h, /\son[a-z]+\s*=\s*["']/i, p.url + ': manejador de eventos en línea');
    assert.doesNotMatch(h, /<(?:script|img|iframe)\b[^>]*\ssrc="https?:/i, p.url + ': recurso de otro dominio');
    assert.doesNotMatch(h, /<link\b[^>]*rel="(?:stylesheet|preload|modulepreload)"[^>]*href="https?:/i, p.url + ': hoja o precarga de otro dominio');
  }
});

test('vercel.json aplica cabeceras de seguridad estrictas y caché larga a los assets', () => {
  const cfg = JSON.parse(read('vercel.json'));
  assert.equal(cfg.outputDirectory, 'dist');
  assert.ok(cfg.redirects.some((r) => r.source === '/' && r.destination === '/es/'), 'sin redirección de la raíz');
  const global = cfg.headers.find((h) => h.source === '/(.*)').headers;
  const get = (k) => (global.find((h) => h.key === k) || {}).value || '';
  const csp = get('Content-Security-Policy');
  const scriptSrc = (csp.match(/script-src ([^;]+)/) || [])[1] || '';
  assert.equal(scriptSrc.trim(), "'self'", 'script-src debe ser solo el propio dominio');
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.equal(get('X-Content-Type-Options'), 'nosniff');
  assert.match(get('Strict-Transport-Security'), /max-age=\d{8,}/);
  assert.ok(get('Referrer-Policy') && get('Permissions-Policy') && get('X-Frame-Options'));
  const astro = cfg.headers.find((h) => h.source === '/_astro/(.*)');
  assert.match(astro.headers[0].value, /immutable/);
});

test('sitemap con las 16 URL absolutas, sus alternativas y robots.txt que lo enlaza', () => {
  const xml = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  const locs = all(xml, /<loc>([^<]+)<\/loc>/g).map(pathOf).sort();
  assert.deepEqual(locs, PAGES.map((p) => p.url).sort());
  assert.equal((xml.match(/hreflang=/g) || []).length, 32);
  assert.match(fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8'), /^Sitemap: https?:\/\/\S+\/sitemap\.xml$/m);
});

test('cada demo trae su contenedor, su sector y un aviso sin JavaScript', () => {
  for (const p of PAGES.filter((x) => x.demo)) {
    const h = html(p.url);
    assert.ok(h.includes('<div id="demoRoot" data-sector="' + p.demo + '">'), p.url + ': contenedor');
    assert.match(h, /<noscript><p class="mono"[^>]*>[^<]+JavaScript/, p.url + ': aviso sin JavaScript');
    assert.match(h, /<meta property="og:image" content="https?:\/\/[^"]+\.webp">/, p.url + ': imagen para compartir');
  }
});

test('pesos: el portafolio no descarga las demos y los scripts caben en su presupuesto', () => {
  const home = html('/es/');
  const entries = all(home, /<script type="module" src="(\/_astro\/[^"]+)"/g);
  const size = (url) => fs.statSync(fileOf(url)).size;
  const entryBytes = entries.reduce((n, u) => n + size(u), 0);
  assert.ok(entryBytes < 60 * 1024, 'JS inicial del portafolio: ' + entryBytes + ' bytes');
  const demoChunk = distFiles('_astro', '.js').find((f) => /mount\./.test(path.basename(f)));
  assert.ok(demoChunk, 'no se generó el código separado de las demos');
  assert.ok(!entries.some((u) => u.includes(path.basename(demoChunk))), 'las demos se cargan en el portafolio');
  assert.ok(fs.statSync(demoChunk).size < 150 * 1024, 'código de las demos: ' + fs.statSync(demoChunk).size + ' bytes');
  const images = fs.readdirSync(path.join(DIST, 'images')).filter((f) => f.endsWith('.webp'));
  images.forEach((f) => assert.ok(fs.statSync(path.join(DIST, 'images', f)).size < 500 * 1024, f + ' pesa más de 500 KB'));
});

test('la página 404 no se indexa y enlaza a los dos idiomas', () => {
  const h = fs.readFileSync(path.join(DIST, '404.html'), 'utf8');
  assert.match(h, /<meta name="robots" content="noindex">/);
  assert.ok(h.includes('href="/es/"') && h.includes('href="/en/"'));
});
