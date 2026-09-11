/* ===========================================================================
   404 — muestra la ruta que se pidió, ajusta el título al idioma y enciende
   el mismo fondo HUD del portafolio (radar y mira sobre el cursor).
   El contenido y sus animaciones de entrada no dependen de este script.
   =========================================================================== */
import { HUD } from './hud.js';

export function bootNotFound() {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  if (lang === 'en') document.title = 'Page not found · José M. Sánchez';

  let path = window.location.pathname;
  try { path = decodeURIComponent(path); } catch (err) { /* ruta mal codificada: se muestra tal cual */ }
  document.querySelectorAll('[data-nf-path]').forEach((el) => { el.textContent = path; });

  const stage = document.getElementById('stage');
  const canvas = document.getElementById('grid');
  if (!stage || !canvas) return;
  try {
    const grid = HUD({
      canvas, stage,
      isMotion: () => true,
      getScale: () => 1,
      getScroll: () => 0,
      getLang: () => lang
    });
    grid.resize();
    grid.draw();
    let resizeT = 0;
    window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(grid.resize, 150); });
  } catch (err) {
    console.error('[404] fondo animado desactivado', err);
  }
}
