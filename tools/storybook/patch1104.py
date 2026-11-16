# 3.11.04 layer change: new `cutkm` model (subtracting meters from whole kilometers). Same moves as `cutm` (3.11.02),
# one size up: a road of whole-kilometer blocks · tap a block to take a whole km away · ✂ Break a kilometer opens one
# block into 1,000 m (a mark every 10 m, a number every 100 m) · drag the marker along the open km (snaps to 10 m,
# arrow keys too). data-km (whole km on the road), data-orders "km:m,km:m".
# Flags (one order): km, break, cut. Flags (more orders): km1, break1, cut1, cut2.
# The next action carries class ck-next (steps use data-cue=".ck-next"). Readouts are feedback only: they never say
# what is left.
# Run on the files after patch1103:
#   python tools/storybook/patch1104.py tools/storybook/sb.src.js assets/storybook/sb.js assets/storybook/sb.css
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── cutkm (3.11.04 subtracting from kilometers). data-km, data-orders "km:m,km:m". See tools/storybook/patch1104.py. ── */
  MODS.cutkm = function (box) {
    var M = +box.dataset.km || 6, name = box.dataset.name || 'cutkm';
    var O = (box.dataset.orders || '0:500').split(',').map(function (p) { var q = p.split(':'); return { k: +q[0] || 0, m: +q[1] || 0 }; });
    var multi = O.length > 1, G = [], T = [], gs = 0, ts = 0;
    O.forEach(function (o) { gs += o.k; ts += o.m; G.push(gs); T.push(ts); });
    function nm(base, i) { return multi ? base + (i + 1) : base; }
    function f(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    var S = mstate(name, { g: 0, b: 0, c: 0, d: 0 });
    var X0 = 14, BW = 672, narrow = false;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 300" role="group" aria-label="A road of ' + M + ' whole kilometers"></svg></div>' +
      '<div class="sb-row ck-tools" style="margin-top:6px"><button type="button" class="sb-btn ck-break" aria-label="Break a kilometer">✂ Break a kilometer</button></div>' +
      '<div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), bb = $('.ck-break', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function cur() { return Math.min(S.d, O.length - 1); }
    function allDone() { return S.d >= O.length; }
    function give() {
      if (allDone()) return;
      var i = cur();
      if (S.g >= G[i]) { if (!S.b) { brk(); return; } msg('This part needs no more whole kilometers. Keep them on the road.'); return; }
      if (S.g + S.b >= M) return;
      S.g++; save(); pluck(HZ.D4); draw();
      msg('You took away ' + (S.g === 1 ? '1 whole kilometer.' : S.g + ' whole kilometers.'));
    }
    function brk() {
      if (allDone()) return;
      var i = cur();
      if (S.b) { msg('One kilometer is already open. Cut from it.'); return; }
      if (S.g < G[i]) { msg('Take away the whole kilometers first.'); return; }
      if (S.g >= M) return;
      S.b = 1; save(); pluck(HZ.G4); draw();
      msg('One kilometer is now 1,000 meters.');
    }
    bb.addEventListener('click', brk);
    function cutTo(v) {
      var i = cur(), lock = S.d ? T[S.d - 1] : 0, before = S.c;
      v = Math.max(lock, Math.min(1000, Math.round(v / 10) * 10)); S.c = v;
      var piece = S.c - lock;
      if (S.c === T[i] && S.g >= G[i]) { S.d = i + 1; save(); pluck(HZ.C5); draw(); msg('✓ Cut! That part is ' + f(piece) + ' m, just what you needed.', true); return; }
      save(); if (v !== before) pluck(HZ.E4); draw();
      msg(piece ? 'That part is ' + f(piece) + ' m. You need ' + f(O[i].m) + ' m.' : 'Drag the marker along the open kilometer.');
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var LH = narrow ? 30 : 16, BH = narrow ? 64 : 42, FS = narrow ? 22 : 13, i = cur(), lock = S.d ? T[S.d - 1] : 0;
      var yRow = 8 + LH + 6, gap = 4, u = (BW - gap * (M - 1)) / M, next = null;
      NS('text', { x: X0, y: 8 + LH - 4, 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5B6478', text: 'ROAD · ' + M + ' WHOLE KILOMETERS', 'pointer-events': 'none' }, svg);
      // left to right: taken away, the open kilometer, whole kilometers still on the road
      var bx = 0;
      for (var n = 0; n < M; n++) {
        var x = X0 + n * (u + gap), kind = n < S.g ? 'gone' : (n === S.g && S.b) ? 'open' : 'road';
        if (kind === 'open') bx = x;
        var g = NS('g', {}, svg);
        if (kind === 'gone') {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#F1ECFA', stroke: '#6B46C1', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 5, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#6B46C1', text: u > (narrow ? 150 : 70) ? 'taken away' : '✓', 'pointer-events': 'none' }, g);
        } else if (kind === 'open') {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#EAF3FF', stroke: '#8FB2DA', 'stroke-width': 2 }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 5, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#1D4FA8', text: u > (narrow ? 90 : 60) ? 'open' : '✂', 'pointer-events': 'none' }, g);
        } else {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#F6DE94', stroke: '#B8902A', 'stroke-width': 2 }, g);
          for (var tk = 1; tk < 10; tk++) NS('line', { x1: x + tk * u / 10, y1: yRow, x2: x + tk * u / 10, y2: yRow + (tk === 5 ? BH * .3 : BH * .18), stroke: '#8A6A00', 'stroke-width': 1, 'pointer-events': 'none' }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 7, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 15, 'font-weight': 900, fill: '#5A4300', text: '1 km', 'pointer-events': 'none' }, g);
          var can = !allDone() && S.g < G[i];
          g.setAttribute('class', 'ck-k' + (can && !next ? ' ck-next' : ''));
          g.setAttribute('role', 'button'); g.setAttribute('tabindex', can ? 0 : -1);
          g.setAttribute('aria-label', 'Whole kilometer on the road' + (can ? '. Tap to take it away.' : ''));
          if (can) { g.style.cursor = 'pointer'; if (!next) next = g; }
          drag(g, svg, null, function () { }, give);
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); give(); } });
        }
      }
      var H = yRow + BH + (narrow ? 14 : 10);
      bb.disabled = !!S.b || allDone();
      bb.classList.toggle('ck-next', !next && !S.b && !allDone());
      if (!next && !S.b && !allDone()) next = bb;
      if (S.b) {
        // the open kilometer, drawn large: 1,000 meters, a mark every 10 m, a number every 100 m
        var yS = H + (narrow ? 70 : 48), k = BW / 1000, sh = narrow ? 66 : 46;
        NS('polygon', { points: bx + ',' + (yRow + BH) + ' ' + (bx + u) + ',' + (yRow + BH) + ' ' + (X0 + BW) + ',' + yS + ' ' + X0 + ',' + yS, fill: '#8FB2DA', opacity: .18, 'pointer-events': 'none' }, svg);
        NS('text', { x: X0, y: yS - (narrow ? 44 : 30), 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: 'THE OPEN KILOMETER · 1,000 METERS', 'pointer-events': 'none' }, svg);
        NS('rect', { x: X0, y: yS, width: BW, height: sh, rx: 3, fill: '#EAF3FF', stroke: '#8FB2DA', 'stroke-width': 2 }, svg);
        for (var o = 0; o < S.d && o < O.length; o++) {
          var a = o ? T[o - 1] : 0, w = T[o] - a;
          if (w > 0) { NS('rect', { x: X0 + a * k, y: yS, width: w * k, height: sh, fill: multi && o < S.d - 1 ? '#C7B6EE' : '#B9A6E8', stroke: '#6B46C1', 'stroke-width': 1.5 }, svg); }
        }
        var shade = NS('rect', { class: 'ck-shade', x: X0 + lock * k, y: yS, width: Math.max(0, (S.c - lock) * k), height: sh, fill: '#6B46C1', opacity: .55, 'pointer-events': 'none' }, svg);
        for (var c = 0; c <= 1000; c += 10) {
          var big = c % 100 === 0, mid = c % 50 === 0, xx = X0 + c * k;
          NS('line', { x1: xx, y1: yS, x2: xx, y2: yS + (big ? sh * .5 : mid ? sh * .34 : sh * .2), stroke: '#1F2A44', 'stroke-width': big ? 1.8 : 1, 'pointer-events': 'none' }, svg);
          if (big && (!narrow || c % 200 === 0)) NS('text', { x: c === 1000 ? xx + 4 : xx, y: yS + sh - 5, 'text-anchor': c === 1000 ? 'end' : 'middle', 'font-size': narrow ? 20 : 11, 'font-weight': 800, fill: '#0E1C42', text: f(c), 'pointer-events': 'none' }, svg);
        }
        for (var p = 0; p < S.d && p < O.length; p++) {
          var a2 = p ? T[p - 1] : 0;
          if (T[p] - a2 >= (narrow ? 140 : 80)) NS('text', { x: X0 + (a2 + T[p]) / 2 * k, y: yS + sh + (narrow ? 26 : 16), 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#6B46C1', text: multi ? 'part ' + (p + 1) : 'cut off', 'pointer-events': 'none' }, svg);
        }
        var ex = X0 + S.c * k, ky = yS - (narrow ? 26 : 18);
        var gl = NS('line', { x1: ex, y1: ky, x2: ex, y2: yS + sh + 4, stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
        H = yS + sh + (narrow ? 36 : 24);
        if (!allDone()) {
          var kn = NS('g', { class: 'drag ck-sc' + (!next ? ' ck-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'End of the cut. Drag the marker.', 'aria-valuemin': lock, 'aria-valuemax': 1000, 'aria-valuenow': S.c }, svg);
          NS('circle', { cx: ex, cy: ky, r: narrow ? 24 : 17, fill: '#fff', stroke: '#6B46C1', 'stroke-width': 4 }, kn);
          NS('text', { x: ex, y: ky + 6, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 16, 'font-weight': 900, fill: '#6B46C1', text: '✂', 'pointer-events': 'none' }, kn);
          var c0 = S.c, live = S.c;
          drag(kn, svg, function (pt) {
            var v = Math.max(lock, Math.min(1000, Math.round((pt.x - X0) / k / 10) * 10)); if (v === live) return; live = v;
            kn.setAttribute('transform', 'translate(' + ((v - c0) * k) + ',0)'); gl.setAttribute('x1', X0 + v * k); gl.setAttribute('x2', X0 + v * k);
            shade.setAttribute('width', Math.max(0, (v - lock) * k));
          }, function (pt) { if (pt) cutTo(live); else draw(); }, function () { });
          kn.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowLeft' ? -10 : e.key === 'ArrowRight' ? 10 : 0; if (!dv) return; e.preventDefault(); cutTo(S.c + dv); var nn = $('.ck-sc', svg); if (nn) nn.focus(); });
        }
      }
      svg.setAttribute('viewBox', '0 0 700 ' + H);
      // flags: what is done stays done
      O.forEach(function (od, j) {
        if (od.k && S.g >= G[j]) flag(box, nm('km', j));
        if (j === 0 && S.b) flag(box, nm('break', j));
        if (S.d > j) flag(box, nm('cut', j));
      });
      if (!out.innerHTML) msg(allDone() ? (multi ? '✓ Both parts are cut.' : '✓ The part is cut.') : 'The road has ' + M + ' whole kilometers.', allDone());
    }
    onWidth(box, draw); draw();
  };

'''

# Warm-Up film (Bethany, 16 Nov 2026): when the film made from Opti's warm-1 note is showing, the note itself steps
# aside (its printed words above the film read like something Opti says first). Its words move under the film behind
# a "📄 Read the film's words" toggle.
VID = "  $$('.sb-video video').forEach(function (v) { var w = v.closest('.sb-video'); function ok() { w.classList.add('ready'); } if (v.readyState > 0) ok(); v.addEventListener('loadedmetadata', ok); v.addEventListener('error', function () { w.classList.remove('ready'); }); });\n"
FILM = VID + r"""  // a film made from Opti's note: the note steps aside while the film shows; its words sit under the film
  $$('.sb-video[data-slot="warm"]').forEach(function (w) {
    var n = w.previousElementSibling, cap = $('.cap', w); if (!n || !n.classList.contains('sb-opti') || !cap) return;
    var t = ($('.tr', n) || n).textContent.replace(/\s+/g, ' ').trim(), L0 = '📄 Read the film\'s words';
    var b = el('button', 'sb-btn sm ghost sb-filmwords', L0); b.type = 'button'; b.setAttribute('aria-expanded', 'false');
    var d = el('div', 'sb-filmtr'); d.hidden = true; d.textContent = t;
    b.addEventListener('click', function () { d.hidden = !d.hidden; b.setAttribute('aria-expanded', String(!d.hidden)); b.textContent = d.hidden ? L0 : '📄 Hide the words'; });
    cap.appendChild(b); w.appendChild(d);
  });
"""
CSS = """
/* Warm-Up film (16 Nov 2026): the note it was made from steps aside; its words open under the film */
.sb-opti:has(+ .sb-video.ready[data-slot="warm"]){display:none}
.sb-video .cap{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.sb-video .sb-filmwords{margin-left:auto;background:#fff;color:var(--navy)}
.sb-filmtr{padding:2px 16px 16px;font-size:17px;line-height:1.6;color:#E8ECF6}
"""
for p in sys.argv[1:]:
    if p.endswith('.css'):
        c = open(p).read()
        if 'sb-filmtr' in c: print(p, 'already patched'); continue
        open(p, 'w').write(c.rstrip('\n') + '\n' + CSS); print(p, 'patched'); continue
    s = open(p).read()
    if 'MODS.cutkm' in s: print(p, 'already patched'); continue
    assert 'MODS.kmroad' in s, p + ': run patch1103 first'
    assert s.count(MARK) == 1, p
    s = s.replace(MARK, MOD + MARK)
    assert s.count(VID) == 1, p + ': video line not as expected'
    s = s.replace(VID, FILM)
    open(p, 'w').write(s); print(p, 'patched')
