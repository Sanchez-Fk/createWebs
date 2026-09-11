/* ===========================================================================
   ANTES DE PINTAR — script clásico en <head> (archivo propio: la CSP no
   permite scripts en línea). Se ejecuta antes de dibujar la página para que
   nada parpadee:
   · la pantalla de carga solo aparece en la primera página de cada sesión
   · la 404 muestra el idioma de la URL que se pidió (/en/… → inglés)
   =========================================================================== */
(function () {
  var root = document.documentElement;
  try {
    if (window.sessionStorage.getItem('jms:intro')) root.classList.add('intro-seen');
  } catch (err) {
    root.classList.add('intro-seen');          /* sin almacenamiento: mejor no repetirla en cada página */
  }
  if (root.hasAttribute('data-detect-lang') && /^\/en(\/|$)/.test(window.location.pathname)) root.lang = 'en';
})();
