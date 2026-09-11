/* ===========================================================================
   DATOS DEL SITIO — nombre, WhatsApp y enlaces de contacto en un solo lugar.
   Mientras un enlace empiece por «#», el sitio muestra un aviso breve en vez
   de navegar. Sustitúyelos por las URL reales antes de publicar, por ejemplo:
     email: 'mailto:hola@tudominio.com'
   =========================================================================== */
import type { Lang } from '../lib/routes';

export const SITE = {
  name: 'José M. Sánchez',
  fullName: 'José Manuel Sánchez',
  city: 'Medellín',
  country: 'CO',
} as const;

/* WhatsApp: número internacional sin «+» ni espacios (57 = Colombia) y mensaje inicial en cada idioma */
const WHATSAPP_NUMBER = '573052624583';
const WHATSAPP_TEXT: Record<Lang, string> = {
  es: 'Hola José, vi tu portafolio y quiero una web para mi negocio.',
  en: 'Hi José, I saw your portfolio and I’d like a website for my business.',
};

export function whatsappHref(lang: Lang): string {
  return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_TEXT[lang]);
}

export const LINKS = {
  email: '#mail',
  github: 'https://github.com/Sanchez-Fk',
  linkedin: 'https://www.linkedin.com/in/jos%C3%A9-manuel-sanchez-2195b0366/',
  instagram: 'https://www.instagram.com/sanchez_bkr_/',
} as const;

/* perfiles públicos: los usan el pie de página y los datos estructurados (sameAs) */
export const PROFILES = [LINKS.github, LINKS.linkedin, LINKS.instagram];
