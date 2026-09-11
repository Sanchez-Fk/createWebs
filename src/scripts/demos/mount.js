/* ===========================================================================
   MONTAJE DE UNA DEMO — lee el sector de #demoRoot, monta la demo y su fondo
   animado. Un sector desconocido o un fallo al montar se propagan para que
   app.js muestre el aviso; un fallo del fondo solo lo desactiva.
   =========================================================================== */
import { DEMOS } from './index.js';
import { DSBG } from './backgrounds.js';

export function mountDemo(root, lang, isOn) {
  const id = root.getAttribute('data-sector') || '';
  if (!Object.prototype.hasOwnProperty.call(DEMOS, id)) throw new Error('demo desconocida: ' + id);

  const offDemo = DEMOS[id].mount(root, lang);
  let offBg = null;
  if (root.classList.contains('ds') || root.querySelector('.ds')) {
    try { offBg = DSBG.mount(root, id, isOn); }
    catch (err) { console.error('[demo] fondo animado desactivado', err); }
  }
  return () => {
    if (typeof offDemo === 'function') offDemo();
    if (typeof offBg === 'function') offBg();
  };
}
