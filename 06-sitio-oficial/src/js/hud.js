/* ===========================================================================
   HUD — fondo interactivo tipo sistema de a bordo. Canvas 2D, sin WebGL ni 3D.
   · Anillos con escala de grados que giran despacio y con el scroll
   · Barrido de radar con estela de trazos (no gradientes)
   · Mira pegada al puntero (sin retardo), crece sobre enlaces y botones
   · Nodos que se enlazan al puntero cerca · clic/toque = pulso
   Presupuesto: DPR ≤ 2, bucle parado con la pestaña oculta, fotograma estático
   sin movimiento, sin retícula en táctil ni por debajo de 768px.
   =========================================================================== */
function HUD(o) {
  var cv = o.canvas, ctx = cv.getContext('2d');
  var BONE = [239, 239, 239], acc = [224, 162, 0];
  var fine = window.matchMedia('(pointer: fine)').matches;
  var w = 0, h = 0, cx = 0, cy = 0, R = 0, wide = true;
  var px = 0, py = 0, tx = 0, ty = 0, near = 0, nearT = 0, hot = 0, hotT = 0;
  var nodes = [], pings = [], lit = [], raf = 0;
  var TAU = Math.PI * 2;

  function c(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + Math.max(0, a).toFixed(3) + ')'; }
  function live() { return o.isMotion() && !document.hidden; }
  function reticleOn() { return fine && wide && o.isMotion(); }

  function place() {
    wide = w >= 768;
    cx = wide ? w * 0.72 : w * 0.5;
    cy = wide ? h * 0.36 : h * 0.26;
    R = wide ? Math.min(h * 0.3, w * 0.2, 290) : Math.min(w * 0.4, 170);
    var seed = 11;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    nodes = []; lit = [];
    var n = wide ? 28 : 12;
    for (var i = 0; i < n; i++) { nodes.push({ x: rnd() * w, y: rnd() * h, ph: rnd() * TAU, sp: 0.5 + rnd() }); lit.push(0); }
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = o.stage.offsetWidth; h = o.stage.offsetHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    place();
    draw(performance.now());
  }

  function seg(r, start, len, style, lw) {
    ctx.beginPath(); ctx.arc(cx, cy, r, start, start + len);
    ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke(); ctx.lineWidth = 1;
  }

  function draw(now) {
    var k = wide ? 1 : 0.6;                       /* en móvil el HUD queda detrás del texto: más tenue */
    var still = !o.isMotion();
    var time = still ? 16000 : now;
    var srot = o.getScroll() * 0.0009;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;

    /* ---- retícula técnica de fondo ---- */
    ctx.beginPath();
    for (var gx = 48; gx < w; gx += 48) { ctx.moveTo(gx + .5, 0); ctx.lineTo(gx + .5, h); }
    for (var gy = 48; gy < h; gy += 48) { ctx.moveTo(0, gy + .5); ctx.lineTo(w, gy + .5); }
    ctx.strokeStyle = c(BONE, 0.022); ctx.stroke();

    /* ---- anillos ---- */
    var rot = time * 0.00005 + srot;
    [[1, .075], [.72, .06], [.44, .085]].forEach(function (r) {
      ctx.beginPath(); ctx.arc(cx, cy, R * r[0], 0, TAU); ctx.strokeStyle = c(BONE, r[1] * k); ctx.stroke();
    });
    ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.arc(cx, cy, R * .58, 0, TAU); ctx.strokeStyle = c(BONE, .07 * k); ctx.stroke(); ctx.setLineDash([]);

    ctx.beginPath();
    for (var a = 0; a < 360; a += 5) {
      var ra = a * Math.PI / 180 + rot, len = a % 30 === 0 ? 10 : 4;
      ctx.moveTo(cx + Math.cos(ra) * R, cy + Math.sin(ra) * R);
      ctx.lineTo(cx + Math.cos(ra) * (R + len), cy + Math.sin(ra) * (R + len));
    }
    ctx.strokeStyle = c(BONE, .13 * k); ctx.stroke();

    var spin = time * 0.00022 + srot * 1.8;
    seg(R * .72, spin, .95, c(acc, (.42 + near * .25) * k), 2);
    seg(R * .72, spin + Math.PI, .32, c(acc, .26 * k), 2);
    seg(R * .44, -time * 0.00038, 1.3, c(BONE, .18 * k), 1);
    seg(R * 1.09, -time * 0.00011, .55, c(BONE, .16 * k), 1);

    ctx.beginPath();
    ctx.moveTo(cx - R * .12, cy); ctx.lineTo(cx + R * .12, cy);
    ctx.moveTo(cx, cy - R * .12); ctx.lineTo(cx, cy + R * .12);
    ctx.strokeStyle = c(BONE, .14 * k); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 2, 0, TAU); ctx.fillStyle = c(acc, .7 * k); ctx.fill();

    /* ---- barrido de radar: estela de trazos con alfa decreciente ---- */
    var sweep = time * 0.0008;
    for (var s = 0; s < 16; s++) {
      var sa = sweep - s * 0.035;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sa) * R * .72, cy + Math.sin(sa) * R * .72);
      ctx.strokeStyle = c(acc, (.2 - s * .012) * k); ctx.stroke();
    }

    /* ---- nodos: parpadean al paso del barrido, se enlazan al puntero ---- */
    var showRet = reticleOn() && near > 0.01;
    for (var i = 0; i < nodes.length; i++) {
      var nd = nodes[i];
      var nx = nd.x + Math.sin(time * 0.0002 * nd.sp + nd.ph) * 14;
      var ny = nd.y + Math.cos(time * 0.00017 * nd.sp + nd.ph) * 14;
      var bearing = Math.atan2(ny - cy, nx - cx);
      var diff = Math.abs(((sweep - bearing) % TAU + TAU) % TAU);
      if (diff < 0.05 && Math.hypot(nx - cx, ny - cy) < R * 1.4) lit[i] = 1;
      lit[i] *= 0.96;
      var link = 0;
      if (showRet) {
        var d = Math.hypot(nx - px, ny - py);
        if (d < 180) {
          link = (1 - d / 180) * near;
          ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(px, py);
          ctx.strokeStyle = c(acc, link * .38); ctx.stroke();
        }
      }
      var glow = Math.max(lit[i], link);
      ctx.beginPath(); ctx.arc(nx, ny, 1.2 + glow * 1.6, 0, TAU);
      ctx.fillStyle = glow > .05 ? c(acc, (.25 + glow * .55) * k) : c(BONE, .2 * k); ctx.fill();
    }

    /* ---- textos del sistema ---- */
    var es = o.getLang() === 'es';
    var d8 = new Date();
    var clock = ('0' + d8.getHours()).slice(-2) + ':' + ('0' + d8.getMinutes()).slice(-2) + ':' + ('0' + d8.getSeconds()).slice(-2);
    ctx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillStyle = c(BONE, .34 * k);
    ctx.fillText(es ? 'SISTEMA EN LÍNEA' : 'SYSTEM ONLINE', cx + R * .78, cy - R * .92);
    ctx.fillText('06.24 N · 75.58 O', cx + R * .78, cy - R * .92 + 14);
    ctx.fillText(clock + ' · UTC−5', cx - R * 1.1, cy + R * 1.02);
    ctx.fillStyle = c(acc, .6 * k);
    ctx.fillText(es ? '● DISPONIBLE' : '● AVAILABLE', cx - R * 1.1, cy + R * 1.02 + 14);

    /* ---- rumbo hacia el puntero + retícula ---- */
    if (showRet) {
      var ang = Math.atan2(py - cy, px - cx), dist = Math.hypot(px - cx, py - cy);
      var ex = cx + Math.cos(ang) * (R + 14), ey = cy + Math.sin(ang) * (R + 14);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(cx + Math.cos(ang - .035) * (R + 26), cy + Math.sin(ang - .035) * (R + 26));
      ctx.lineTo(cx + Math.cos(ang + .035) * (R + 26), cy + Math.sin(ang + .035) * (R + 26));
      ctx.closePath(); ctx.fillStyle = c(acc, .75 * near); ctx.fill();
      if (dist > R + 30) {
        ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(px, py);
        ctx.strokeStyle = c(BONE, .14 * near); ctx.stroke(); ctx.setLineDash([]);
      }
      var rs = time * (0.002 + hot * 0.004), r1 = 12 + hot * 10, r2 = 22 + hot * 12;
      ctx.beginPath(); ctx.arc(px, py, 2.2, 0, TAU); ctx.fillStyle = c(acc, .95 * near); ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, r1, 0, TAU); ctx.strokeStyle = c(hot > .5 ? acc : BONE, (.3 + hot * .35) * near); ctx.stroke();
      seg0(px, py, r2, rs, 1.2, c(acc, .7 * near), 1.5);
      seg0(px, py, r2, rs + Math.PI, .6, c(acc, .45 * near), 1.5);
      ctx.beginPath();
      [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (v) {
        ctx.moveTo(px + v[0] * (r2 + 6), py + v[1] * (r2 + 6)); ctx.lineTo(px + v[0] * (r2 + 13), py + v[1] * (r2 + 13));
      });
      ctx.strokeStyle = c(BONE, .4 * near); ctx.stroke();
      ctx.fillStyle = c(BONE, .5 * near);
      var deg = Math.round(((ang * 180 / Math.PI) + 450) % 360);
      ctx.fillText((es ? 'RUMBO ' : 'HDG ') + ('00' + deg).slice(-3) + '°', px + r2 + 20, py - 6);
      ctx.fillText('DIST ' + ('000' + Math.round(dist)).slice(-4), px + r2 + 20, py + 8);
    }

    /* ---- pulsos ---- */
    for (var p = pings.length - 1; p >= 0; p--) {
      var e = (now - pings[p].t) / 1000;
      if (e > 1) { pings.splice(p, 1); continue; }
      var ease = 1 - Math.pow(1 - e, 3);
      ctx.beginPath(); ctx.arc(pings[p].x, pings[p].y, 8 + ease * 110, 0, TAU);
      ctx.strokeStyle = c(acc, .55 * (1 - e)); ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 1;
      if (e > .15) {
        var e2 = (e - .15) / .85;
        ctx.beginPath(); ctx.arc(pings[p].x, pings[p].y, 8 + (1 - Math.pow(1 - e2, 3)) * 70, 0, TAU);
        ctx.strokeStyle = c(BONE, .3 * (1 - e2)); ctx.stroke();
      }
    }
  }

  function seg0(x, y, r, start, len, style, lw) {
    ctx.beginPath(); ctx.arc(x, y, r, start, start + len);
    ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke(); ctx.lineWidth = 1;
  }

  function loop(now) {
    raf = 0;
    px = tx; py = ty; near += (nearT - near) * 0.2; hot += (hotT - hot) * 0.25;
    draw(now);
    if (live() || pings.length) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }

  o.stage.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = o.stage.getBoundingClientRect(), s = o.getScale();
    tx = (e.clientX - r.left) / s; ty = (e.clientY - r.top) / s;
    px = tx; py = ty;                                   /* sin retardo: la mira va sobre el cursor */
    hotT = e.target.closest && e.target.closest('a,button,input,textarea,select,label,summary,[data-act]') ? 1 : 0;
    nearT = 1;
    kick();
  });
  o.stage.addEventListener('pointerleave', function () { nearT = 0; });
  o.stage.addEventListener('pointerdown', function (e) {
    if (e.target.closest && e.target.closest('a,button,input,textarea,select,label')) return;
    var r = o.stage.getBoundingClientRect(), s = o.getScale();
    pings.push({ x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s, t: performance.now() });
    kick();
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });

  return {
    resize: resize,
    draw: function () { if (live()) kick(); else draw(performance.now()); },
    accent: function (hex) { acc = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; if (!live()) draw(performance.now()); }
  };
}
