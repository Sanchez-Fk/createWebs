/* ===========================================================================
   DATOS DEL SITIO — nombre y enlaces de contacto en un solo lugar.
   Mientras un enlace empiece por «#», el sitio muestra un aviso breve en vez
   de navegar. Sustitúyelos por las URL reales antes de publicar, por ejemplo:
     whatsapp: 'https://wa.me/573001234567'
     email: 'mailto:hola@tudominio.com'
   =========================================================================== */
export const SITE = {
  name: 'José M. Sánchez',
  fullName: 'José Manuel Sánchez',
  city: 'Medellín',
  country: 'CO',
} as const;

export const LINKS = {
  whatsapp: '#wa',
  email: '#mail',
  github: '#gh',
  linkedin: '#li',
  instagram: '#ig',
} as const;
