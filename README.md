# createWebs — prototipos de diseño web

Diseño y prototipos del portafolio de **José Manuel Sánchez**, desarrollador web para pequeños negocios,
producidos entre el 5 y el 10 de septiembre de 2026. Todas las versiones están ordenadas cronológicamente.

Cada archivo `.html` se abre directamente en el navegador; no necesita servidor ni instalación.

---

## 1 · Sistema de diseño

| Archivo | Qué es | Vista en vivo |
|---|---|---|
| [`01-sistema-diseno/hairline.html`](01-sistema-diseno/hairline.html) | Hoja de especificaciones «Phosphor Hairline»: color con contraste medido, tipografía, espaciado de 8 px, superficies, botones e inputs | [ver](https://claude.ai/code/artifact/39ca1676-6a1f-4af5-8932-c8a8abbade4e) |

Archivo de Figma con los fundamentos (tokens como variables, escala tipográfica, componentes y capturas de sector):
<https://www.figma.com/design/j6jBtKi3VRwLsJR62wEpKL>

## 2 · Secciones sueltas

| Archivo | Qué es | Vista en vivo |
|---|---|---|
| [`02-secciones/hero.html`](02-secciones/hero.html) | Hero a pantalla completa anclado abajo a la izquierda, 1440 / 390 | [ver](https://claude.ai/code/artifact/cfb21a93-4a61-4aad-b707-702a7a8d4bf6) |
| [`02-secciones/projects.html`](02-secciones/projects.html) | Grid de proyectos: marco neutro, capturas opuestas | [ver](https://claude.ai/code/artifact/2fbc9c3e-34bc-499c-b21e-3c37a483d155) |
| [`02-secciones/services.html`](02-secciones/services.html) | Lista numerada de servicios | [ver](https://claude.ai/code/artifact/20d3e00c-d573-4287-ab2f-02b764bf49e1) |
| [`02-secciones/contact.html`](02-secciones/contact.html) | Contacto con WhatsApp principal y formulario secundario | [ver](https://claude.ai/code/artifact/870309b5-6338-430e-b8cb-1df2c6a8b2a4) |

## 3 · Fondos animados

| Archivo | Qué es | Vista en vivo |
|---|---|---|
| [`03-fondos/drift.html`](03-fondos/drift.html) | Bucle de 8 s: bruma, haz de luz y grano (WebGL) | [ver](https://claude.ai/code/artifact/9778e15f-1af0-46f4-ad9f-d9ec8da7d531) |
| [`03-fondos/blueprint.html`](03-fondos/blueprint.html) | Bucle de 6 s: líneas de plano que se dibujan (canvas 2D) | [ver](https://claude.ai/code/artifact/6ba57b65-e811-4859-b57a-19020a87c626) |

## 4 · Primer prototipo multipágina

[`04-multipagina-v1/`](04-multipagina-v1/) — `01-home.html`, `02-proyectos.html`, `03-servicios.html`, `04-contacto.html`.
Vistas en vivo: [Proyectos](https://claude.ai/code/artifact/60a096ac-d551-4181-a825-373d6e180c94) ·
[Servicios](https://claude.ai/code/artifact/e752c2bc-9471-4b30-be84-c81f3d42d9cc) ·
[Contacto](https://claude.ai/code/artifact/3a25d510-bef1-4d47-9c1f-80b3769f7b4e)

## 5 · Prototipo navegable actual

[`05-prototipo-final/prototipo.html`](05-prototipo-final/prototipo.html) — [vista en vivo](https://claude.ai/code/artifact/722189f2-9b6d-4f62-9e6b-6602c3316f10)

- Cuatro páginas con rutas separadas ES / EN (`#/es/proyectos` ⇄ `#/en/work`) y vista a 390, 768 y 1440.
- Fondo HUD interactivo con la mira pegada al cursor.
- Animaciones al hacer scroll, parallax, contadores y botones magnéticos; todo se apaga con *prefers-reduced-motion*.
- Cuatro demos de sector completas (clínica dental, restaurante, barbería y gimnasio) con reserva o pedido
  funcionando, fondo animado propio y **una coreografía de movimiento distinta en cada una**:
  - Dental — respira: letras que se enfocan, foto que se abre en círculo, tarjetas que se inflan.
  - Restaurante — se encienden las luces: palabras editoriales, foto que se ilumina con zoom lento, galería en telón.
  - Barbería — corte a navaja: titulares cortados por una línea, barridos en diagonal, precios en odómetro.
  - Gimnasio — impacto: palabras que golpean, destello en la foto, rebotes e inclinación según la velocidad del scroll.

Requiere conexión para Google Fonts y Lenis (jsDelivr). Las fotos van incrustadas en el archivo.

### Reconstruir el prototipo

El archivo final se genera concatenando las partes de [`05-prototipo-final/fuente/`](05-prototipo-final/fuente/):

```bash
bash 05-prototipo-final/fuente/build.sh
```

Las partes que ya no se usan están en `fuente/anteriores/`.

### Pruebas de seguridad y robustez

```bash
node 05-prototipo-final/pruebas/pruebas.js
```

Sin dependencias (Node 18 o superior). Sale con código 1 si algo falla. Comprueba:

- **HTML seguro:** UTF-8 declarado, etiquetas equilibradas, scripts externos solo por HTTPS desde CDN permitidos y con versión fija, sin `eval`, sin manejadores en línea y sin recursos por http://.
- **Reconstrucción:** `build.sh` genera exactamente el archivo publicado.
- **Plantillas y rutas:** las cuatro páginas en ES y EN sin valores vacíos, y todos los enlaces internos apuntan a rutas reales.
- **Demos:** flujos completos con nombres, direcciones y notas maliciosas (`<script>`, `onerror`) que deben salir escapados; *fuzzing* de todas las acciones con valores inválidos; almacenamiento local corrupto o bloqueado; y funcionamiento sin fotos.
- **Fondos vivos:** las cuatro escenas con y sin movimiento, incluso con un lienzo de tamaño cero.
- **Red de seguridad:** rutas de demo protegidas contra `__proto__`, generación de páginas y montaje de demos dentro de try/catch, y un sistema de movimiento que revela todo el contenido ante cualquier error.
- **Estilos:** ninguna regla del portafolio alcanza a las demos por nombres de clase compartidos, y contraste AA (4,5:1) en el portafolio y en las cuatro paletas.

### Fotografías

Las 14 fotos de [`05-prototipo-final/fotos/`](05-prototipo-final/fotos/) son de [Unsplash](https://unsplash.com/license)
(uso libre, sin atribución obligatoria; igualmente se acreditan en el prototipo). Autores en `fotos/creditos.txt`.
El autor de `gymStrength.webp` no está confirmado.

---

## Notas abiertas

- **Acento pendiente.** El prototipo usa `#E0A200` con `#FFB000` como alternativa.
- **La paleta, tipografía y radios del brief no coinciden con el documento de arquitectura** (`design.md` del
  repositorio del portafolio). Los prototipos siguen el brief; hay que decidir cuál manda antes de producción.
- Solo se conserva la **última versión de cada archivo**. Las iteraciones intermedias están en el historial
  de versiones de cada vista en vivo, no en este repositorio.
- Direcciones, teléfonos, reseñas y nombres de las demos son **datos de ejemplo**.
