/* ===========================================================================
   CONTENIDO — rutas por idioma, textos, servicios, proceso y los cuatro sectores.
   Solo lo leen las páginas de Astro al generar el HTML: no viaja al navegador.
   =========================================================================== */
export const ROUTES = {
  es: { home: '', work: 'proyectos', services: 'servicios', contact: 'contacto', demo: 'demo' },
  en: { home: '', work: 'work',      services: 'services',  contact: 'contact',  demo: 'demo' }
};

export const T = {
  es: {
    navLabel: 'Navegación principal', home: 'Inicio', work: 'Trabajo', services: 'Servicios', contact: 'Contacto',
    menu: 'Menú', close: 'Cerrar', langTo: 'Cambiar a inglés',
    heroEyebrow: 'Desarrollador web — disponible en todo el mundo',
    heroL1: 'Webs que te traen clientes.', heroL2: 'No decoración.',
    heroLede: 'Creo sitios rápidos y modernos para pequeños negocios. Una persona, de principio a fin.',
    wa: 'Escríbeme por WhatsApp', heroLink: 'Ver el trabajo', scroll: 'Desliza',
    value: '<em>Tu web no tiene que ganar premios.</em> Tiene que cargar rápido en un móvil, decir en diez segundos qué haces y conseguir que te escriban. Eso construyo, y te lo explico sin jerga antes de que pagues nada.',
    valueMeta: '04 demos de sector · ES / EN · Medellín, UTC−5',
    workLabel: 'Trabajo seleccionado / 01', workNote: 'Demos funcionales construidas para mostrar lo que necesita cada sector.',
    workAll: 'Ver todos los proyectos', demoLink: 'Ver demo en vivo',
    svcLabel: 'Servicios / 02', svcNote: 'Cuatro formas de ayudarte, descritas por lo que consigues y no por la tecnología.', svcAll: 'Ver servicios',
    closeL1: 'Hablemos de', closeL2: 'tu web.', closeMeta: 'Respuesta en menos de 24 horas',
    pWorkLabel: 'Proyectos', pWorkH: 'Demos de sector.',
    pWorkLede: 'Son demos funcionales, no clientes: pruebas de lo que un negocio como el tuyo puede tener. Cada una resuelve el problema principal de su sector.',
    pSvcLabel: 'Servicios', pSvcH: 'Cuatro cosas que construyo.',
    pSvcLede: 'Sin paquetes cerrados ni mensualidades. Cada proyecto empieza con una conversación sobre tu negocio, no sobre tecnología.',
    processLabel: 'Cómo trabajo', processNote: 'Cuatro pasos, siempre en el mismo orden. Sabes en qué punto estamos en todo momento.',
    cH1: 'Hablemos de', cH2: 'tu web.', cLede: 'Cuéntame qué hace tu negocio. Yo te digo qué necesita.',
    fResp: 'Tiempo de respuesta', fRespV: 'Menos de 24 h', fTz: 'Zona horaria', fTzV: 'Medellín · UTC−5', fLang: 'Idiomas', fLangV: 'Español / English',
    formLabel: 'O envía un mensaje', fName: 'Nombre', fMail: 'Email', fBiz: 'Qué hace tu negocio',
    fBizPh: 'Una panadería en el casco antiguo, seis años abierta, sin web todavía.', fSend: 'Enviar mensaje',
    fNote: 'Prototipo: aquí se conecta el endpoint del formulario.',
    ftTag: 'Sitios rápidos y claros para pequeños negocios. Hechos a mano, sin maquetadores.',
    ftNav: 'Navegación', ftContact: 'Contacto', ftSocial: 'Redes', copy: '© 2026 José Manuel Sánchez · Medellín',
    demoBack: 'Volver', demoLabel: 'Demo en vivo', demoLive: 'Interactiva · datos de ejemplo', demoOthers: 'Otras demos', demoNote: 'Todo lo que pulses funciona con datos de ejemplo. En producción, cada demo vive en su propia URL.',
    titles: { home: 'Inicio', work: 'Proyectos', services: 'Servicios', contact: 'Contacto', demo: 'Demo' }
  },
  en: {
    navLabel: 'Main navigation', home: 'Home', work: 'Work', services: 'Services', contact: 'Contact',
    menu: 'Menu', close: 'Close', langTo: 'Switch to Spanish',
    heroEyebrow: 'Web developer — available worldwide',
    heroL1: 'Websites that bring you customers.', heroL2: 'Not decoration.',
    heroLede: 'I build fast, modern sites for small businesses. One person, start to finish.',
    wa: 'Message me on WhatsApp', heroLink: 'See the work', scroll: 'Scroll',
    value: '<em>Your website doesn’t need to win awards.</em> It needs to load fast on a phone, say what you do in ten seconds, and get people to message you. That’s what I build, explained without jargon before you pay a thing.',
    valueMeta: '04 sector demos · ES / EN · Medellín, UTC−5',
    workLabel: 'Selected work / 01', workNote: 'Functional demos built to show what each industry needs.',
    workAll: 'See all projects', demoLink: 'View live demo',
    svcLabel: 'Services / 02', svcNote: 'Four ways I can help, described by what you get rather than the technology.', svcAll: 'See services',
    closeL1: 'Let’s talk about', closeL2: 'your site.', closeMeta: 'Replies within 24 hours',
    pWorkLabel: 'Work', pWorkH: 'Sector demos.',
    pWorkLede: 'These are working demos, not clients: proof of what a business like yours could have. Each one solves the main problem of its industry.',
    pSvcLabel: 'Services', pSvcH: 'Four things I build.',
    pSvcLede: 'No fixed packages and no monthly fees. Every project starts with a conversation about your business, not about technology.',
    processLabel: 'How I work', processNote: 'Four steps, always in the same order. You know where we are at every point.',
    cH1: 'Let’s talk about', cH2: 'your site.', cLede: 'Tell me what your business does. I’ll tell you what it needs.',
    fResp: 'Response time', fRespV: 'Under 24 h', fTz: 'Timezone', fTzV: 'Medellín · UTC−5', fLang: 'Languages', fLangV: 'Español / English',
    formLabel: 'Or send a message', fName: 'Name', fMail: 'Email', fBiz: 'What your business does',
    fBizPh: 'A bakery in the old town, six years open, no website yet.', fSend: 'Send message',
    fNote: 'Prototype: the form endpoint connects here.',
    ftTag: 'Fast, clear websites for small businesses. Built by hand, no page builders.',
    ftNav: 'Navigation', ftContact: 'Contact', ftSocial: 'Social', copy: '© 2026 José Manuel Sánchez · Medellín',
    demoBack: 'Back', demoLabel: 'Live demo', demoLive: 'Interactive · sample data', demoOthers: 'Other demos', demoNote: 'Everything you tap works with sample data. In production, each demo lives at its own URL.',
    titles: { home: 'Home', work: 'Work', services: 'Services', contact: 'Contact', demo: 'Demo' }
  }
};

