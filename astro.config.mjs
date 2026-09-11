// @ts-check
import { defineConfig } from 'astro/config';

/* URL pública del sitio (canonical, hreflang, sitemap):
   1. SITE_URL si se define (dominio propio),
   2. en Vercel, el dominio de producción del proyecto,
   3. en local, el servidor de desarrollo. */
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  redirects: { '/': '/es/' },
  /* las páginas se descargan al pasar el cursor: navegación casi instantánea */
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
  vite: {
    /* ningún script en línea: la política CSP de vercel.json solo permite archivos propios */
    build: { assetsInlineLimit: 0 },
  },
});
