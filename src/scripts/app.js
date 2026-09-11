/* ===========================================================================
   APP — da vida a cada página generada por Astro: marco a pantalla completa,
   scroll con inercia (Lenis), fondo HUD, revelados, menú móvil, formulario y,
   en las páginas de demo, la demo interactiva con su fondo animado.
   El HTML llega completo desde el servidor; este módulo solo lo anima.
   =========================================================================== */
import Lenis from 'lenis';
import { HUD } from './hud.js';
import { startIntro } from './intro.js';
import { MOTION } from './motion.js';

/* Movimiento siempre activo, por decisión del cliente: sin interruptor y sin
   apagarse con prefers-reduced-motion. */
const MOTION_ON = true;

/* enlaces de ejemplo (src/data/site.ts): un aviso breve en lugar de navegar */
const PLACEHOLDERS = { '#mail': 'Email' };

export async function boot() {
  const $ = (id) => document.getElementById(id);
  const box = $('box'), stage = $('stage'), scroller = $('scroller'), site = $('site');
  const page = $('page'), hdr = $('hdr'), menu = $('menu'), canvas = $('grid');
  if (!box || !stage || !scroller || !site || !page || !hdr || !menu || !canvas) return;

  const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  const isOn = () => MOTION_ON;
  const getScale = () => 1;
  const intro = startIntro();

  try {
    const grid = HUD({ canvas, stage, isMotion: isOn, getScale, getScroll: () => scroller.scrollTop, getLang: () => lang });
    const lenis = startLenis(scroller, site);

    /* vista ajustada a la ventana: las consultas de contenedor ven el ancho real */
    const layout = () => {
      const W = window.innerWidth, H = window.innerHeight;
      box.style.width = W + 'px'; box.style.height = H + 'px';
      stage.style.width = W + 'px'; stage.style.height = H + 'px';
      stage.style.setProperty('--vh', H + 'px');
      grid.resize();
      if (lenis) lenis.resize();
    };
    layout();
    let resizeT = 0;
    window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(layout, 150); });

    /* lo usa el kit de demos para desplazarse a una sección */
    window.__scrollToEl = (el, extra) => {
      const top = scroller.scrollTop + (el.getBoundingClientRect().top - scroller.getBoundingClientRect().top) - hdr.offsetHeight - 16 - (extra || 0);
      if (lenis) lenis.scrollTo(top); else scroller.scrollTo({ top, behavior: 'smooth' });
    };

    MOTION.init({ hdr, stage, scroller, isOn, getScale });
    stage.classList.add('m');
    grid.draw();

    const demoRoot = $('demoRoot');
    if (demoRoot) await mountDemo(demoRoot, lang, isOn);

    bindHeader(hdr, scroller);
    bindMenu(menu, lenis);
    bindForm();
    bindPlaceholders(stage, lang);

    /* con pantalla de carga: el contador llega a 100, sube la cortina y entonces entra el hero */
    await intro.handoff();

    /* estados previos del hero antes de quitar is-booting: la máscara sube al entrar */
    page.querySelectorAll('.mask').forEach((m) => m.classList.add('is-pre'));
    MOTION.run(page, hdr, true);
  } catch (err) {
    console.error('[app] arranque incompleto; se muestra todo el contenido.', err);
    stage.querySelectorAll('.is-pre').forEach((el) => el.classList.remove('is-pre'));
  } finally {
    void stage.offsetHeight;             /* fija los estados previos antes de reactivar transiciones */
    stage.classList.remove('is-booting');
    intro.leave();                       /* ante cualquier fallo, la cortina también se retira */
  }
}

/* LENIS — inercia con easing propio, nunca ease-in-out por defecto */
function startLenis(wrapper, content) {
  try {
    const lenis = new Lenis({
      wrapper, content, duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    const loop = (time) => { lenis.raf(time); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    return lenis;
  } catch (err) {
    console.error('[app] scroll suave desactivado', err);
    return null;
  }
}

/* La demo se descarga solo en su página (código separado del portafolio). */
async function mountDemo(root, lang, isOn) {
  try {
    const { mountDemo: mount } = await import('./demos/mount.js');
    mount(root, lang, isOn);
  } catch (err) {
    console.error('[demo] no se pudo montar', err);
    root.className = '';
    root.innerHTML = '<div style="padding:120px 24px;text-align:center"><p class="mono">' +
      (lang === 'es' ? 'La demo no pudo cargarse.' : 'The demo could not load.') +
      '</p><p style="margin-top:16px"><a class="link-mono" href="/' + lang + '/">' +
      (lang === 'es' ? 'Volver al portafolio' : 'Back to portfolio') + ' →</a></p></div>';
  }
}

function bindHeader(hdr, scroller) {
  const onScroll = () => hdr.classList.toggle('is-scrolled', scroller.scrollTop > 8);
  scroller.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function bindMenu(menu, lenis) {
  const openBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('menuClose');
  const setMenu = (open) => {
    menu.hidden = !open;
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      if (lenis) lenis.stop();
      const first = menu.querySelector('a');
      if (first) first.focus();
    } else {
      if (lenis) lenis.start();
      if (openBtn) openBtn.focus();
    }
  };
  if (openBtn) openBtn.addEventListener('click', () => setMenu(true));
  if (closeBtn) closeBtn.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
}

function bindForm() {
  const form = document.getElementById('form');
  const note = document.getElementById('formNote');
  if (!form || !note) return;
  form.addEventListener('submit', (e) => { e.preventDefault(); note.hidden = false; });
}

function bindPlaceholders(stage, lang) {
  const note = document.createElement('div');
  note.className = 'proto-note';
  note.setAttribute('role', 'status');
  note.setAttribute('aria-live', 'polite');
  stage.appendChild(note);
  let hideT = 0;
  stage.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
    if (!a || a.closest('.ds')) return;
    const h = a.getAttribute('href');
    if (!Object.prototype.hasOwnProperty.call(PLACEHOLDERS, h)) return;
    e.preventDefault();
    note.textContent = (lang === 'en' ? 'External link in production: ' : 'Enlace externo en producción: ') + PLACEHOLDERS[h];
    note.classList.add('on');
    clearTimeout(hideT);
    hideT = setTimeout(() => note.classList.remove('on'), 2400);
  });
}