export const SERVICES = {
  es: [
    ['Web de negocio', 'Un sitio que te encuentran en Google, se entiende en diez segundos y termina con tu número de teléfono.'],
    ['Landing page', 'Una página con un solo trabajo: convertir a quien ya hace clic en tu anuncio en un mensaje, no en una salida.'],
    ['Reservas en línea', 'Tus clientes reservan solos a las once de la noche, y dejas de perder a los que no dejan mensajes de voz.'],
    ['Rediseño', 'Tu web conserva lo que funciona, quita lo que confunde y deja de parecer más vieja que tu negocio.']
  ],
  en: [
    ['Business website', 'A place customers find on Google, understand in ten seconds, and leave with your phone number.'],
    ['Landing page', 'One page with one job: turning the people already clicking your ad into messages instead of bounces.'],
    ['Online booking', 'Customers book themselves in at eleven at night, and you stop losing the ones who won’t leave a voicemail.'],
    ['Redesign', 'Your site keeps what works, drops what confuses people, and stops looking older than your business.']
  ]
};

export const STEPS = {
  es: [
    ['Conversación', 'Me cuentas qué hace tu negocio y a quién quieres llegar. Una llamada o un chat, sin formularios largos.'],
    ['Propuesta', 'Te envío qué voy a construir, cuánto cuesta y cuándo estará listo. Por escrito y sin letra pequeña.'],
    ['Construcción', 'Diseño y desarrollo el sitio. Ves avances reales cada semana, no una sorpresa al final.'],
    ['Entrega', 'Publico la web y te enseño a usarla. Es tuya: dominio, código y contenido.']
  ],
  en: [
    ['Conversation', 'You tell me what your business does and who you want to reach. A call or a chat, no long forms.'],
    ['Proposal', 'I send what I’ll build, what it costs and when it will be ready. In writing, no fine print.'],
    ['Build', 'I design and develop the site. You see real progress every week, not a surprise at the end.'],
    ['Handover', 'I publish the site and show you how to use it. It’s yours: domain, code and content.']
  ]
};

