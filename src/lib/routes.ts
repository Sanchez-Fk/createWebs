/* ===========================================================================
   RUTAS — URL separadas por idioma (/es/proyectos/ ⇄ /en/work/), títulos y
   descripciones. Una sola fuente para páginas, cabeceras, hreflang y sitemap.
   =========================================================================== */
import { ROUTES, SECTORS, T } from '../data/content';

export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const PAGE_KEYS = ['home', 'work', 'services', 'contact'] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export type Sector = (typeof SECTORS)[number];

export function href(lang: Lang, key: PageKey | 'demo', sub = ''): string {
  const slug = ROUTES[lang][key];
  return '/' + lang + '/' + (slug ? slug + '/' : '') + (sub ? sub + '/' : '');
}

export function sectorById(id: string): Sector {
  return SECTORS.find((s) => s.id === id) ?? SECTORS[0];
}

const plain = (html: string) => html.replace(/<[^>]+>/g, '');

export function pageTitle(lang: Lang, key: PageKey | 'demo', sub = ''): string {
  if (key === 'home') return 'José M. Sánchez · ' + (lang === 'es' ? 'Desarrollador web' : 'Web developer');
  if (key === 'demo') return sectorById(sub)[lang].title + ' · ' + T[lang].demoLabel + ' · José M. Sánchez';
  return T[lang].titles[key] + ' · José M. Sánchez';
}

export function pageDescription(lang: Lang, key: PageKey | 'demo', sub = ''): string {
  const t = T[lang];
  if (key === 'demo') return plain(sectorById(sub)[lang].copy);
  return plain({ home: t.heroLede, work: t.pWorkLede, services: t.pSvcLede, contact: t.cLede }[key]);
}
