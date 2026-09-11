#!/usr/bin/env bash
# Reconstruye ../prototipo.html concatenando las partes en el orden en que se cargan.
# El orden importa: estilos primero, luego datos y plantillas, y el runtime al final.
set -euo pipefail
cd "$(dirname "$0")"

ORDER=(
  p1-base p2-sections p3-closing          # portafolio: base, secciones y cierre
  p35-ds-css p36-motion-css p37-ds-motion-css  # demos, movimiento general y coreografías por oficio
  p4-shell                                # marco del prototipo (vista, controles)
  p45-images                              # fotos incrustadas (base64)
  p5-data p6-templates                    # textos, rutas y plantillas
  p60-ds-kit p61-ds-dental p62-ds-rest p63-ds-barber p64-ds-gym  # demos de sector
  p65-hud p66-motion p67-ds-bg            # fondo HUD, sistema de movimiento y fondos vivos
  p7-runtime                              # router, Lenis y arranque
)

out=../prototipo.html
: > "$out"
for part in "${ORDER[@]}"; do
  cat "$part.html" >> "$out"
done
echo "OK → $out ($(wc -c < "$out") bytes)"
