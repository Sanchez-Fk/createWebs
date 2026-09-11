/* ===========================================================================
   PANTALLA DE CARGA — solo en la primera página de cada sesión.
   El contador sigue el arranque real (HTML listo → fuentes → sitio montado),
   se queda lo justo para leerse y sale con una cortina que descubre el hero.
   Salvaguardas: nunca retiene el sitio más de MAX_WAIT; si este módulo no
   llega a ejecutarse, site.css la retira sola; sin JavaScript no aparece.
   =========================================================================== */
const STORAGE_KEY = 'jms:intro';
const MIN_VISIBLE = 1400;   /* ms: lo justo para leer el nombre y ver el contador completo */
const MAX_WAIT = 4000;      /* ms: pase lo que pase, la cortina sube */
const HANDOFF = 420;        /* ms: la cortina ya descubre el escenario cuando entra el hero */
const REMOVE_AFTER = 1200;  /* ms: salida de site.css (.15s de espera + .9s de cortina) con margen */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const IDLE = { handoff: () => Promise.resolve(), leave() {} };

export function startIntro() {
  const el = document.getElementById('intro');
  if (!el) return IDLE;
  if (document.documentElement.classList.contains('intro-seen')) { el.remove(); return IDLE; }
  try {
    return run(el);
  } catch (err) {
    console.error('[intro] pantalla de carga desactivada', err);
    el.remove();
    return IDLE;
  }
}

function run(el) {
  try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (err) { /* sin almacenamiento: early.js ya la omite */ }

  const count = el.querySelector('[data-intro-count]');
  const bar = el.querySelector('[data-intro-bar]');
  const arc = el.querySelector('[data-intro-arc]');
  const vp = document.getElementById('vp');
  const t0 = performance.now();
  let target = 0, shown = 0, raf = 0, left = false, reachedFull = () => {};
  const full = new Promise((resolve) => { reachedFull = resolve; });

  if (vp) vp.inert = true;                          /* nada detrás de la cortina recibe foco */

  const render = () => {
    if (count) count.textContent = String(Math.round(shown * 100)).padStart(3, '0');
    if (bar) bar.style.transform = 'scaleX(' + shown.toFixed(4) + ')';
    if (arc) arc.style.strokeDashoffset = (100 - shown * 100).toFixed(2);
  };

  /* acercamiento exponencial al objetivo: rápido al principio, se asienta al final */
  const frame = () => {
    raf = 0;
    shown += (target - shown) * 0.1;
    if (target - shown < 0.003) shown = target;
    render();
    if (shown >= 1) reachedFull();
    else if (shown < target) raf = requestAnimationFrame(frame);
  };
  const advance = (value) => {
    target = Math.max(target, value);
    if (!raf && !left) raf = requestAnimationFrame(frame);
  };

  const leave = () => {
    if (left) return;
    left = true;
    if (raf) cancelAnimationFrame(raf);
    shown = target = 1;
    render();
    if (vp) vp.inert = false;
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), REMOVE_AFTER);
  };

  advance(0.3);                                     /* HTML y estilos listos */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => advance(0.72), () => advance(0.72));
  const guard = setTimeout(leave, MAX_WAIT);

  return {
    /* el sitio ya está montado: completa el contador, respeta el mínimo y levanta la cortina */
    async handoff() {
      advance(1);
      await Promise.race([full, wait(900)]);        /* con la pestaña oculta no hay fotogramas: no esperar por ellos */
      const rest = MIN_VISIBLE - (performance.now() - t0);
      if (rest > 0) await wait(rest);
      clearTimeout(guard);
      leave();
      await wait(HANDOFF);
    },
    leave() {
      clearTimeout(guard);
      leave();
    }
  };
}
