# createWebs · Portafolio de José Manuel Sánchez

Sitio del portafolio de **José Manuel Sánchez**, desarrollador web para pequeños negocios en Medellín.
Bilingüe (español / inglés, con URL propias en cada idioma) y con **cuatro demos de sector interactivas**:
clínica dental, restaurante, barbería y gimnasio.

Construido con [Astro 7](https://astro.build): cada página se genera como HTML estático y el JavaScript
solo añade animaciones e interacción. Listo para publicar en [Vercel](https://vercel.com).

| | |
|---|---|
| Framework | Astro 7 (salida estática) + TypeScript estricto |
| Scroll | Lenis 1.3 (paquete npm, sin CDN) |
| Tipografías | IBM Plex Sans / Mono, Fraunces, Oswald y Archivo, servidas desde el propio dominio (Fontsource) |
| Pruebas | `node:test` — 43 pruebas de demos, seguridad, estilos y HTML generado |
| Despliegue | Vercel, con cabeceras de seguridad (CSP estricta) y caché inmutable de assets |
| CI | GitHub Actions: tipos, pruebas y build en cada push |

---

## Páginas

| Español | English | Qué muestra |
|---|---|---|
| `/es/` | `/en/` | Hero, propuesta de valor, trabajo seleccionado, servicios |
| `/es/proyectos/` | `/en/work/` | Las cuatro demos de sector |
| `/es/servicios/` | `/en/services/` | Servicios y proceso de trabajo |
| `/es/contacto/` | `/en/contact/` | WhatsApp, datos y formulario |
| `/es/demo/dental/` · `restaurante/` · `barberia/` · `gimnasio/` | `/en/demo/…` | Demo en vivo de cada sector |

`/` redirige a `/es/`. Además se generan `sitemap.xml` (con `hreflang`) y `robots.txt`.

**Página 404 personalizada:** Vercel la sirve en cualquier URL que no existe. Detecta el idioma de la ruta (`/en/…` → inglés), muestra la ruta pedida y enlaza a las páginas que sí existen, sobre el mismo fondo HUD del sitio.

## Estructura

```
createWebs/
├── src/
│   ├── pages/                    rutas: [lang]/[...slug], [lang]/demo/[sector], 404, sitemap.xml, robots.txt
│   ├── layouts/SiteLayout.astro  marco común: HUD, cabecera, menú móvil, grano y script de arranque
│   ├── views/                    contenido de Inicio, Proyectos, Servicios y Contacto
│   ├── components/               Header, MobileMenu, WorkCard, ServiceList, Stats, Footer, DemoBar, SeoHead…
│   ├── data/
│   │   ├── content.ts            todos los textos ES / EN, servicios, proceso y sectores
│   │   ├── site.ts               nombre y enlaces de contacto (WhatsApp, email, redes)
│   │   └── images.js             fotos, versiones de 800 px y créditos
│   ├── lib/routes.ts             URL por idioma, títulos y descripciones
│   ├── scripts/
│   │   ├── app.js                arranque de cada página: Lenis, HUD, revelados, menú, formulario
│   │   ├── motion.js             animaciones al hacer scroll, con red de seguridad
│   │   ├── intro.js              pantalla de carga: progreso real y salida en cortina
│   │   ├── hud.js                fondo interactivo con la mira sobre el cursor
│   │   ├── not-found.js          página 404: ruta pedida, título por idioma y fondo HUD
│   │   └── demos/                kit común, las 4 demos y sus fondos animados (se descargan solo en su página)
│   └── styles/                   global.css y sus partes (portafolio, demos, movimiento, sitio)
├── public/                       favicon, imágenes WebP y scripts/early.js (se ejecuta antes de pintar)
├── tests/
│   ├── unit/                     demos (XSS, fuzzing, datos corruptos), fondos, arranque, estilos, módulos
│   └── build/                    HTML generado: rutas, SEO, enlaces, CSP, cabeceras, pesos
├── .github/workflows/ci.yml      verificación automática en cada push
├── astro.config.mjs · tsconfig.json · vercel.json
├── package.json · package-lock.json · .nvmrc
└── .gitignore · .gitattributes
```

## Desarrollo local

Requisitos: **Node.js 22.12 o superior** y npm.

```bash
npm install
npm run dev          # http://localhost:4321/es/
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Genera el sitio en `dist/` |
| `npm run preview` | Sirve `dist/` para revisarlo antes de publicar |
| `npm run check` | Comprueba tipos de Astro y TypeScript |
| `npm test` | Pruebas unitarias (no necesitan build) |
| `npm run test:build` | Pruebas sobre el HTML generado (ejecuta antes `npm run build`) |
| `npm run verify` | Todo lo anterior en orden; es lo que ejecuta Vercel al desplegar |

`node_modules/`, `dist/` y `.astro/` no se suben a GitHub: se regeneran con `npm install` y `npm run build`.

## Publicar en Vercel

1. Sube el repositorio a GitHub (rama `main`).
2. En Vercel: **Add New → Project → Import** el repositorio `createWebs`.
3. Vercel detecta Astro y lee `vercel.json`: build `npm run verify`, salida `dist`. No hay que tocar nada más.
4. **Deploy.** Cada push a `main` publica en producción y cada pull request crea una vista previa.

Si una prueba falla, el despliegue se detiene y la versión anterior sigue en línea.

**Dominio propio (opcional):** añádelo en *Settings → Domains* y define la variable de entorno
`SITE_URL=https://tudominio.com` para que canonical, hreflang y sitemap usen ese dominio.
Sin ella se usa el dominio de producción que asigna Vercel.

### Seguridad y rendimiento

`vercel.json` aplica a todas las respuestas:

- **Content-Security-Policy** estricta: scripts, fuentes e imágenes solo del propio dominio; sin `eval`, sin iframes de terceros.
- HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` y `Cross-Origin-Opener-Policy`.
- Caché de un año e inmutable para `/_astro/*` (nombres con hash) y de 30 días para `/images/*`.

El sitio no carga nada de otros dominios, así que la CSP no bloquea nada propio. Solo la barra de comentarios
de Vercel en las vistas previas queda bloqueada, sin efecto sobre el sitio.

## Antes de publicar: qué personalizar

| Qué | Dónde |
|---|---|
| WhatsApp (activo: 305 262 4583, con mensaje inicial en cada idioma) | `whatsappHref()` en `src/data/site.ts` |
| Redes (activas: GitHub, LinkedIn e Instagram) y email (aún de ejemplo: `#mail`) | `LINKS` en `src/data/site.ts` |
| Textos en español e inglés | `src/data/content.ts` |
| Envío real del formulario de contacto (ahora muestra un aviso) | `bindForm()` en `src/scripts/app.js` |
| Fotos: copia el `.webp` a `public/images/` y regístralo con su autor | `src/data/images.js` |

## Decisiones de diseño

- Paleta oscura premium (`#0F0F0F`, acento `#E0A200`), grano sutil, sin sombras ni negro puro.
- Movimiento siempre activo: revelados al hacer scroll, contadores, botones magnéticos y una coreografía distinta en cada demo.
  Si algo falla, todo el contenido se muestra igualmente (red de seguridad en `motion.js`, `app.js` y CSS).
- Pantalla de carga solo en la primera página de cada visita: el contador sigue la carga real, dura lo justo
  para leerse (mínimo 1,4 s, máximo 4 s) y sale con una cortina que revela la portada. Las demos no la tienen.
  Si el JavaScript falla, se retira sola; sin JavaScript no aparece.
- Zoom siempre permitido, contraste AA verificado por pruebas y navegación por teclado con foco visible.

## Créditos de las fotos

Fotografías de [Unsplash](https://unsplash.com/license) (uso libre, sin atribución obligatoria; igualmente se acreditan en cada demo).

| Archivo | Autor | Original |
|---|---|---|
| `dentalHero.webp` | Kari Bjorn Photography | [Fdku_oMrDvk](https://unsplash.com/photos/Fdku_oMrDvk) |
| `restHero.webp` | Liubov Ilchuk | [_qZOwG2oaj4](https://unsplash.com/photos/_qZOwG2oaj4) |
| `dishSpaghetti.webp` | Mae Mu | [Pvclb-iHHYY](https://unsplash.com/photos/Pvclb-iHHYY) |
| `dishPizza.webp` | Ivan Torres | [MQUqbmszGGM](https://unsplash.com/photos/MQUqbmszGGM) |
| `dishPesto.webp` | Eaters Collective | [12eHC6FxPyg](https://unsplash.com/photos/12eHC6FxPyg) |
| `dishAntipasto.webp` | Jay Wennington | [N_Y88TWmGwA](https://unsplash.com/photos/N_Y88TWmGwA) |
| `dishTiramisu.webp` | Olga Petnyunene | [n3GkbNzur3s](https://unsplash.com/photos/n3GkbNzur3s) |
| `barberHero.webp` | František Čaník | [htm5bLLW2GY](https://unsplash.com/photos/htm5bLLW2GY) |
| `gymHero.webp` | Samuel Girven | [fqMu99l8sqo](https://unsplash.com/photos/fqMu99l8sqo) |
| `gymStrength.webp` | autor sin confirmar | [VJ2s0c20qCo](https://unsplash.com/photos/VJ2s0c20qCo) |
| `gymSpin.webp` | Humphrey M | [LOA2mTj1vhc](https://unsplash.com/photos/LOA2mTj1vhc) |
| `gymFunctional.webp` | Meghan Holmes | [wy_L8W0zcpI](https://unsplash.com/photos/wy_L8W0zcpI) |
| `gymYoga.webp` | bruce mars | [gJtDg6WfMlQ](https://unsplash.com/photos/gJtDg6WfMlQ) |
