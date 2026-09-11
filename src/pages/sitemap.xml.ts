/* Sitemap con las 16 páginas y sus alternativas de idioma (las URL cambian por idioma). */
import type { APIRoute } from 'astro';
import { SECTORS } from '../data/content';
import { LANGS, PAGE_KEYS, type Lang, href } from '../lib/routes';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('http://localhost:4321');
  const abs = (path: string) => new URL(path, base).href;
  const pages: Array<(lang: Lang) => string> = [
    ...PAGE_KEYS.map((key) => (lang: Lang) => href(lang, key)),
    ...SECTORS.map((s) => (lang: Lang) => href(lang, 'demo', s.id)),
  ];

  const urls = pages.flatMap((path) =>
    LANGS.map((lang) => {
      const alternates = LANGS.map((alt) => `<xhtml:link rel="alternate" hreflang="${alt}" href="${abs(path(alt))}"/>`).join('');
      return `  <url><loc>${abs(path(lang))}</loc>${alternates}</url>`;
    }),
  );

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join('\n') +
    '\n</urlset>\n';

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