/* Las capturas usan paletas propias a propósito: el marco es neutro, el contenido no. */
export const SECTORS = [
  { id: 'dental', img: 'dentalHero', tags: ['Astro', 'Reservas', 'WCAG AA'],
    es: { sector: 'Dental', title: 'Clínica Dental Aurora', copy: 'Reservas en línea que llenan los huecos entre citas, con precios visibles antes de tener que llamar.' },
    en: { sector: 'Dental', title: 'Clínica Dental Aurora', copy: 'Online booking that fills the gaps between appointments, with prices visible before anyone has to call.' },
    svg: '<svg viewBox="0 0 320 200" role="img" aria-label="Captura: clínica dental, diseño claro con botón de reserva"><rect width="320" height="200" fill="#F3F8FB"/><rect width="320" height="26" fill="#FFFFFF"/><circle cx="20" cy="13" r="5" fill="#2E86C1"/><rect x="32" y="11" width="38" height="4" rx="1" fill="#A8BCCA"/><rect x="212" y="11" width="20" height="4" rx="1" fill="#A8BCCA"/><rect x="240" y="11" width="20" height="4" rx="1" fill="#A8BCCA"/><rect x="272" y="6" width="34" height="14" rx="2" fill="#2E86C1"/><rect x="20" y="50" width="122" height="10" rx="1" fill="#12293C"/><rect x="20" y="66" width="94" height="10" rx="1" fill="#12293C"/><rect x="20" y="88" width="128" height="4" rx="1" fill="#9AB0C0"/><rect x="20" y="97" width="100" height="4" rx="1" fill="#9AB0C0"/><rect x="20" y="113" width="76" height="19" rx="2" fill="#2E86C1"/><text x="30" y="126" font-family="IBM Plex Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="#FFFFFF">RESERVAR</text><rect x="178" y="44" width="122" height="92" rx="2" fill="#D6E8F3"/><circle cx="239" cy="82" r="21" fill="#B6D5E8"/><rect x="20" y="150" width="86" height="34" rx="2" fill="#FFFFFF"/><rect x="30" y="160" width="34" height="3" rx="1" fill="#2E86C1"/><rect x="30" y="169" width="58" height="3" rx="1" fill="#B9C8D3"/><rect x="117" y="150" width="86" height="34" rx="2" fill="#FFFFFF"/><rect x="127" y="160" width="34" height="3" rx="1" fill="#2E86C1"/><rect x="127" y="169" width="58" height="3" rx="1" fill="#B9C8D3"/><rect x="214" y="150" width="86" height="34" rx="2" fill="#FFFFFF"/><rect x="224" y="160" width="34" height="3" rx="1" fill="#2E86C1"/><rect x="224" y="169" width="58" height="3" rx="1" fill="#B9C8D3"/></svg>' },

  { id: 'restaurante', img: 'restHero', tags: ['Astro', 'WebP', 'WhatsApp'],
    es: { sector: 'Restaurante', title: 'Trattoria Nove', copy: 'Una carta que carga en un segundo en el móvil de la mesa y reservas que llegan directo a WhatsApp.' },
    en: { sector: 'Restaurant', title: 'Trattoria Nove', copy: 'A menu that loads in a second on a phone at the table, and reservations that land straight in WhatsApp.' },
    svg: '<svg viewBox="0 0 320 200" role="img" aria-label="Captura: restaurante, cabecera fotográfica oscura sobre la carta"><rect width="320" height="200" fill="#15100D"/><rect width="320" height="120" fill="#452317"/><ellipse cx="128" cy="66" rx="104" ry="56" fill="#7A3A22"/><ellipse cx="214" cy="94" rx="72" ry="40" fill="#9A542E"/><ellipse cx="72" cy="34" rx="54" ry="28" fill="#5C2D1C"/><rect width="320" height="120" fill="#1A0E08" opacity="0.34"/><text x="160" y="58" text-anchor="middle" font-family="Georgia, serif" font-size="21" letter-spacing="5" fill="#F0E4CE">TRATTORIA</text><rect x="128" y="70" width="64" height="1" fill="#C98A4B"/><text x="160" y="88" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7" letter-spacing="2.4" fill="#D6C2A2">CARTA · RESERVAS</text><rect x="24" y="138" width="72" height="6" rx="1" fill="#E6D8BE"/><rect x="24" y="152" width="128" height="3" rx="1" fill="#7E6E58"/><rect x="24" y="161" width="104" height="3" rx="1" fill="#7E6E58"/><rect x="24" y="174" width="140" height="3" rx="1" fill="#5E5142"/><rect x="24" y="183" width="88" height="3" rx="1" fill="#5E5142"/><rect x="230" y="146" width="66" height="22" rx="2" fill="#C0522E"/><text x="263" y="160" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7" letter-spacing="1.4" fill="#F6EADA">RESERVAR</text></svg>' },

  { id: 'barberia', img: 'barberHero', tags: ['Astro', 'Citas'],
    es: { sector: 'Barbería', title: 'Corte & Navaja', copy: 'Barberos, precios y botón de cita en la primera pantalla. Nada más compite por el toque.' },
    en: { sector: 'Barbershop', title: 'Corte & Navaja', copy: 'Barbers, prices and a booking button on the first screen. Nothing else competes for the tap.' },
    svg: '<svg viewBox="0 0 320 200" role="img" aria-label="Captura: barbería, fondo crema con tipografía negra enorme y lista de precios"><rect width="320" height="200" fill="#E9E2D5"/><rect width="320" height="22" fill="#141210"/><text x="16" y="14.5" font-family="IBM Plex Mono, monospace" font-size="7" letter-spacing="2.2" fill="#E9E2D5">CORTE &amp; NAVAJA</text><text x="266" y="14.5" font-family="IBM Plex Mono, monospace" font-size="7" letter-spacing="1.6" fill="#B0A692">CITA</text><rect x="16" y="42" width="178" height="21" fill="#141210"/><rect x="16" y="68" width="126" height="21" fill="#141210"/><rect x="16" y="94" width="156" height="21" fill="#141210"/><rect x="216" y="38" width="36" height="122" fill="#141210"/><rect x="222" y="50" width="24" height="7" fill="#E9E2D5"/><rect x="222" y="68" width="24" height="7" fill="#E9E2D5"/><rect x="222" y="86" width="24" height="7" fill="#E9E2D5"/><rect x="222" y="104" width="24" height="7" fill="#E9E2D5"/><rect x="222" y="122" width="24" height="7" fill="#E9E2D5"/><text x="16" y="138" font-family="IBM Plex Mono, monospace" font-size="7" letter-spacing="2.4" fill="#141210">PRECIOS</text><rect x="16" y="148" width="46" height="3" fill="#141210"/><rect x="70" y="148" width="86" height="1" fill="#A79C88"/><rect x="164" y="148" width="18" height="3" fill="#141210"/><rect x="16" y="162" width="60" height="3" fill="#141210"/><rect x="84" y="162" width="72" height="1" fill="#A79C88"/><rect x="164" y="162" width="18" height="3" fill="#141210"/><rect x="16" y="176" width="38" height="3" fill="#141210"/><rect x="62" y="176" width="94" height="1" fill="#A79C88"/><rect x="164" y="176" width="18" height="3" fill="#141210"/></svg>' },

  { id: 'gimnasio', img: 'gymHero', tags: ['Astro', 'Horarios ICS', 'PWA'],
    es: { sector: 'Gimnasio', title: 'Forja Studio', copy: 'El horario de clases es la portada: los socios ven la próxima sesión sin buscar en ningún menú.' },
    en: { sector: 'Gym', title: 'Forja Studio', copy: 'The class timetable is the homepage: members see the next session without hunting through a menu.' },
    svg: '<svg viewBox="0 0 320 200" role="img" aria-label="Captura: gimnasio, fondo negro con acentos lima y rejilla de horarios"><rect width="320" height="200" fill="#0B0B0B"/><rect width="320" height="24" fill="#131313"/><text x="16" y="15.5" font-family="IBM Plex Sans, sans-serif" font-weight="700" font-size="9" letter-spacing="1.6" fill="#C9FF2E">FORJA</text><rect x="252" y="8" width="52" height="9" rx="1" fill="#C9FF2E"/><text x="16" y="82" font-family="IBM Plex Sans, sans-serif" font-weight="700" font-size="46" letter-spacing="-3" fill="#C9FF2E">06:00</text><text x="17" y="100" font-family="IBM Plex Mono, monospace" font-size="7" letter-spacing="2.4" fill="#6E6E6E">PRIMERA CLASE</text><rect x="16" y="116" width="146" height="1" fill="#242424"/><text x="16" y="134" font-family="IBM Plex Mono, monospace" font-size="7" letter-spacing="2.4" fill="#6E6E6E">HORARIO</text><rect x="16" y="144" width="26" height="14" fill="#1A1A1A"/><rect x="46" y="144" width="26" height="14" fill="#C9FF2E"/><rect x="76" y="144" width="26" height="14" fill="#1A1A1A"/><rect x="106" y="144" width="26" height="14" fill="#1A1A1A"/><rect x="136" y="144" width="26" height="14" fill="#C9FF2E"/><rect x="16" y="162" width="26" height="14" fill="#1A1A1A"/><rect x="46" y="162" width="26" height="14" fill="#1A1A1A"/><rect x="76" y="162" width="26" height="14" fill="#C9FF2E"/><rect x="106" y="162" width="26" height="14" fill="#1A1A1A"/><rect x="136" y="162" width="26" height="14" fill="#1A1A1A"/><rect x="186" y="40" width="118" height="144" fill="#141414"/><rect x="198" y="54" width="58" height="5" rx="1" fill="#C9FF2E"/><rect x="198" y="70" width="94" height="3" rx="1" fill="#3A3A3A"/><rect x="198" y="80" width="76" height="3" rx="1" fill="#3A3A3A"/><rect x="198" y="98" width="94" height="1" fill="#242424"/><rect x="198" y="110" width="52" height="3" rx="1" fill="#5E5E5E"/><rect x="198" y="120" width="86" height="3" rx="1" fill="#3A3A3A"/><rect x="198" y="138" width="94" height="1" fill="#242424"/><rect x="198" y="152" width="80" height="18" rx="1" fill="#C9FF2E"/></svg>' }
];
