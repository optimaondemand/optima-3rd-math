# patch1201: 3.12.01 Circles. Run after patch1107 on sb.src.js, assets/storybook/sb.js and assets/storybook/sb.css.
#   python3 patch1201.py tools/storybook/sb.src.js assets/storybook/sb.js assets/storybook/sb.css
# New model `circ` (a paper circle and a compass), data-do picks the job:
#   fold    : Fold in half / Fold a different way (creases), tap where they cross (center), Measure to 3 edge dots.
#             data-r (the radius shown, e.g. 11). Flags fold1, fold2, center, measured.
#   parts   : drag the labels center, radius, diameter onto their spots. Flag labels.
#   ben     : one radius drawn (data-r); drag the end of a second radius around until the two make a straight line. Flag line.
#   chord   : a line across that misses the center (data-len); drag its end until it goes through the center. Flag through.
#   compass : open the compass on the 1-cm grid (the tools-site Compass look) to data-t (cm/in, data-u), then drag the pencil all the way around. Flags open, drawn.
#             data-given "d:21" pre-draws a second circle (diameter 21) to compare.
#             data-euclid "1": after circle A, drag the compass point onto the gold dot on A's edge (flag moved),
#             swing circle B (flag drawn2), tap the top point where the circles cross (flag cross).
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── circ (3.12.01 circles): paper circle, parts, a compass. data-do fold | parts | ben | chord | compass. See patch1201.py ── */
  MODS.circ = function (box) {
    var name = box.dataset.name || 'circ', DO = box.dataset.do || 'fold', U = box.dataset.u || 'cm', R = +box.dataset.r || 11, T = +box.dataset.t || R;
    var GIV = (box.dataset.given || '').split(':'), EUC = !!box.dataset.euclid, MX = +box.dataset.max || Math.max(T + 6, 20);
    var S = mstate(name, { f: 0, c: 0, m: 0, at: {}, a: DO === 'ben' ? 90 : DO === 'chord' ? null : 0, r: 1, sw: 0, d: 0, mv: 0, sw2: 0, d2: 0, x: 0 });
    var GOLD = '#C9A227', NAVY = '#0E1C42', PAPER = '#FBF6EA', EDGE = '#8A6A2E', GREEN = '#1E7A4C', RED = '#B23A2E', BLUE = '#1E8C5A', VIO = '#6B46C1';
    box.innerHTML = '<div class="sb-stage sb-ci"><div class="ci-btns"></div><svg viewBox="0 0 700 460" role="group"></svg><div class="bm-chips ci-chips"></div></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.ci-btns', box), chips = $('.ci-chips', box), sel = null, busy = false, F = 1;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + GREEN + '">' + h + '</span>' : h; }
    function P(cx, cy, r, deg) { var a = deg * Math.PI / 180; return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }; }
    function ang(cx, cy, p) { var a = Math.atan2(cy - p.y, p.x - cx) * 180 / Math.PI; return (a + 360) % 360; }
    function pill(x, y, t, col, cls) { var g = NS('g', { class: cls || '', 'pointer-events': 'none' }, svg), w = (String(t).length * 9.5 + 18) * F, h = 30 * F; x = Math.max(w / 2 + 10, Math.min(690 - w / 2, x)); NS('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill: '#fff', stroke: col || NAVY, 'stroke-width': 2 }, g); NS('text', { x: x, y: y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, 'font-weight': 900, fill: col || NAVY, text: t }, g); return g; }
    function disc(cx, cy, r) { NS('circle', { cx: cx, cy: cy, r: r, fill: PAPER, stroke: EDGE, 'stroke-width': 3 }, svg); }
    function dot(x, y, col, rr) { return NS('circle', { cx: x, cy: y, r: rr || 6, fill: col || NAVY, 'pointer-events': 'none' }, svg); }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    var CX = 350, CY = 230, PR = 165;

    /* fold: find the center by folding */
    function drawFold(folding) {
      svg.innerHTML = ''; btns.innerHTML = ''; svg.setAttribute('viewBox', F > 1 ? '0 -55 700 570' : '0 0 700 460'); svg.setAttribute('aria-label', 'A paper circle' + (S.f ? ' with ' + S.f + ' fold line' + (S.f > 1 ? 's' : '') : '') + (S.c ? '. The center is marked' : ''));
      var C1 = 0, C2 = 62;
      if (folding) {
        var base = folding === 1 ? C1 : C2, a1 = P(CX, CY, PR, base), a2 = P(CX, CY, PR, base + 180);
        NS('circle', { cx: CX, cy: CY, r: PR, fill: 'none', stroke: '#D8C9A3', 'stroke-width': 2, 'stroke-dasharray': '6 6' }, svg);
        NS('path', { d: 'M' + a1.x + ' ' + a1.y + ' A' + PR + ' ' + PR + ' 0 0 1 ' + a2.x + ' ' + a2.y + ' Z', fill: '#EFE3C4', stroke: EDGE, 'stroke-width': 3 }, svg);
        NS('line', { x1: a1.x, y1: a1.y, x2: a2.x, y2: a2.y, stroke: EDGE, 'stroke-width': 3 }, svg);
        return;
      }
      disc(CX, CY, PR);
      [C1, C2].slice(0, S.f).forEach(function (b) { var a = P(CX, CY, PR, b), c = P(CX, CY, PR, b + 180); NS('line', { x1: a.x, y1: a.y, x2: c.x, y2: c.y, stroke: '#B79A5C', 'stroke-width': 2.5, 'stroke-dasharray': '7 6', 'pointer-events': 'none' }, svg); });
      var EDOTS = [118, 208, 302];
      if (S.c) {
        dot(CX, CY, NAVY, 7);
        EDOTS.forEach(function (d, i) {
          var e = P(CX, CY, PR, d); if (i < S.m) { NS('line', { x1: CX, y1: CY, x2: e.x, y2: e.y, stroke: BLUE, 'stroke-width': 4, 'pointer-events': 'none' }, svg); var lp = P(CX, CY, PR + 44 * F, d); pill(lp.x, lp.y, R + ' ' + U, BLUE); }
          dot(e.x, e.y, i < S.m ? BLUE : GOLD, 8);
        });
      }
      if (S.f >= 2 && !S.c) {
        var hit = NS('rect', { x: CX - PR, y: CY - PR, width: 2 * PR, height: 2 * PR, fill: 'transparent', class: 'ci-tapc', role: 'button', tabindex: 0, 'aria-label': 'The paper circle. Tap where the two folds cross.', style: 'cursor:pointer' }, svg);
        hit.addEventListener('click', function (e) { var p = svgPt(svg, e), d = Math.hypot(p.x - CX, p.y - CY); if (d < 22 * F) { S.c = 1; save(); pluck(HZ.C5); flag(box, 'center'); drawFold(); msg('✓ Found it! The two folds cross at the center of the circle.', true); } else { pluck(HZ.D4); msg('That spot is not where the two folds cross. Look for the point that is on both dashed lines.'); } });
        hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.c = 1; save(); flag(box, 'center'); drawFold(); msg('✓ Found it! The two folds cross at the center of the circle.', true); } });
      }
      var b1 = btn('📄 Fold in half', 'ci-fold' + (S.f === 0 ? ' ci-next' : ''), function () { doFold(1); }, S.f !== 0 || busy);
      var b2 = btn('📄 Fold a different way', 'ci-fold2' + (S.f === 1 ? ' ci-next' : ''), function () { doFold(2); }, S.f !== 1 || busy);
      var b3 = btn('📏 Measure to the next dot', 'ci-meas' + (S.c && S.m < 3 ? ' ci-next' : ''), function () { if (S.m >= 3) return; S.m++; save(); pluck(HZ.E4 + S.m * 40); drawFold(); if (S.m === 3) { flag(box, 'measured'); msg('✓ All 3 lines from the center to the edge are ' + R + ' ' + U + '.', true); } else msg('This line from the center to the edge is ' + R + ' ' + U + '.'); }, !S.c || S.m >= 3);
      if (S.f >= 1) flag(box, 'fold1'); if (S.f >= 2) flag(box, 'fold2'); if (S.c) flag(box, 'center'); if (S.m >= 3) flag(box, 'measured');
    }
    function doFold(n) {
      if (busy || S.f !== n - 1) return; busy = true; pluck(HZ.G4); drawFold(n);
      setTimeout(function () { busy = false; S.f = n; save(); drawFold(); msg(n === 1 ? 'Folded in half and opened again. The fold left a line.' : 'Now there are two fold lines. They cross at one point.'); }, reduced ? 60 : 700);
    }

    /* parts: drag the labels onto the circle */
    var PARTS = { center: { d: 'The center is one point: the dot in the middle.' }, radius: { d: 'A radius goes from the center to the edge.' }, diameter: { d: 'A diameter goes all the way across, through the center.' } };
    function drawParts() {
      svg.innerHTML = ''; svg.setAttribute('viewBox', '0 0 700 460'); svg.setAttribute('aria-label', 'A circle with a dot in the middle, one line from the dot to the edge, and one line all the way across. Three spots for labels.');
      disc(CX, CY, PR - 10); var r = PR - 10, ra = P(CX, CY, r, 58), d1 = P(CX, CY, r, 165), d2 = P(CX, CY, r, 345);
      NS('line', { x1: d1.x, y1: d1.y, x2: d2.x, y2: d2.y, stroke: VIO, 'stroke-width': 5, 'pointer-events': 'none' }, svg);
      NS('line', { x1: CX, y1: CY, x2: ra.x, y2: ra.y, stroke: BLUE, 'stroke-width': 5, 'pointer-events': 'none' }, svg);
      dot(CX, CY, NAVY, 8);
      var SW = 124 * (F > 1 ? 1.6 : 1), SH = 40 * (F > 1 ? 1.5 : 1), SP = { center: { x: Math.max(95, SW / 2 + 8), y: F > 1 ? 36 : 70, to: { x: CX, y: CY } }, radius: { x: Math.min(600, 692 - SW / 2), y: F > 1 ? 36 : 70, to: P(CX, CY, r * .6, 58) }, diameter: { x: Math.min(610, 692 - SW / 2), y: F > 1 ? 424 : 400, to: P(CX, CY, r * .75, 345) } };
      Object.keys(SP).forEach(function (k) {
        var s = SP[k]; NS('line', { x1: s.x, y1: s.y, x2: s.to.x, y2: s.to.y, stroke: '#8792A8', 'stroke-width': 1.5, 'stroke-dasharray': '4 4', 'pointer-events': 'none' }, svg);
        NS('circle', { cx: s.to.x, cy: s.to.y, r: 4, fill: '#8792A8', 'pointer-events': 'none' }, svg);
        var g = NS('g', { class: 'ci-slot' + (S.at[k] ? ' full' : sel ? ' open' : ''), 'data-k': k, role: 'button', tabindex: 0, 'aria-label': S.at[k] ? k : 'Empty label spot' }, svg);
        NS('rect', { x: s.x - SW / 2, y: s.y - SH / 2, width: SW, height: SH, rx: 12, fill: S.at[k] ? '#E8F5EE' : '#fff', stroke: S.at[k] ? GREEN : sel ? GOLD : '#8792A8', 'stroke-width': 2.5, 'stroke-dasharray': S.at[k] ? '' : '6 4' }, g);
        NS('text', { x: s.x, y: s.y + 6 * F, 'text-anchor': 'middle', 'font-size': (S.at[k] ? 19 : 14) * F, 'font-weight': 900, fill: S.at[k] ? GREEN : '#8792A8', text: S.at[k] ? k : 'drop here', 'pointer-events': 'none' }, g);
        function go() { if (sel) place(sel, k); }
        g.addEventListener('click', go); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      chips.innerHTML = ''; var first = true;
      ['diameter', 'center', 'radius'].forEach(function (k) {
        if (S.at[k]) return; var c = el('button', 'bm-chip ci-chip' + (first ? ' ci-next' : '') + (sel === k ? ' sel' : ''), k); first = false; c.type = 'button'; c.dataset.k = k; chips.appendChild(c);
        hdrag(c, function (t) { var s = t && t.closest && t.closest('.ci-slot'); if (s && box.contains(s)) place(k, s.getAttribute('data-k')); }, function () { sel = sel === k ? null : k; msg(sel ? 'Now tap the spot where "' + k + '" goes.' : ''); drawParts(); });
      });
      if (Object.keys(PARTS).every(function (k) { return S.at[k]; })) flag(box, 'labels');
    }
    function place(c, k) {
      if (S.at[k]) return;
      if (c !== k) { pluck(HZ.D4); msg('Not that spot. ' + PARTS[c].d); return; }
      S.at[k] = 1; sel = null; save(); pluck(HZ.C5); drawParts();
      if (Object.keys(PARTS).every(function (x) { return S.at[x]; })) msg('✓ Every label is on its part.', true); else msg('✓ Yes. ' + PARTS[k].d, true);
    }

    /* ben + chord: drag the end of a line around the circle */
    var A0 = 0, CH0 = 205;
    function chordLen(a) { var d = Math.abs(((a - CH0) % 360 + 360) % 360); d = Math.min(d, 360 - d); return { d: d, len: 2 * R * Math.sin(d * Math.PI / 360) }; }
    function drawLine() {
      svg.innerHTML = ''; svg.setAttribute('viewBox', '0 0 700 470');
      var r = PR - 10; disc(CX, CY, r);
      if (DO === 'chord' && S.a == null) { var want = +box.dataset.len || 20, dd = 2 * Math.asin(want / (2 * R)) * 180 / Math.PI; S.a = (CH0 - dd + 360) % 360; save(); }
      var a = S.a, done = DO === 'ben' ? Math.abs(a - 180) < .01 : chordLen(a).d > 179.9, e = P(CX, CY, r, a);
      if (DO === 'ben') {
        svg.setAttribute('aria-label', 'A circle with one radius drawn to the right, and a second radius you can turn.' + (done ? ' The two radii make one straight line.' : ''));
        var f = P(CX, CY, r, A0); NS('line', { x1: CX, y1: CY, x2: f.x, y2: f.y, stroke: BLUE, 'stroke-width': 5, 'pointer-events': 'none' }, svg);
        var lf = P(CX, CY, r + 46 * F, A0); pill(lf.x - 6, lf.y - 36 * F - 4, R + ' ' + U, BLUE);
        NS('line', { x1: CX, y1: CY, x2: e.x, y2: e.y, stroke: done ? VIO : BLUE, 'stroke-width': 5, 'pointer-events': 'none' }, svg);
        if (done) { var le = P(CX, CY, r + 46 * F, a); pill(le.x + 6, le.y - 36 * F - 4, R + ' ' + U, BLUE); }
        dot(CX, CY, NAVY, 7);
      } else {
        svg.setAttribute('aria-label', 'A circle with a line across it. One end of the line can move around the edge.' + (done ? ' The line goes through the center.' : ''));
        var s0 = P(CX, CY, r, CH0), m0 = +box.dataset.len || 20, a0 = (CH0 - 2 * Math.asin(m0 / (2 * R)) * 180 / Math.PI + 360) % 360, e0 = P(CX, CY, r, a0);
        if (Math.abs(a0 - a) > .5) NS('line', { x1: s0.x, y1: s0.y, x2: e0.x, y2: e0.y, stroke: '#A8B0C2', 'stroke-width': 3, 'stroke-dasharray': '7 6', 'pointer-events': 'none' }, svg);
        NS('line', { x1: s0.x, y1: s0.y, x2: e.x, y2: e.y, stroke: done ? VIO : RED, 'stroke-width': 5, 'pointer-events': 'none' }, svg);
        dot(s0.x, s0.y, RED, 8); dot(CX, CY, NAVY, 7);
      }
      var h = NS('g', { class: 'drag ci-end' + (done ? '' : ' ci-next'), tabindex: 0, role: 'slider', 'aria-label': (DO === 'ben' ? 'End of the second radius' : 'Moving end of the line') + '. Drag it around the edge.', 'aria-valuenow': Math.round(a) }, svg);
      NS('circle', { cx: e.x, cy: e.y, r: 18 * F, fill: '#fff', stroke: done ? GOLD : NAVY, 'stroke-width': 4 }, h); NS('circle', { cx: e.x, cy: e.y, r: 6, fill: done ? GOLD : NAVY }, h);
      var live = a;
      drag(h, svg, function (pt) { live = ang(CX, CY, pt); var q = P(CX, CY, r, live); h.setAttribute('transform', 'translate(' + (q.x - e.x) + ',' + (q.y - e.y) + ')'); }, function (pt) { if (pt) setA(live); else drawLine(); });
      h.addEventListener('keydown', function (ev) { var k = ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? 5 : ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? -5 : 0; if (!k) return; ev.preventDefault(); setA(S.a + k); var n = $('.ci-end', svg); if (n) n.focus(); });
      if (done) flag(box, DO === 'ben' ? 'line' : 'through');
    }
    function setA(v) {
      v = (v % 360 + 360) % 360;
      if (DO === 'ben') { if (Math.abs(v - 180) < 7) v = 180; if (v < 6 || v > 354) v = v < 6 ? 6 : 354; S.a = v; save(); pluck(v === 180 ? HZ.C5 : HZ.D4); drawLine(); msg(v === 180 ? '✓ The two radii make one straight line through the center. That line is a diameter: ' + R + ' ' + U + ' + ' + R + ' ' + U + '.' : 'The two radii meet at the center, but they bend. They are not one straight line yet.', v === 180); return; }
      var c = chordLen(v); if (c.d > 174) { v = (CH0 + 180) % 360; c = chordLen(v); } if (c.d < 8) { v = (CH0 + (v > CH0 || v < CH0 - 180 ? 8 : -8) + 360) % 360; c = chordLen(v); }
      S.a = v; save(); var through = c.d > 179.9, L = Math.round(c.len); pluck(through ? HZ.C5 : 200 + L * 12); drawLine();
      msg(through ? '✓ Now the line goes through the center. It is the longest line across the circle: ' + 2 * R + ' ' + U + '. That is the diameter.' : 'This line is about ' + L + ' ' + U + ' long. It misses the center.', through);
    }

    /* compass: open it on the grid, then swing the pencil around */
    var K = 1, PX = 0, PY = 0, B = null;
    function layout() {
      if (EUC) { K = Math.min(600 / (3 * T + 6), 330 / (2 * T + 4)); PX = 350 - K * T * .5; PY = 60 + K * (T + 2); }
      else if (GIV[0]) { var gr = GIV[0] === 'd' ? +GIV[1] / 2 : +GIV[1], tw = 2 * T + 4 + 2 * gr; K = Math.min(620 / (tw + 4), 330 / (2 * Math.max(T, gr) + 4)); PX = 40 + K * (T + 2); PY = 60 + K * (Math.max(T, gr) + 2); B = { x: PX + K * (T + 4 + gr), y: PY, r: gr }; }
      else { K = Math.min(300 / (MX + 1), 360 / (2 * T + 4)); PX = 350 - K * (MX / 2 - T * .4); PY = 60 + K * (T + 2); }
    }
    function drawCompass() {
      layout(); svg.innerHTML = ''; btns.innerHTML = '';
      var H = PY + K * (T + 2) + 70 + 46 * (F - 1); svg.setAttribute('viewBox', '0 0 700 ' + Math.round(H));
      var C = EUC && S.mv ? { x: PX + K * T, y: PY } : { x: PX, y: PY }, rr = K * S.r;
      svg.setAttribute('aria-label', 'A compass on paper with a centimeter ruler.' + (S.d ? ' Circle A is drawn.' : '') + (S.d2 ? ' Circle B is drawn.' : ''));
      NS('rect', { x: 8, y: 8, width: 684, height: H - 16, rx: 12, fill: '#fff', stroke: '#DCE2EE', 'stroke-width': 2, 'pointer-events': 'none' }, svg);
      // grid paper like the Compass tool on the tools site: each square is 1 cm (a darker line every 5)
      if (K >= 5) { var gx0 = PX - Math.floor((PX - 12) / K) * K, gy0 = PY - Math.floor((PY - 12) / K) * K, ii = 0;
        for (var gx = gx0, gi = -Math.floor((PX - 12) / K); gx <= 690; gx += K, gi++) NS('line', { x1: gx, y1: 12, x2: gx, y2: H - 12, stroke: gi % 5 === 0 ? '#B9C3D6' : '#DCE2EE', 'stroke-width': 1, 'pointer-events': 'none' }, svg);
        for (var gy = gy0, gj = -Math.floor((PY - 12) / K); gy <= H - 12; gy += K, gj++) NS('line', { x1: 12, y1: gy, x2: 688, y2: gy, stroke: gj % 5 === 0 ? '#B9C3D6' : '#DCE2EE', 'stroke-width': 1, 'pointer-events': 'none' }, svg); }
      NS('text', { x: 680, y: H - 18, 'text-anchor': 'end', 'font-size': 13 * F, 'font-weight': 800, fill: '#5B6478', text: 'Each square is 1 ' + U + '. Dark lines every 5 ' + U + '.', 'pointer-events': 'none' }, svg);
      if (B) { NS('circle', { cx: B.x, cy: B.y, r: K * B.r, fill: 'none', stroke: '#6B46C1', 'stroke-width': 4, 'pointer-events': 'none' }, svg); NS('line', { x1: B.x - K * B.r, y1: B.y, x2: B.x + K * B.r, y2: B.y, stroke: '#6B46C1', 'stroke-width': 3, 'pointer-events': 'none' }, svg); dot(B.x, B.y, '#6B46C1', 5); pill(B.x, B.y + K * B.r + 26 * F, 'B: diameter ' + GIV[1] + ' ' + U, '#6B46C1'); }
      // circle A (drawn or in progress)
      function arcD(cx, cy, r, sw) { if (!sw) return ''; var a = P(cx, cy, r, 0), b = P(cx, cy, r, sw); return 'M' + a.x + ' ' + a.y + ' A' + r + ' ' + r + ' 0 ' + (Math.abs(sw) > 180 ? 1 : 0) + ' ' + (sw > 0 ? 0 : 1) + ' ' + b.x + ' ' + b.y; }
      function arc(cx, cy, r, sw, col) { if (Math.abs(sw) >= 359.5) return NS('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: col, 'stroke-width': 4, 'pointer-events': 'none' }, svg); return NS('path', { d: arcD(cx, cy, r, sw), fill: 'none', stroke: col, 'stroke-width': 4, 'pointer-events': 'none' }, svg); }
      var RF = {}; RF.arcA = arc(PX, PY, K * (S.d ? T : S.r), S.d ? 360 : S.sw, NAVY);
      if (S.d) { dot(PX, PY, NAVY, 5); if (!EUC) { var re = P(PX, PY, K * T, 35); NS('line', { x1: PX, y1: PY, x2: re.x, y2: re.y, stroke: '#1E8C5A', 'stroke-width': 4, 'pointer-events': 'none' }, svg); } pill(PX, PY - K * T - 26 * F, (GIV[0] || EUC ? 'A: ' : '') + 'radius ' + T + ' ' + U, '#1E8C5A'); }
      if (EUC && S.mv) { RF.arcB = arc(C.x, C.y, K * T, S.d2 ? 360 : S.sw2, RED); dot(C.x, C.y, RED, 5); if (S.d2) pill(C.x + K * T * .55, PY + K * T + 26 * F, 'B: radius ' + T + ' ' + U, RED); }
      if (EUC && S.d2) {
        var X = { x: PX + K * T / 2, y: PY - K * T * Math.sqrt(3) / 2 };
        if (S.x) { NS('line', { x1: X.x, y1: X.y, x2: PX, y2: PY, stroke: BLUE, 'stroke-width': 5, 'pointer-events': 'none' }, svg); NS('line', { x1: X.x, y1: X.y, x2: C.x, y2: C.y, stroke: RED, 'stroke-width': 5, 'pointer-events': 'none' }, svg); NS('line', { x1: PX, y1: PY, x2: C.x, y2: C.y, stroke: NAVY, 'stroke-width': 3, 'stroke-dasharray': '7 5', 'pointer-events': 'none' }, svg); dot(X.x, X.y, NAVY, 7); dot(PX, PY, BLUE, 6); dot(C.x, C.y, RED, 6); }
        else { var xg = NS('g', { class: 'ci-cross ci-next', role: 'button', tabindex: 0, 'aria-label': 'Top point where the circles cross', style: 'cursor:pointer' }, svg); NS('circle', { cx: X.x, cy: X.y, r: 22 * F, fill: 'rgba(201,162,39,.25)', stroke: GOLD, 'stroke-width': 3 }, xg); NS('circle', { cx: X.x, cy: X.y, r: 6, fill: GOLD }, xg); function cx() { S.x = 1; save(); pluck(HZ.C5); flag(box, 'cross'); drawCompass(); msg('✓ Lines go from the top crossing point to both centers. A dashed line joins the two centers.', true); } xg.addEventListener('click', cx); xg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cx(); } }); }
      }
      // the compass itself
      var drawing2 = EUC && S.d && S.mv, piv = drawing2 ? C : { x: PX, y: PY }, pa = drawing2 ? S.sw2 : S.d ? 0 : S.sw, pen = P(piv.x, piv.y, K * (S.d ? T : S.r), pa);
      if (!(EUC ? S.d2 : S.d)) {
        var mid = { x: (piv.x + pen.x) / 2, y: (piv.y + pen.y) / 2 }, len = Math.hypot(pen.x - piv.x, pen.y - piv.y) || 1, nx = -(pen.y - piv.y) / len, ny = (pen.x - piv.x) / len; if (ny > 0) { nx = -nx; ny = -ny; }
        var hl = Math.max(70, 150 - len * .25), hg = { x: mid.x + nx * hl, y: mid.y + ny * hl };
        RF.l1 = NS('line', { x1: hg.x, y1: hg.y, x2: piv.x, y2: piv.y, stroke: '#5B6478', opacity: .85, 'stroke-width': 7, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        RF.l2 = NS('line', { x1: hg.x, y1: hg.y, x2: pen.x, y2: pen.y, stroke: '#6B46C1', opacity: .85, 'stroke-width': 7, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        RF.hc = NS('circle', { cx: hg.x, cy: hg.y, r: 10, fill: NAVY, 'pointer-events': 'none' }, svg);
        RF.dl = NS('line', { x1: piv.x, y1: piv.y, x2: pen.x, y2: pen.y, stroke: '#E3B505', 'stroke-width': 2, 'stroke-dasharray': '4 4', 'pointer-events': 'none' }, svg);
        // the point leg (drags onto circle A's edge in Euclid mode)
        var canMove = EUC && S.d && !S.mv, pg = NS('g', canMove ? { class: 'drag ci-pt ci-next', tabindex: 0, role: 'slider', 'aria-label': 'Compass point. Drag it onto the gold dot on the edge of circle A.' } : { 'pointer-events': 'none' }, svg);
        NS('circle', { cx: piv.x, cy: piv.y, r: 14, fill: 'rgba(91,100,120,.25)', stroke: '#5B6478', 'stroke-width': 2 }, pg); NS('circle', { cx: piv.x, cy: piv.y, r: 3, fill: NAVY }, pg);
        if (canMove) {
          NS('circle', { cx: piv.x, cy: piv.y, r: 18 * F, fill: 'none', stroke: GOLD, 'stroke-width': 3 }, pg);
          var tgt = { x: PX + K * T, y: PY }; NS('circle', { cx: tgt.x, cy: tgt.y, r: 12, fill: 'rgba(201,162,39,.35)', stroke: GOLD, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
          drag(pg, svg, function (pt) { pg.setAttribute('transform', 'translate(' + (pt.x - piv.x) + ',' + (pt.y - piv.y) + ')'); }, function (pt) { if (pt && Math.hypot(pt.x - tgt.x, pt.y - tgt.y) < 30) { S.mv = 1; save(); pluck(HZ.C5); flag(box, 'moved'); drawCompass(); msg('✓ The compass point sits on the edge of circle A. The compass is still open ' + T + ' ' + U + '.', true); } else { if (pt) { pluck(HZ.D4); msg('Not on the gold dot yet. The gold dot is on the edge of circle A.'); } drawCompass(); } });
          pg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.mv = 1; save(); flag(box, 'moved'); drawCompass(); } });
        }
        // the pencil leg
        var ready = drawing2 || (S.d === 0 && S.r === T), g = NS('g', { class: 'drag ci-pen' + (canMove ? '' : ' ci-next'), tabindex: canMove ? -1 : 0, role: 'slider', 'aria-label': ready ? 'Pencil. Drag it all the way around.' : 'Pencil. Drag it away from the point to open the compass.', 'aria-valuenow': ready ? Math.round(Math.abs(drawing2 ? S.sw2 : S.sw)) : S.r }, svg);
        if (canMove) g.setAttribute('pointer-events', 'none');
        NS('circle', { cx: pen.x, cy: pen.y, r: 16 * F, fill: '#F5C518', stroke: NAVY, 'stroke-width': 2.5 }, g);
        NS('text', { x: pen.x, y: pen.y + 5, 'text-anchor': 'middle', 'font-size': 14, text: '✏', 'pointer-events': 'none' }, g);
        if (!canMove) {
          var startR = S.r, last = null;
          // while dragging, only move the pencil, the legs and the arc (a full redraw would drop the drag)
          function live(rad, pa) {
            var q = P(piv.x, piv.y, rad, pa), m2 = { x: (piv.x + q.x) / 2, y: (piv.y + q.y) / 2 }, L2 = Math.hypot(q.x - piv.x, q.y - piv.y) || 1, ux = -(q.y - piv.y) / L2, uy = (q.x - piv.x) / L2; if (uy > 0) { ux = -ux; uy = -uy; }
            var h2 = Math.max(70, 150 - L2 * .25), H2 = { x: m2.x + ux * h2, y: m2.y + uy * h2 };
            [RF.l1, RF.l2].forEach(function (l) { l.setAttribute('x1', H2.x); l.setAttribute('y1', H2.y); }); RF.l2.setAttribute('x2', q.x); RF.l2.setAttribute('y2', q.y); RF.dl.setAttribute('x2', q.x); RF.dl.setAttribute('y2', q.y); RF.hc.setAttribute('cx', H2.x); RF.hc.setAttribute('cy', H2.y);
            g.setAttribute('transform', 'translate(' + (q.x - pen.x) + ',' + (q.y - pen.y) + ')');
            var ap = drawing2 ? RF.arcB : RF.arcA; if (ap && ap.tagName === 'path') ap.setAttribute('d', arcD(piv.x, piv.y, rad, drawing2 ? S.sw2 : S.sw));
          }
          drag(g, svg, function (pt) {
            if (!ready) { var v = Math.max(1, Math.min(MX, Math.round((pt.x - PX) / K))); if (v !== S.r) { S.r = v; pluck(180 + v * 10); live(K * v, 0); msg('The compass is open ' + v + ' ' + U + '.'); } return; }
            var a = ang(piv.x, piv.y, pt); if (last == null) last = (((drawing2 ? S.sw2 : S.sw) % 360) + 360) % 360; var d = ((a - last + 540) % 360) - 180; if (Math.abs(d) > 60) return; last = a;
            if (sweep(d, true)) return; live(K * T, drawing2 ? S.sw2 : S.sw);
          }, function () { if (!ready) setR(S.r); else { last = null; drawCompass(); } }, function () { if (ready) auto(); });
          g.addEventListener('keydown', function (e) { var k = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0; if (!k) return; e.preventDefault(); if (!ready) setR(S.r + k); else sweep(k * 30); var n = $('.ci-pen', svg); if (n) n.focus(); });
        }
      }
      if (S.r === T || S.d) flag(box, 'open'); if (S.d) flag(box, 'drawn'); if (S.mv) flag(box, 'moved'); if (S.d2) flag(box, 'drawn2'); if (S.x) flag(box, 'cross');
    }
    function setR(v) { if (S.d) return; S.r = Math.max(1, Math.min(MX, v)); S.sw = 0; save(); drawCompass(); var ok = S.r === T; if (ok) pluck(HZ.C5); msg(ok ? '✓ The compass is open ' + T + ' ' + U + '. That is the radius.' : 'The compass is open ' + S.r + ' ' + U + '.', ok); if (ok) flag(box, 'open'); }
    function sweep(d, live) {
      var two = EUC && S.d && S.mv, k = two ? 'sw2' : 'sw'; if (two ? S.d2 : S.d) return;
      S[k] += d; if (Math.abs(S[k]) >= 358) { S[k] = 360; if (two) S.d2 = 1; else S.d = 1; save(); pluck(HZ.C5); drawCompass(); msg(two ? '✓ Circle B is drawn. Its radius is ' + T + ' ' + U + ' too.' : '✓ A whole circle! Every point on it is ' + T + ' ' + U + ' from the center.', true); return true; }
      save(); if (!live) drawCompass(); return false;
    }
    function auto() { if (busy) return; busy = true; (function tick() { var two = EUC && S.d && S.mv; if (two ? S.d2 : S.d) { busy = false; return; } sweep(12); setTimeout(tick, reduced ? 0 : 30); })(); }

    function draw() { sizeF(); if (DO === 'fold') drawFold(); else if (DO === 'parts') drawParts(); else if (DO === 'compass') drawCompass(); else drawLine(); }
    onWidth(box, draw); draw();
  };

'''
CSS = '''
/* ── circ (3.12.01 circles) ── */
.sb-ci .ci-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:0 0 8px}
.sb-ci .ci-btns:empty{display:none}
.sb-ci .ci-chips:empty{display:none}
.sb-ci svg .ci-slot{cursor:pointer}
.sb-ci svg .drag{cursor:grab}
.sb-ci svg .drag:focus-visible,.sb-ci svg .ci-slot:focus-visible,.sb-ci svg .ci-cross:focus-visible,.sb-ci svg .ci-tapc:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.sb-ci svg .ci-cross{animation:ciPulse 1.6s ease-in-out infinite}
@keyframes ciPulse{50%{opacity:.55}}
@media (prefers-reduced-motion:reduce){.sb-ci svg .ci-cross{animation:none}}
'''
def patch_js(p):
    s = open(p).read()
    if 'MODS.circ = ' in s: print(p, 'already'); return
    assert MARK in s, p
    s = s.replace(MARK, MOD + MARK, 1)
    s = s.replace(", order (least to greatest, a tune)", ", order (least to greatest, a tune), circ (circles + compass)", 1)
    open(p, 'w').write(s); print(p, 'ok')
def patch_css(p):
    s = open(p).read()
    if '.sb-ci ' in s: print(p, 'already'); return
    open(p, 'w').write(s.rstrip('\n') + '\n' + CSS.lstrip('\n')); print(p, 'ok')
for a in sys.argv[1:]:
    (patch_css if a.endswith('.css') else patch_js)(a)
