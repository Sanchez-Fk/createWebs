/* ===========================================================================
   FONDOS VIVOS DE LAS DEMOS — una escena por oficio, canvas 2D (sin WebGL).
   · Dental: burbujas de limpieza que suben, ondas de aurora y destellos
   · Restaurante: vapor que sube del plato y brasas del horno de leña
   · Barbería: franjas del poste de barbero en diagonal y el brillo de la navaja
   · Gimnasio: monitor cardíaco que late y barras de intensidad
   Todo con alfa bajo para no restar contraste al texto. Sin movimiento: un
   fotograma quieto. Se detiene con la pestaña oculta y al salir de la demo.
   =========================================================================== */
var DSBG = (function () {
  var TAU = Math.PI * 2;
  function rgba(hex, a) {
    var h = hex.replace('#', '');
    return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  var SCENES = {
    dental: {
      bg: '#F6FAFC',
      init: function (W, H) {
        var b = [], s = [];
        for (var i = 0; i < 30; i++) b.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(5, 34), sp: rnd(10, 26), sw: rnd(8, 28), ph: rnd(0, TAU) });
        for (var j = 0; j < 7; j++) s.push({ x: rnd(W * .45, W * .98), y: rnd(H * .06, H * .5), r: rnd(6, 13), ph: rnd(0, TAU) });
        return { b: b, s: s };
      },
      draw: function (ctx, W, H, t, dt, S) {
        for (var k = 0; k < 3; k++) {
          ctx.beginPath();
          for (var x = 0; x <= W + 16; x += 16) {
            var y = H * (.2 + k * .07) + Math.sin(x * .0042 + t * (.32 + k * .1) + k) * (24 + k * 8) + Math.sin(x * .011 - t * .45) * 6;
            if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          }
          ctx.strokeStyle = rgba('#1F6FA8', .085 - k * .02); ctx.lineWidth = 1.6; ctx.stroke();
        }
        S.b.forEach(function (b) {
          b.y -= b.sp * dt;
          if (b.y < -b.r * 2) { b.y = H + b.r * 2; b.x = rnd(0, W); }
          var x = b.x + Math.sin(t * .6 + b.ph) * b.sw;
          ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, TAU);
          ctx.fillStyle = rgba('#1F6FA8', .04); ctx.fill();
          ctx.strokeStyle = rgba('#1F6FA8', .14); ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(x - b.r * .38, b.y - b.r * .38, Math.max(1, b.r * .16), 0, TAU);
          ctx.fillStyle = rgba('#1F6FA8', .16); ctx.fill();
        });
        S.s.forEach(function (s) {
          var a = Math.max(0, Math.sin(t * 1.1 + s.ph));
          if (a < .03) return;
          var r = s.r * (.5 + a * .7);
          ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(t * .35 + s.ph);
          ctx.beginPath(); ctx.moveTo(0, -r);
          ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r);
          ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r);
          ctx.fillStyle = rgba('#1F6FA8', .3 * a); ctx.fill(); ctx.restore();
        });
      }
    },

    restaurante: {
      bg: '#14100D',
      init: function (W, H) {
        var e = [], w = [];
        function ember(o) { o.x = rnd(0, W); o.y = H + rnd(0, 60); o.vx = rnd(-10, 10); o.vy = rnd(-70, -28); o.life = 0; o.max = rnd(4, 10); o.r = rnd(.8, 2.4); o.hot = Math.random() < .35; o.ph = rnd(0, TAU); return o; }
        for (var i = 0; i < 54; i++) { var o = ember({}); o.life = rnd(0, o.max); o.y = H - (-o.vy) * o.life; e.push(o); }
        for (var j = 0; j < 7; j++) w.push({ x: W * (.08 + j * .14) + rnd(-30, 30), ph: rnd(0, TAU) });
        return { e: e, w: w, ember: ember };
      },
      draw: function (ctx, W, H, t, dt, S) {
        ctx.lineCap = 'round';
        S.w.forEach(function (w) {
          var prev = null, pulse = .6 + .4 * Math.sin(t * .6 + w.ph);
          for (var i = 0; i <= 26; i++) {
            var p = i / 26, y = H + 30 - p * H * .95;
            var x = w.x + Math.sin(p * 5 + t * .7 + w.ph) * (16 + p * 46) + Math.sin(p * 12 - t * .45 + w.ph) * 6;
            if (prev) {
              var a = (1 - p) * p * 4 * .07 * pulse;
              ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(x, y);
              ctx.strokeStyle = rgba('#F3E9D7', a); ctx.lineWidth = 16; ctx.stroke();
              ctx.strokeStyle = rgba('#F3E9D7', a * 1.4); ctx.lineWidth = 2; ctx.stroke();
            }
            prev = [x, y];
          }
        });
        S.e.forEach(function (o) {
          o.life += dt;
          if (o.life > o.max || o.y < -10) S.ember(o);
          o.x += (o.vx + Math.sin(t * 1.8 + o.ph) * 12) * dt;
          o.y += o.vy * dt;
          var k = o.life / o.max, flick = .75 + .25 * Math.sin(t * 13 + o.ph);
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, TAU);
          ctx.fillStyle = rgba(o.hot ? '#FFB36B' : '#E8845C', Math.sin(k * Math.PI) * .6 * flick); ctx.fill();
        });
      }
    },

    barberia: {
      bg: '#EDE6DA',
      init: function () { return {}; },
      draw: function (ctx, W, H, t) {
        var L = Math.hypot(W, H), P = 150, off = (t * 16) % P;
        ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-0.62);
        for (var x = -L / 2 - P + off; x < L / 2 + P; x += P) {
          ctx.fillStyle = rgba('#151311', .045); ctx.fillRect(x, -L / 2, 36, L);
          ctx.fillStyle = rgba('#7A5C24', .09); ctx.fillRect(x + 52, -L / 2, 8, L);
          ctx.fillStyle = rgba('#151311', .03); ctx.fillRect(x + 72, -L / 2, 2, L);
        }
        var g = (t % 7.5) / 7.5;
        if (g < .32) {
          var gx = -L / 2 - 120 + (g / .32) * (L + 240);
          ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(gx, -L / 2, 3, L);
          ctx.fillStyle = rgba('#7A5C24', .16); ctx.fillRect(gx + 7, -L / 2, 1.5, L);
          ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(gx - 14, -L / 2, 10, L);
        }
        ctx.restore();
      }
    },

    gimnasio: {
      bg: '#0A0A0A',
      init: function () { return {}; },
      draw: function (ctx, W, H, t) {
        function ecg(u) {
          if (u < .08) return 0;
          if (u < .16) return Math.sin((u - .08) / .08 * Math.PI) * .12;
          if (u < .28) return 0;
          if (u < .31) return -(u - .28) / .03 * .18;
          if (u < .345) return -.18 + (u - .31) / .035 * 1.18;
          if (u < .38) return 1 - (u - .345) / .035 * 1.45;
          if (u < .42) return -.45 + (u - .38) / .04 * .45;
          if (u < .55) return 0;
          if (u < .72) return Math.sin((u - .55) / .17 * Math.PI) * .22;
          return 0;
        }
        var LIME = '#C9FF2E';
        ctx.beginPath();
        for (var gx = 40; gx < W; gx += 40) { ctx.moveTo(gx + .5, 0); ctx.lineTo(gx + .5, H); }
        for (var gy = 40; gy < H; gy += 40) { ctx.moveTo(0, gy + .5); ctx.lineTo(W, gy + .5); }
        ctx.strokeStyle = rgba(LIME, .028); ctx.lineWidth = 1; ctx.stroke();

        var y0 = H * .44, amp = Math.min(96, H * .11), beat = 230, speed = 250;
        var hx = (t * speed) % (W + 220) - 110, tail = W * .72, prev = null;
        ctx.lineWidth = 2; ctx.lineCap = 'round';
        for (var x = Math.max(0, hx - tail); x <= Math.min(W, hx); x += 4) {
          var u = ((x % beat) + beat) % beat / beat, y = y0 - ecg(u) * amp;
          if (prev) {
            ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(x, y);
            ctx.strokeStyle = rgba(LIME, Math.pow(1 - (hx - x) / tail, 1.7) * .6); ctx.stroke();
          }
          prev = [x, y];
        }
        if (hx > 0 && hx < W) {
          var hu = ((hx % beat) + beat) % beat / beat, hy = y0 - ecg(hu) * amp;
          ctx.beginPath(); ctx.arc(hx, hy, 11, 0, TAU); ctx.fillStyle = rgba(LIME, .14); ctx.fill();
          ctx.beginPath(); ctx.arc(hx, hy, 3.5, 0, TAU); ctx.fillStyle = rgba(LIME, .95); ctx.fill();
        }

        var n = Math.max(12, Math.round(W / 44)), bw = W / n, pulse = Math.pow(Math.max(0, Math.sin(t * TAU * (speed / beat) * .5)), 6);
        for (var i = 0; i < n; i++) {
          var hgt = (.25 + .75 * Math.abs(Math.sin(t * 2.1 + i * .55) * Math.sin(t * .7 + i * 1.3))) * H * .12 * (1 + pulse * .5);
          ctx.fillStyle = rgba(LIME, .07 + pulse * .04);
          ctx.fillRect(i * bw + bw * .2, H - hgt, bw * .6, hgt);
        }
      }
    }
  };

  function mount(root, id, isOn) {
    var sc = SCENES[id];
    if (!Object.prototype.hasOwnProperty.call(SCENES, id) || !root) return null;
    var cv = document.createElement('canvas');
    cv.className = 'ds-bgfx'; cv.setAttribute('aria-hidden', 'true');
    root.insertBefore(cv, root.firstChild);
    root.classList.add('has-bgfx');

    var ctx = cv.getContext('2d'), W = 0, H = 0, S = null, raf = 0, last = 0, t = 6, alive = true, ro = null;
    function size() {
      var w = cv.clientWidth, h = cv.clientHeight;
      if (w === W && h === H) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = w; H = h; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = sc.init(W, H);
    }
    function frame(now) {
      raf = 0;
      if (!alive) return;
      var on = isOn(), dt = on && last ? Math.min(.05, (now - last) / 1000) : 0;
      last = now;
      size();
      if (W && H) {
        t += dt;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = sc.bg; ctx.fillRect(0, 0, W, H);
        sc.draw(ctx, W, H, t, dt, S);
      }
      if (on && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function wake() { if (alive && !raf) { last = 0; raf = requestAnimationFrame(frame); } }
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('resize', wake);
    if ('ResizeObserver' in window) { ro = new ResizeObserver(wake); ro.observe(cv); }
    raf = requestAnimationFrame(frame);

    return function () {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('resize', wake);
      if (ro) ro.disconnect();
    };
  }

  return { mount: mount };
})();
