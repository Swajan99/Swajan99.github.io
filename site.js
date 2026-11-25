/* Swajan Sitho Paul, personal site.
   1. page controls   2. sensor bench   3. optics background
   4. hero fiber (3D) 5. paper models (3D) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ================= 1. page controls ================= */
  $('#theme').addEventListener('click', function () {
    var t = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
  });

  var nav = $('#nav'), menu = $('#menu');
  function setMenu(open) { nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', open); }
  menu.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$('a', nav).forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.sec').forEach(function (s) { spy.observe(s); });
  }

  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('button', this).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    $$('.paper').forEach(function (p) {
      p.hidden = b.dataset.f !== 'all' && p.dataset.k.split(' ').indexOf(b.dataset.f) < 0;
    });
  });

  var bib = {
    jsen: '@article{paul2025dlc,\n  author  = {Paul, Swajan Sitho and Islam, Md Jahirul and Dhar, Niloy Sutra and Kaysir, Md Rejvi},\n  title   = {{DLC--TiO$_2$--Au-Coated D-Shaped SPR Biosensor for Cancer Cell Detection}},\n  journal = {IEEE Sensors Journal},\n  volume  = {25},\n  number  = {21},\n  pages   = {39802--39810},\n  year    = {2025},\n  doi     = {10.1109/JSEN.2025.3609695}\n}',
    scf: '@article{dhar2026taguchi,\n  author  = {Dhar, Niloy Sutra and Kaysir, Md Rejvi and Paul, Swajan Sitho and Islam, Md Jahirul},\n  title   = {{Taguchi-optimized suspended-core fiber SPR sensor with dual-interrogation performance analysis for broad-range RI detection}},\n  journal = {Discover Sensors},\n  volume  = {2},\n  number  = {1},\n  pages   = {14},\n  year    = {2026},\n  doi     = {10.1007/s44397-026-00045-1}\n}',
    diamond: '@inproceedings{prapya2026diamond,\n  author    = {Prapya, Tridib Chakrabortty and Paul, Swajan Sitho and Rahman, Mohammad Shaifur},\n  title     = {{Highly Sensitive Diamond Shaped Dual Core PCF SPR Biosensor for Multi-Cancer Cells Detection}},\n  booktitle = {2026 IEEE 2nd International Conference on Quantum Photonics, Artificial Intelligence \\& Networking (QPAIN)},\n  pages     = {1--6},\n  year      = {2026},\n  doi       = {10.1109/QPAIN69676.2026.11546462}\n}',
    ictp: '@inproceedings{paul2025taguchi,\n  author    = {Paul, Swajan Sitho and Dhar, Niloy Sutra and Islam, Md Jahirul and Kaysir, Md Rejvi},\n  title     = {{Taguchi Optimization and MLR-based Performance Prediction of a DLC-TiO$_2$-Au coated D-shaped PCF-SPR RI Sensor}},\n  booktitle = {2025 IEEE International Conference on Telecommunications and Photonics (ICTP)},\n  pages     = {26--30},\n  year      = {2025},\n  doi       = {10.1109/ICTP68765.2025.11414939}\n}',
    biref: '@inproceedings{dhar2025dual,\n  author    = {Dhar, Niloy Sutra and Paul, Swajan Sitho and Kaysir, Md Rejvi and Islam, Md Jahirul},\n  title     = {{Dual Interrogation Birefringent SPR-Based PCF Biosensor for Cancer Cell Detection}},\n  booktitle = {2025 International Conference on Quantum Photonics, Artificial Intelligence, and Networking (QPAIN)},\n  pages     = {1--6},\n  year      = {2025},\n  doi       = {10.1109/QPAIN66474.2025.11171886}\n}'
  };
  var toast = $('#toast'), toastT;
  function say(m) { toast.textContent = m; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('on'); }, 2200); }
  $$('[data-bib]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = bib[b.dataset.bib];
      function fallback() {
        var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
        var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
        t.remove(); say(ok ? 'BibTeX copied' : 'Could not copy. Open the paper page for its citation.');
      }
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { say('BibTeX copied'); }, fallback);
      else fallback();
    });
  });

  if (!calm && matchMedia('(hover: hover)').matches) {
    $$('.paper').forEach(function (p) {
      p.addEventListener('pointermove', function (e) {
        var r = p.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        p.style.transform = 'rotateY(' + (x * 3.2).toFixed(2) + 'deg) rotateX(' + (-y * 3.6).toFixed(2) + 'deg)';
      });
      p.addEventListener('pointerleave', function () { p.style.transform = ''; });
    });
  }

  /* ================= 2. sensor bench ================= */
  // n, peak wavelength (um), sensitivity, resolution: Table II, IEEE Sensors J. 25(21), 2025.
  // h: relative curve height, used only for drawing.
  var CELLS = [
    { id: 'MCF-7', tissue: 'Breast', n: [1.387, 1.401], l: [1.51, 1.96], ws: '32,142.86', res: '3.11 × 10<sup>&minus;6</sup>', h: [57, 83] },
    { id: 'MDA-MB-231', tissue: 'Breast', n: [1.385, 1.399], l: [1.48, 1.83], ws: '25,000', res: '4 × 10<sup>&minus;6</sup>', h: [55, 75] },
    { id: 'PC-12', tissue: 'Adrenal', n: [1.381, 1.395], l: [1.43, 1.68], ws: '17,857.14', res: '5.6 × 10<sup>&minus;6</sup>', h: [51, 67] },
    { id: 'Jurkat', tissue: 'Blood', n: [1.376, 1.390], l: [1.37, 1.57], ws: '14,285.71', res: '7 × 10<sup>&minus;6</sup>', h: [48, 61] },
    { id: 'HeLa', tissue: 'Cervical', n: [1.368, 1.392], l: [1.30, 1.61], ws: '12,916.67', res: '7.74 × 10<sup>&minus;6</sup>', h: [42, 63] },
    { id: 'Basal', tissue: 'Skin', n: [1.360, 1.380], l: [1.24, 1.42], ws: '9,000', res: '1.11 × 10<sup>&minus;5</sup>', h: [38, 50] }
  ];
  var LMIN = 1.1, LMAX = 2.1, W = [.042, .066];
  var S = { cell: 0, sample: 1, lam: 1.96, playing: !calm, phase: 0 };
  function lor(x, x0, w) { var d = (x - x0) / w; return 1 / (1 + d * d); }
  function coupling() { return lor(S.lam, CELLS[S.cell].l[S.sample], W[S.sample]); }

  var cellBox = $('#cells');
  CELLS.forEach(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.innerHTML = c.id + '<small>' + c.tissue + '</small>';
    b.setAttribute('aria-pressed', i === 0);
    b.addEventListener('click', function () { S.cell = i; toPeak(); sync(); });
    cellBox.appendChild(b);
  });
  $$('#sample button').forEach(function (b) {
    b.addEventListener('click', function () { S.sample = +b.dataset.s; toPeak(); sync(); });
  });
  // When the sweep is stopped, a new choice jumps to its resonance so the change is visible.
  function toPeak() { if (!S.playing) S.lam = CELLS[S.cell].l[S.sample]; }

  var lamIn = $('#lam'), lamOut = $('#lam-out'), play = $('#play');
  function setPlay(p) {
    S.playing = p;
    if (p) S.phase = Math.acos(1 - 2 * (S.lam - LMIN) / (LMAX - LMIN));
    play.classList.toggle('paused', !p);
    play.setAttribute('aria-label', p ? 'Pause sweep' : 'Play sweep');
  }
  play.addEventListener('click', function () { setPlay(!S.playing); });
  lamIn.addEventListener('input', function () { setPlay(false); S.lam = +lamIn.value; tick2d(); });

  function sync() {
    var c = CELLS[S.cell];
    $$('button', cellBox).forEach(function (b, i) { b.setAttribute('aria-pressed', i === S.cell); });
    $$('#sample button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.s === S.sample); });
    $('#r-n').textContent = c.n[0].toFixed(3) + ' to ' + c.n[1].toFixed(3);
    $('#r-d').textContent = Math.round((c.l[1] - c.l[0]) * 1000) + ' nm';
    $('#r-s').textContent = c.ws + ' nm/RIU';
    $('#r-r').innerHTML = c.res + ' RIU';
    tick2d();
  }

  var sp = $('#spectrum'), sx = sp.getContext('2d');
  var M = { l: 34, r: 14, t: 34, b: 44 };
  function tick2d() {
    lamIn.value = S.lam; lamOut.textContent = S.lam.toFixed(3) + ' µm';
    drawSpectrum();
  }
  function drawSpectrum() {
    var w = sp.clientWidth, h = sp.clientHeight, d = Math.min(devicePixelRatio || 1, 2);
    if (!w || !h) return;
    if (sp.width !== Math.round(w * d) || sp.height !== Math.round(h * d)) { sp.width = Math.round(w * d); sp.height = Math.round(h * d); }
    sx.setTransform(d, 0, 0, d, 0, 0); sx.clearRect(0, 0, w, h);
    var pw = w - M.l - M.r, ph = h - M.t - M.b, c = CELLS[S.cell];
    function X(l) { return M.l + (l - LMIN) / (LMAX - LMIN) * pw; }
    function Y(v) { return M.t + ph - v / 92 * ph; }
    sx.font = '500 12.5px Archivo, sans-serif'; sx.lineWidth = 1;
    sx.strokeStyle = 'rgba(150,165,255,.16)'; sx.fillStyle = '#aab3e2'; sx.textAlign = 'center'; sx.textBaseline = 'top';
    var step = pw < 420 ? .2 : .1;
    for (var t = LMIN; t <= LMAX + .001; t += step) {
      sx.beginPath(); sx.moveTo(X(t), M.t); sx.lineTo(X(t), M.t + ph); sx.stroke();
      sx.fillText(t.toFixed(1), X(t), M.t + ph + 7);
    }
    sx.fillText('Wavelength (µm)', M.l + pw / 2, M.t + ph + 25);
    sx.strokeStyle = 'rgba(150,165,255,.45)'; sx.beginPath(); sx.moveTo(M.l, M.t + ph); sx.lineTo(M.l + pw, M.t + ph); sx.stroke();
    sx.save(); sx.translate(14, M.t + ph / 2); sx.rotate(-Math.PI / 2); sx.textBaseline = 'middle'; sx.fillText('Confinement loss', 0, 0); sx.restore();

    var cols = ['#58d9f2', '#ff7a63'], fills = ['rgba(88,217,242,.16)', 'rgba(255,122,99,.2)'];
    [0, 1].forEach(function (k) {
      sx.beginPath();
      for (var i = 0; i <= 260; i++) {
        var l = LMIN + (LMAX - LMIN) * i / 260, y = Y(3 + (c.h[k] - 3) * lor(l, c.l[k], W[k]));
        if (i) sx.lineTo(X(l), y); else sx.moveTo(X(l), y);
      }
      sx.strokeStyle = cols[k]; sx.lineWidth = k === S.sample ? 3 : 1.6; sx.stroke();
      if (k === S.sample) { sx.lineTo(X(LMAX), Y(0)); sx.lineTo(X(LMIN), Y(0)); sx.closePath(); sx.fillStyle = fills[k]; sx.fill(); }
    });
    // peak shift bracket
    var a = X(c.l[0]), b = X(c.l[1]), by = 16;
    sx.strokeStyle = '#eef1ff'; sx.lineWidth = 1.4; sx.beginPath();
    sx.moveTo(a, by + 8); sx.lineTo(a, by); sx.lineTo(b, by); sx.lineTo(b, by + 8); sx.stroke();
    sx.setLineDash([2, 4]); sx.strokeStyle = 'rgba(238,241,255,.4)';
    [0, 1].forEach(function (k) { sx.beginPath(); sx.moveTo(X(c.l[k]), by + 10); sx.lineTo(X(c.l[k]), Y(c.h[k]) - 3); sx.stroke(); });
    sx.setLineDash([]);
    var lab = 'Δλ = ' + Math.round((c.l[1] - c.l[0]) * 1000) + ' nm';
    sx.font = '650 13px Archivo, sans-serif'; sx.textBaseline = 'middle';
    var tw = sx.measureText(lab).width + 14;
    sx.fillStyle = '#090e36'; sx.fillRect((a + b) / 2 - tw / 2, by - 9, tw, 18);
    sx.fillStyle = '#eef1ff'; sx.fillText(lab, (a + b) / 2, by);
    // wavelength cursor
    var x = X(S.lam), yv = Y(3 + (c.h[S.sample] - 3) * coupling());
    sx.strokeStyle = '#ffc145'; sx.lineWidth = 1.6; sx.beginPath(); sx.moveTo(x, M.t); sx.lineTo(x, M.t + ph); sx.stroke();
    sx.fillStyle = '#ffc145'; sx.beginPath(); sx.arc(x, yv, 6, 0, 7); sx.fill();
    sx.lineWidth = 2; sx.strokeStyle = '#090e36'; sx.stroke();
  }
  function pick(e) {
    var r = sp.getBoundingClientRect();
    var l = LMIN + (e.clientX - r.left - M.l) / (r.width - M.l - M.r) * (LMAX - LMIN);
    setPlay(false); S.lam = Math.max(LMIN, Math.min(LMAX, l)); tick2d();
  }
  sp.addEventListener('pointerdown', function (e) { sp.setPointerCapture(e.pointerId); pick(e); });
  sp.addEventListener('pointermove', function (e) { if (sp.hasPointerCapture(e.pointerId)) pick(e); });
  addEventListener('resize', drawSpectrum);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawSpectrum);

  /* ================= 3. optics background ================= */
  // Every ray is traced with Snell's law. Glass dispersion is exaggerated so the spectrum is visible.
  var oc = $('#optics'), ox = oc.getContext('2d'), P = { x: .5, sx: .5 }, OW = 0, OH = 0, dark = true;
  var mobile = false;
  function sizeOptics() {
    var d = Math.min(devicePixelRatio || 1, 1.5);
    OW = document.documentElement.clientWidth; OH = innerHeight; mobile = OW < 861;
    oc.width = Math.round(OW * d); oc.height = Math.round(OH * d); ox.setTransform(d, 0, 0, d, 0, 0);
  }
  function edges(pts) { return pts.map(function (p, i) { return { a: p, b: pts[(i + 1) % pts.length], c: p.c }; }); }
  function trace(es, o, d, n, far) {
    var pts = [o], inside = false;
    for (var k = 0; k < 9; k++) {
      var best = 1e9, hit = null;
      for (var i = 0; i < es.length; i++) {
        var e = es[i], ex = e.b.x - e.a.x, ey = e.b.y - e.a.y, den = d.x * ey - d.y * ex;
        if (Math.abs(den) < 1e-9) continue;
        var rx = e.a.x - o.x, ry = e.a.y - o.y, s = (rx * ey - ry * ex) / den, u = (rx * d.y - ry * d.x) / den;
        if (s > .01 && s < best && u >= 0 && u <= 1) { best = s; hit = e; }
      }
      if (!hit) { pts.push({ x: o.x + d.x * far, y: o.y + d.y * far }); return pts; }
      o = { x: o.x + d.x * best, y: o.y + d.y * best }; pts.push(o);
      var N = hit.c ? { x: o.x - hit.c.x, y: o.y - hit.c.y } : { x: -(hit.b.y - hit.a.y), y: hit.b.x - hit.a.x };
      var l = Math.hypot(N.x, N.y); N.x /= l; N.y /= l;
      var c = -(N.x * d.x + N.y * d.y); if (c < 0) { N.x = -N.x; N.y = -N.y; c = -c; }
      var r = inside ? n : 1 / n, q = 1 - r * r * (1 - c * c);
      if (q < 0) { d = { x: d.x + 2 * c * N.x, y: d.y + 2 * c * N.y }; }
      else { var m = r * c - Math.sqrt(q); d = { x: r * d.x + m * N.x, y: r * d.y + m * N.y }; inside = !inside; }
    }
    return pts;
  }
  function hue(q, a) { return 'hsla(' + Math.round(q * 276) + ',95%,' + (dark ? 58 : 50) + '%,' + a.toFixed(3) + ')'; }
  function beamColor(a) { return dark ? 'rgba(255,255,255,' + a + ')' : 'rgba(206,140,20,' + a + ')'; }
  function path(pts, close) { ox.beginPath(); pts.forEach(function (p, i) { if (i) ox.lineTo(p.x, p.y); else ox.moveTo(p.x, p.y); }); if (close) ox.closePath(); }
  function beam(pts, t, col, speed) {
    [[14, .05], [6, .12], [2, .75]].forEach(function (s) { path(pts); ox.lineWidth = s[0]; ox.strokeStyle = col(s[1]); ox.stroke(); });
    ox.setLineDash([34, 150]); ox.lineDashOffset = -t * (speed || 190); path(pts); ox.lineWidth = 4; ox.strokeStyle = col(.9); ox.stroke(); ox.setLineDash([]);
  }
  function glass(pts) {
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    pts.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); });
    var g = ox.createLinearGradient(x0, y0, x1, y1);
    if (dark) { g.addColorStop(0, 'rgba(160,190,255,.30)'); g.addColorStop(.5, 'rgba(120,150,255,.07)'); g.addColorStop(1, 'rgba(190,160,255,.22)'); }
    else { g.addColorStop(0, 'rgba(70,100,210,.26)'); g.addColorStop(.5, 'rgba(90,120,220,.08)'); g.addColorStop(1, 'rgba(110,80,200,.2)'); }
    path(pts, true); ox.fillStyle = g; ox.fill(); ox.lineWidth = 1.5; ox.lineJoin = 'round';
    ox.strokeStyle = dark ? 'rgba(205,220,255,.75)' : 'rgba(50,75,180,.6)'; ox.stroke();
  }
  // a: direction of the ray inside the prism. side: +1 bends light down the screen, -1 bends it up.
  function prism(cx, cy, R, a, side, len, out, alpha, t) {
    var NW = 30, turn = calm ? 0 : Math.sin(t * .45 + cx) * .05 + (P.sx - .5) * .22;
    function tri(b) {
      var u = { x: Math.cos(b), y: Math.sin(b) }, v = { x: -u.y * side, y: u.x * side }, h = R * .866;
      return [{ x: cx - v.x * R, y: cy - v.y * R }, { x: cx + v.x * R / 2 + u.x * h, y: cy + v.y * R / 2 + u.y * h }, { x: cx + v.x * R / 2 - u.x * h, y: cy + v.y * R / 2 - u.y * h }];
    }
    var t0 = tri(a), T3 = tri(a + turn), es = edges(T3), ai = a - side * .35;
    var d = { x: Math.cos(ai), y: Math.sin(ai) }, mid = { x: t0[0].x * .46 + t0[2].x * .54, y: t0[0].y * .46 + t0[2].y * .54 };
    var o = { x: mid.x - d.x * len, y: mid.y - d.y * len }, rays = [];
    for (var i = 0; i <= NW; i++) rays.push(trace(es, o, d, 1.46 + .15 * i / NW, out));
    var gl = ox.createRadialGradient(cx, cy, 0, cx, cy, R * 3.4);
    gl.addColorStop(0, dark ? 'rgba(110,130,255,.20)' : 'rgba(120,140,255,.14)'); gl.addColorStop(1, 'rgba(110,130,255,0)');
    ox.fillStyle = gl; ox.fillRect(cx - R * 3.4, cy - R * 3.4, R * 6.8, R * 6.8);
    for (i = 0; i < NW; i++) {
      var A = rays[i], B = rays[i + 1], k = A.length; if (k !== B.length || k < 4) continue;
      var q = (i + .5) / NW;
      path([A[1], A[k - 2], B[k - 2]], true); ox.fillStyle = hue(q, alpha * 1.1); ox.fill();
      var g = ox.createLinearGradient(A[k - 2].x, A[k - 2].y, A[k - 1].x, A[k - 1].y), sh = .85 + .15 * Math.sin(t * 2 - q * 9);
      g.addColorStop(0, hue(q, Math.min(1, alpha * 2.4 * sh))); g.addColorStop(.25, hue(q, alpha * 1.25 * sh)); g.addColorStop(1, hue(q, 0));
      path([A[k - 2], A[k - 1], B[k - 1], B[k - 2]], true); ox.fillStyle = g; ox.fill();
    }
    beam([o, rays[15][1]], t, beamColor);
    glass(T3);
  }
  // biconvex lens bringing parallel light to a focus
  function lens(x, y, h, t) {
    var Rc = h * 1.25, half = h / 2, dx = Math.sqrt(Rc * Rc - half * half), n = 40, pts = [], i, f;
    var c1 = { x: x + dx, y: y }, c2 = { x: x - dx, y: y }, am = Math.asin(half / Rc);
    for (i = 0; i < n; i++) { f = -am + 2 * am * i / n; pts.push({ x: c2.x + Rc * Math.cos(f), y: y + Rc * Math.sin(f), c: c2 }); }
    for (i = 0; i < n; i++) { f = Math.PI - am + 2 * am * i / n; pts.push({ x: c1.x + Rc * Math.cos(f), y: y + Rc * Math.sin(f), c: c1 }); }
    var es = edges(pts);
    for (i = -4; i <= 4; i++) {
      var r = trace(es, { x: OW + 20, y: y + i * h * .098 }, { x: -1, y: 0 }, 1.52, OW * .62), k = r.length; if (k < 4) continue;
      var col = function (a) { return dark ? 'rgba(110,195,255,' + a + ')' : 'rgba(0,95,190,' + a + ')'; };
      path(r.slice(0, k - 1)); ox.lineWidth = 1.6; ox.strokeStyle = col(.5); ox.stroke();
      var g = ox.createLinearGradient(r[k - 2].x, r[k - 2].y, r[k - 1].x, r[k - 1].y);
      g.addColorStop(0, col(.5)); g.addColorStop(.45, col(.3)); g.addColorStop(1, col(0));
      path([r[k - 2], r[k - 1]]); ox.strokeStyle = g; ox.stroke();
      ox.setLineDash([16, 130]); ox.lineDashOffset = -t * 150; path(r); ox.lineWidth = 2.6; ox.strokeStyle = g; ox.stroke(); ox.setLineDash([]);
    }
    glass(pts);
  }
  // one quiet beam of guided light with a slow pulse
  function guided(y, t) {
    var c = dark ? '150,225,235' : '0,110,130', W = OW, px = ((t * 120) % (W + 500)) - 250;
    var g = ox.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(' + c + ',0)'); g.addColorStop(.5, 'rgba(' + c + ',.4)'); g.addColorStop(1, 'rgba(' + c + ',0)');
    ox.fillStyle = g; ox.fillRect(0, y - .75, W, 1.5);
    var p = ox.createLinearGradient(px - 130, 0, px + 130, 0); p.addColorStop(0, 'rgba(' + c + ',0)'); p.addColorStop(.5, 'rgba(' + c + ',.95)'); p.addColorStop(1, 'rgba(' + c + ',0)');
    ox.fillStyle = p; ox.fillRect(px - 130, y - 1.25, 260, 2.5);
  }
  // double slit: fringes follow cos^2
  function slits(x, y, t) {
    var sep = 11, L = mobile ? 420 : OW * .62, i, col = function (a) { return dark ? 'rgba(255,186,64,' + a.toFixed(3) + ')' : 'rgba(176,100,0,' + a.toFixed(3) + ')'; };
    for (i = 0; i < 9; i++) {
      var wx = ((i * 22 + t * 44) % 198); if (wx > x) continue;
      ox.strokeStyle = col(.4 * wx / 198); ox.lineWidth = 2; path([{ x: x - 198 + wx, y: y - (mobile ? 28 : 54) }, { x: x - 198 + wx, y: y + (mobile ? 28 : 54) }]); ox.stroke();
    }
    for (i = -60; i < 60; i++) {
      var th = i * .011, I = Math.pow(Math.cos(Math.sin(th + .0055) * 26), 2) * Math.exp(-Math.pow(th / .34, 2));
      var g = ox.createLinearGradient(x, y, x + L, y); g.addColorStop(0, col(.05 * I)); g.addColorStop(.12, col(.34 * I)); g.addColorStop(1, col(0));
      path([{ x: x, y: y }, { x: x + L * Math.cos(th), y: y + L * Math.sin(th) }, { x: x + L * Math.cos(th + .012), y: y + L * Math.sin(th + .012) }], true); ox.fillStyle = g; ox.fill();
    }
    ox.strokeStyle = dark ? 'rgba(220,228,255,.85)' : 'rgba(30,45,120,.75)'; ox.lineWidth = 4;
    [[mobile ? -34 : -64, -sep - 4], [-sep + 4, sep - 4], [sep + 4, mobile ? 34 : 64]].forEach(function (s) { path([{ x: x, y: y + s[0] }, { x: x, y: y + s[1] }]); ox.stroke(); });
  }
  // Michelson interferometer with a red laser. The output arm runs down to a fringe detector.
  function michelson(y, bx, mx, dy, t) {
    var col = function (a) { return dark ? 'rgba(255,74,84,' + a + ')' : 'rgba(200,25,45,' + a + ')'; };
    var up = y - (mobile ? 24 : 44), s = mobile ? 11 : 19, i;
    beam([{ x: 0, y: y }, { x: bx, y: y }], t, col, 190);
    beam([{ x: bx, y: y }, { x: mx, y: y }], t, col, 150);
    beam([{ x: bx, y: y }, { x: bx, y: up }], t, col, 150);
    beam([{ x: bx, y: y }, { x: bx, y: dy }], t, col, 120);
    var edge = dark ? 'rgba(225,232,255,.85)' : 'rgba(40,45,110,.7)';
    ox.fillStyle = dark ? 'rgba(150,180,255,.22)' : 'rgba(80,110,220,.2)'; ox.strokeStyle = edge; ox.lineWidth = 1.4;
    ox.beginPath(); ox.rect(bx - s, y - s, s * 2, s * 2); ox.fill(); ox.stroke();
    path([{ x: bx - s, y: y + s }, { x: bx + s, y: y - s }]); ox.stroke();
    ox.lineWidth = 5; path([{ x: mx, y: y - s * 1.3 }, { x: mx, y: y + s * 1.3 }]); ox.stroke();
    path([{ x: bx - s * 1.3, y: up }, { x: bx + s * 1.3, y: up }]); ox.stroke();
    var w = mobile ? 13 : 26;
    for (i = -w; i < w; i += 2) {
      var I = Math.pow(Math.cos(i * (mobile ? .42 : .24) + t * 1.4), 2);
      ox.fillStyle = col((.1 + .85 * I).toFixed(2)); ox.fillRect(bx + i, dy, 2, mobile ? 9 : 16);
    }
    ox.lineWidth = 1.2; ox.strokeStyle = edge; ox.strokeRect(bx - w, dy, w * 2, mobile ? 9 : 16);
  }
  var heroEl = $('.hero'), stageEl = $('#stage'), secs = {}, colsEl = $('#background .cols');
  $$('.sec').forEach(function (s) { secs[s.id] = s; });
  function drawOptics(t) {
    var light = root.dataset.theme === 'light', W = OW, L = Math.min(W, 1240), x0 = (W - L) / 2;
    ox.clearRect(0, 0, W, OH); P.sx += (P.x - P.sx) * .06;
    function scene(el, reach, fn) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -reach || r.top > OH + reach) return;
      dark = el === heroEl || !light; ox.globalCompositeOperation = dark ? 'lighter' : 'source-over'; fn(r);
    }
    scene(heroEl, 0, function (r) {
      var s = stageEl.getBoundingClientRect();
      ox.save(); ox.beginPath(); ox.rect(0, r.top, W, r.height); ox.clip();
      if (mobile) prism(W * .2, s.top + 44, 34, .1, 1, W, W * 1.5, .16, t);
      else prism(s.left + s.width * .13, s.top + s.height * .14, 52, .3, -1, 900, W * .85, .27, t);
      ox.restore();
    });
    scene(secs.about, 300, function (r) { if (mobile) prism(W * .8, r.top + 40, 26, .34, 1, W, W, .13, t); else prism(x0 + L * .6, r.top + 62, 42, .33, 1, W, W * .85, .13, t); });
    scene(secs.research, 200, function (r) { if (mobile) lens(W * .78, r.top + 46, 78, t); else lens(x0 + L * .78, r.top + 104, 176, t); });
    scene(secs.papers, 200, function (r) { guided(r.top + (mobile ? 44 : 68), t); });
    scene(secs.teaching, 400, function (r) { slits(mobile ? 46 : x0 + 96, r.top + (mobile ? 46 : 345), t); });
    scene(secs.background, 300, function (r) { if (mobile) michelson(r.top + 36, W * .74, W * .93, r.top + 62, t); else { var c = colsEl.getBoundingClientRect(); michelson(r.top + 64, c.left + c.width / 2, c.right - 10, c.bottom - 6, t); } });
    scene(secs.contact, 300, function (r) { if (mobile) prism(W * .3, r.bottom - 60, 40, 0, -1, W, W * 1.4, .16, t); else prism(x0 + L * .62, r.bottom - 84, 70, -.34, -1, W, W, .26, t); });
    ox.globalCompositeOperation = 'source-over';
  }
  addEventListener('resize', sizeOptics);
  addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') P.x = e.clientX / innerWidth; });

  /* ================= 3D shared ================= */
  var T = window.THREE, gl3 = false;
  try { var tc = document.createElement('canvas'); gl3 = !!(T && (tc.getContext('webgl2') || tc.getContext('webgl'))); } catch (e) {}

  var VERT = 'varying vec3 vN,vV,vP;void main(){vP=position;vec4 m=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-m.xyz);gl_Position=projectionMatrix*m;}';
  var JET = 'vec3 jet(float t){return clamp(vec3(1.5)-abs(4.*t-vec3(3.,2.,1.)),0.,1.);}';
  function glassMat(tint) {
    return new T.ShaderMaterial({
      uniforms: { tint: { value: new T.Color(tint) } }, vertexShader: VERT, transparent: true, depthWrite: false, side: T.DoubleSide,
      fragmentShader: 'uniform vec3 tint;varying vec3 vN,vV,vP;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),1.6);vec3 c=mix(tint*.55,vec3(.75,.9,1.),f*.75);gl_FragColor=vec4(c,.07+.42*f);}'
    });
  }
  function circle(path, x, y, r) { path.absarc(x, y, r, 0, Math.PI * 2, true); return path; }
  function oblong(x0, y0, x1, y1, r) {
    var a = Math.atan2(y1 - y0, x1 - x0), p = new T.Path();
    p.absarc(x1, y1, r, a + Math.PI / 2, a - Math.PI / 2, true);
    p.absarc(x0, y0, r, a - Math.PI / 2, a - Math.PI * 1.5, true);
    p.closePath(); return p;
  }
  function extrude(shape, depth, mats, seg) {
    var g = new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false, curveSegments: seg || 28 });
    g.translate(0, 0, -depth); return new T.Mesh(g, mats);
  }
  function gold() { return new T.MeshPhongMaterial({ color: 0xd99a1e, specular: 0xfff0b0, shininess: 60, emissive: 0x6b4300 }); }
  function lights(s) {
    s.add(new T.AmbientLight(0xffffff, .6));
    var k = new T.DirectionalLight(0xffffff, .9); k.position.set(-3, 6, 8); s.add(k);
  }
  // D-shaped fiber. Units: 1 = 10 um. R = 26, flat at D = 11, pitch 9, hole r = 2, slots 5 x 14 at 60 deg.
  var HEX = .7794;
  function dShape() {
    var s = new T.Shape(), a = Math.asin(11 / 26);
    s.absarc(0, 0, 2.6, Math.PI - a, Math.PI * 2 + a, false); s.closePath();
    var pts = [[-1.8, HEX], [1.8, HEX], [-2.25, 0], [-1.35, 0], [1.35, 0], [2.25, 0],
      [-1.8, -HEX], [-.9, -HEX], [0, -HEX], [.9, -HEX], [1.8, -HEX],
      [-1.35, -2 * HEX], [-.45, -2 * HEX], [.45, -2 * HEX], [1.35, -2 * HEX], [0, -3 * HEX]];
    pts.forEach(function (p) { s.holes.push(circle(new T.Path(), p[0], p[1], .2)); });
    s.holes.push(oblong(-.45, 0, -.9, HEX, .25)); s.holes.push(oblong(.45, 0, .9, HEX, .25));
    return s;
  }
  function film(len, g) {
    var parts = [[.085, 0xd99a1e, 0x6b4300], [.05, 0x7a3b16, 0x2a1003], [.04, 0xd2691e, 0x4a1c00]], y = 1.1, out = [];
    parts.forEach(function (p) {
      var m = new T.Mesh(new T.BoxGeometry(1.8, p[0], len), new T.MeshPhongMaterial({ color: p[1], emissive: p[2], specular: 0xffe9b0, shininess: 70 }));
      m.position.set(0, y + p[0] / 2, -len / 2); y += p[0]; g.add(m); out.push(m);
    });
    return out;
  }

  /* ================= 4. hero fiber ================= */
  var hero = null;
  function buildHero() {
    var cv = $('#fiber'), stage = $('#stage'), r;
    r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    var scene = new T.Scene(), cam = new T.PerspectiveCamera(34, 1, .1, 60), g = new T.Group();
    scene.add(g); lights(scene);
    var LEN = 13, U = { c: { value: 0 }, t: { value: 0 }, col: { value: new T.Color(0x58d9f2) } };

    var cap = new T.ShaderMaterial({
      uniforms: U, vertexShader: VERT, side: T.DoubleSide,
      fragmentShader: 'uniform float c,t;varying vec3 vN,vV,vP;' + JET +
        'void main(){vec2 p=vP.xy*10.;' +
        'float core=exp(-p.x*p.x/(2.*2.5*2.5))*exp(-pow((p.y-4.6)/3.6,2.));' +
        'float spp=exp(-abs(p.y-11.)/1.7)*exp(-p.x*p.x/(2.*36.));' +
        'float i=core*(1.-.58*c)+spp*c*1.5;i*=.94+.06*sin(t*5.);i=clamp(i,0.,1.);' +
        'vec3 base=mix(vec3(.07,.11,.40),vec3(.12,.19,.56),smoothstep(-26.,11.,p.y));' +
        'vec3 f=jet(.13+.82*i);gl_FragColor=vec4(mix(base,f,smoothstep(.03,.3,i)),1.);}'
    });
    var body = extrude(dShape(), LEN, [cap, glassMat(0x4a68ff)], 36);
    body.renderOrder = 2; g.add(body);
    var layers = film(LEN, g);

    // guided light in the core, fading along the fiber as it couples out
    var beam = new T.Mesh(new T.CylinderGeometry(.3, .3, LEN, 28, 60, true), new T.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      vertexShader: 'varying vec3 vN,vV;varying float z;void main(){z=position.y;vec4 m=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-m.xyz);gl_Position=projectionMatrix*m;}',
      fragmentShader: 'uniform float c,t;uniform vec3 col;varying vec3 vN,vV;varying float z;void main(){float s=abs(dot(normalize(vN),normalize(vV)));float d=6.5-z;float pulse=pow(.5+.5*cos(d*2.1-t*5.),4.);float a=pow(s,1.5)*(.28+.95*pulse)*exp(-d*(.04+.5*c));gl_FragColor=vec4(col,a);}'
    }));
    beam.rotation.x = Math.PI / 2; beam.position.set(0, .48, -LEN / 2); beam.renderOrder = 1; g.add(beam);

    // surface plasmon wave on the film
    var spp = new T.Mesh(new T.PlaneGeometry(1.8, LEN, 26, 300), new T.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
      vertexShader: 'uniform float c,t;varying float h,e,d;void main(){d=6.5-position.y;e=exp(-position.x*position.x*2.2);h=sin(d*5.2-t*6.);vec3 p=position;p.z+=.04+(.5+.5*h)*.34*c*e;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',
      fragmentShader: 'uniform float c;varying float h,e,d;void main(){vec3 col=mix(vec3(1.,.42,.1),vec3(1.,.9,.5),.5+.5*h);gl_FragColor=vec4(col,c*e*(.22+.6*(.5+.5*h))*exp(-d*.05));}'
    }));
    spp.rotation.x = -Math.PI / 2; spp.position.set(0, 1.28, -LEN / 2); spp.renderOrder = 4; g.add(spp);

    // sample drifting over the film
    var N = 30, cellMat = new T.MeshPhongMaterial({ color: 0xff7a63, transparent: true, opacity: .85, shininess: 40, emissive: 0x401008 });
    var inst = new T.InstancedMesh(new T.IcosahedronGeometry(1, 2), cellMat, N), seeds = [], dummy = new T.Object3D();
    for (var i = 0; i < N; i++) seeds.push({ x: (Math.random() - .5) * 2, y: 1.75 + Math.random() * .75, z: Math.random() * LEN, s: .05 + Math.random() * .075, p: Math.random() * 6 });
    inst.frustumCulled = false; g.add(inst);

    var view = { yaw: -.62, pitch: .24, ty: -.62, tp: .24, drag: null };
    cv.addEventListener('pointerdown', function (e) { view.drag = { x: e.clientX, y: e.clientY, yaw: view.ty, pitch: view.tp }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) {
      if (!view.drag) return;
      view.ty = Math.max(-1.25, Math.min(1.1, view.drag.yaw + (e.clientX - view.drag.x) * .006));
      view.tp = Math.max(-.12, Math.min(.85, view.drag.pitch + (e.clientY - view.drag.y) * .005));
    });
    ['pointerup', 'pointercancel'].forEach(function (n) { cv.addEventListener(n, function () { view.drag = null; }); });

    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight; if (!w) return;
      r.setSize(w, h, false); cam.aspect = w / h;
      cam.position.set(0, 0, w < 620 ? 14.2 : 12.2); cam.updateProjectionMatrix();
    }
    addEventListener('resize', resize); resize();

    var anchors = { film: new T.Vector3(.9, 1.3, -3.2), core: new T.Vector3(0, .48, 0), hole: new T.Vector3(-1.35, -2 * HEX, 0) };
    var offs = { film: [70, 6], core: [-176, -4], hole: [-190, 30] };
    var tags = $$('.tag', stage), v = new T.Vector3();
    var A = new T.Color(0x58d9f2), B = new T.Color(0xffc145), C = new T.Color(0xff5a41);
    var hotC = new T.Color(0xff7a63), coolC = new T.Color(0x58d9f2);

    hero = { on: true, draw: function (t) {
      var c = coupling(), q = (S.lam - LMIN) / (LMAX - LMIN);
      U.c.value += (c - U.c.value) * .25; U.t.value = t;
      if (q < .5) U.col.value.copy(A).lerp(B, q * 2); else U.col.value.copy(B).lerp(C, q * 2 - 1);
      layers[0].material.emissive.setRGB(.42 + .58 * c, .26 + .36 * c, .03 + .05 * c);
      layers[2].material.emissive.setRGB(.3 + .6 * c, .11 + .22 * c, .02);
      cellMat.color.lerp(S.sample ? hotC : coolC, .12);
      cellMat.emissive.copy(cellMat.color).multiplyScalar(.28);
      for (var i = 0; i < N; i++) {
        var s = seeds[i], z = -((s.z + t * .35) % LEN);
        dummy.position.set(s.x * .8 + Math.sin(t * .7 + s.p) * .07, s.y + Math.sin(t * .9 + s.p * 2) * .07, z);
        dummy.scale.setScalar(s.s); dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      view.yaw += (view.ty + (calm || view.drag ? 0 : Math.sin(t * .35) * .07) - view.yaw) * .08;
      view.pitch += (view.tp - view.pitch) * .08;
      g.rotation.set(view.pitch, view.yaw, 0);
      g.position.set(cam.aspect < 1.15 ? -1.0 : -1.75, -.15, 1.0);
      cam.lookAt(0, 0, 0); r.render(scene, cam);
      var w = stage.clientWidth, h = stage.clientHeight;
      tags.forEach(function (el) {
        var k = el.dataset.anchor, m = w < 620 ? .55 : 1, o = k === 'film' && m < 1 ? [0, 150] : offs[k];
        v.copy(anchors[k]).applyMatrix4(g.matrixWorld).project(cam);
        var x = (v.x * .5 + .5) * w + o[0] * m, y = (-v.y * .5 + .5) * h + o[1] * m;
        x = Math.max(10, Math.min(w - el.offsetWidth - 14, x));
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; el.style.opacity = 1;
      });
    } };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { hero.on = es[0].isIntersecting; }).observe(stage);
  }

  /* ================= 5. paper models ================= */
  var minis = [], mini = null;
  function buildMinis() {
    var r = new T.WebGLRenderer({ antialias: true, alpha: true });
    r.setSize(720, 560, false); r.setPixelRatio(1);
    var cam = new T.PerspectiveCamera(30, 720 / 560, .1, 60); cam.position.set(0, 0, 15.6); cam.lookAt(0, 0, 0);
    var LEN = 4.4;
    function capMat(col, glows) {
      // glows: list of [x, y, sx, sy] field spots
      var n = glows.length, list = glows.map(function (s) { return new T.Vector4(s[0], s[1], s[2], s[3]); });
      return new T.ShaderMaterial({
        uniforms: { base: { value: new T.Color(col) }, g: { value: list }, t: { value: 0 } }, vertexShader: VERT, side: T.DoubleSide,
        fragmentShader: 'uniform vec3 base;uniform vec4 g[' + n + '];uniform float t;varying vec3 vN,vV,vP;' + JET +
          'void main(){float i=0.;for(int k=0;k<' + n + ';k++){vec2 d=(vP.xy-g[k].xy)/g[k].zw;i+=exp(-dot(d,d));}i=clamp(i*(.82+.18*sin(t*2.2)),0.,1.);gl_FragColor=vec4(mix(base,jet(.13+.82*i),smoothstep(.04,.34,i)),1.);}'
      });
    }
    function tube(ro, ri, len, mat) {
      var s = new T.Shape(); s.absarc(0, 0, ro, 0, Math.PI * 2, false); s.holes.push(circle(new T.Path(), 0, 0, ri));
      return extrude(s, len, mat, 64);
    }
    function sector(pts) { var p = new T.Path(); pts(p); p.closePath(); return p; }

    var build = {
      dshape: function (g) {
        var m = capMat(0x1d2f86, [[0, .46, .3, .36], [0, 1.05, .6, .1]]);
        g.add(extrude(dShape(), LEN, [m, glassMat(0x4a68ff)])); film(LEN, g); return m;
      },
      dshape2: function (g) {
        var m = capMat(0x2a3a5f, [[0, .42, .3, .4]]);
        g.add(extrude(dShape(), LEN, [m, glassMat(0x6fa8c8)])); film(LEN, g);
        g.add(tube(2.95, 2.88, LEN, glassMat(0x2fbf8a))); return m;
      },
      scf: function (g) {
        // 125 um cladding, Ge-doped elliptical core 19.8 x 9 um, channels 2 x 100 deg and 2 x 60 deg. 1 unit = 24 um
        var k = 1 / 24, R = 62.5 * k, q = 56 * k, s = new T.Shape(); s.absarc(0, 0, R, 0, Math.PI * 2, false);
        function rad(d) { return d * Math.PI / 180; }
        [1, -1].forEach(function (f) {
          s.holes.push(sector(function (p) { p.moveTo(-7.5 * k, f * 6 * k); p.lineTo(7.5 * k, f * 6 * k); if (f > 0) p.absarc(0, 0, q, rad(40), rad(140), false); else p.absarc(0, 0, q, rad(-40), rad(-140), true); }));
          s.holes.push(sector(function (p) { p.moveTo(f * 12.4 * k, -4 * k); p.lineTo(f * 12.4 * k, 4 * k); if (f > 0) p.absarc(0, 0, q, rad(30), rad(-30), true); else p.absarc(0, 0, q, rad(150), rad(210), false); }));
        });
        var m = capMat(0x1f5f96, [[0, 0, .34, .16]]);
        g.add(extrude(s, LEN, [m, glassMat(0x3f9ae0)], 40));
        [[0, 6.6, 9, 1.4], [0, -6.6, 9, 1.4], [13, 0, 1.4, 7], [-13, 0, 1.4, 7]].forEach(function (b) {
          var x = new T.Mesh(new T.BoxGeometry(b[2] * k, b[3] * k, LEN + .02), gold()); x.position.set(b[0] * k, b[1] * k, -LEN / 2); g.add(x);
        });
        return m;
      },
      diamond: function (g) {
        // 27 holes: 24 large, 3 small, gold-coated. Coordinates traced from Fig. 1 of the paper.
        var k = 1 / 34, s = new T.Shape(); s.absarc(0, 0, 75 * k, 0, Math.PI * 2, false);
        var big = [[0, 64], [0, -64], [64, 0], [-64, 0]];
        [48, -48, 16, -16].forEach(function (y) { [-48, -16, 16, 48].forEach(function (x) { big.push([x, y]); }); });
        [32, -32].forEach(function (y) { big.push([-32, y]); big.push([32, y]); });
        big.forEach(function (p) { s.holes.push(circle(new T.Path(), p[0] * k, p[1] * k, 6.6 * k)); });
        [0, 32, -32].forEach(function (y) { s.holes.push(circle(new T.Path(), 0, y * k, 4.9 * k)); });
        var m = capMat(0x2c5a3c, [[-32 * k, 0, .34, .3], [32 * k, 0, .34, .3]]);
        g.add(extrude(s, LEN, [m, glassMat(0x7fc46a)]));
        g.add(tube(77.5 * k, 75 * k, LEN, gold()));
        g.add(tube(96 * k, 94.5 * k, LEN, glassMat(0xffd85a))); return m;
      },
      biref: function (g) {
        // Dual-side polished, 32 large and 8 small holes, 0.52 x 0.8 um core hole, four gold nanowires.
        var k = 1 / 44, R = 98, cut = 62, a = Math.asin(cut / R), s = new T.Shape();
        s.absarc(0, 0, R * k, -a, a, false); s.absarc(0, 0, R * k, Math.PI - a, Math.PI + a, false); s.closePath();
        [1, -1].forEach(function (u) { [1, -1].forEach(function (w) {
          [[69, 53], [53, 53], [36, 53], [69, 37], [53, 37], [36, 37], [69, 20.5], [53, 20.5]].forEach(function (p) {
            s.holes.push(circle(new T.Path(), u * p[0] * k, w * p[1] * k, 6.8 * k));
          });
        }); });
        [[69, 0], [53, 0], [-69, 0], [-53, 0], [0, 53], [0, 37], [0, -53], [0, -37]].forEach(function (p) { s.holes.push(circle(new T.Path(), p[0] * k, p[1] * k, 2.6 * k)); });
        s.holes.push(sector(function (p) { p.moveTo(-4 * k, -6 * k); p.lineTo(-4 * k, 6 * k); p.lineTo(4 * k, 6 * k); p.lineTo(4 * k, -6 * k); }));
        var m = capMat(0x3a2f96, [[0, 0, .5, .34]]);
        g.add(extrude(s, LEN, [m, glassMat(0x8a78ff)]));
        [[0, 70], [0, -70], [106, 0], [-106, 0]].forEach(function (p) {
          var w = new T.Mesh(new T.CylinderGeometry(7.6 * k, 7.6 * k, LEN, 20), gold()); w.rotation.x = Math.PI / 2; w.position.set(p[0] * k, p[1] * k, -LEN / 2); g.add(w);
        });
        return m;
      }
    };

    $$('.model').forEach(function (el, i) {
      var sc = new T.Scene(), g = new T.Group(), inner = new T.Group(); lights(sc); sc.add(g); g.add(inner); inner.position.z = LEN / 2;
      var mat = build[el.dataset.model](inner);
      var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); el.appendChild(c); el.classList.add('live');
      var it = { el: el, cv: c, cx: c.getContext('2d'), sc: sc, g: g, mat: mat, on: i < 2, ph: i * 1.3 };
      minis.push(it);
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { it.on = es[0].isIntersecting; }, { rootMargin: '80px' }).observe(el);
      else it.on = true;
    });

    mini = function (t) {
      minis.forEach(function (it) {
        if (!it.on) return;
        var w = it.el.clientWidth, h = it.el.clientHeight; if (!w || !h) return;
        var d = Math.min(devicePixelRatio || 1, 2), cw = Math.round(w * d), ch = Math.round(h * d);
        if (it.cv.width !== cw || it.cv.height !== ch) { it.cv.width = cw; it.cv.height = ch; }
        it.mat.uniforms.t.value = t + it.ph;
        it.g.rotation.set(.24 + .08 * Math.sin(t * .5 + it.ph), .6 * Math.sin(t * .42 + it.ph) + .12, 0);
        it.g.position.set(0, 0, 0);
        r.render(it.sc, cam);
        var k = Math.max(cw / 720, ch / 560) * (cw / ch > 1.9 ? .72 : .94), dw = 720 * k, dh = 560 * k;
        it.cx.clearRect(0, 0, cw, ch);
        it.cx.drawImage(r.domElement, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      });
    };
  }

  /* ================= run ================= */
  if (gl3) {
    try { buildHero(); } catch (e) { hero = null; }
    try { buildMinis(); } catch (e) { mini = null; minis.forEach(function (m) { m.el.classList.remove('live'); m.cv.remove(); }); }
  }
  if (!hero) { $('#fiber').hidden = true; $('.stage-fallback').hidden = false; $('.hint').hidden = true; }
  sizeOptics(); setPlay(S.playing); sync();

  var last = 0, frame = 0, time = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(.05, (now - last) / 1000 || 0); last = now; frame++;
    if (!calm) time += dt;
    if (S.playing) {
      S.phase += dt * .62; S.lam = LMIN + (LMAX - LMIN) * (1 - Math.cos(S.phase)) / 2;
      if (!hero || hero.on || frame % 2) tick2d();
    }
    if (hero && hero.on) hero.draw(time);
    if (mini && frame % 2) mini(time);
    drawOptics(time);
  }
  requestAnimationFrame(loop);
})();
