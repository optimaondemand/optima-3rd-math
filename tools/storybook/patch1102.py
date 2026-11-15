# 3.11.02 layer change: new `cutm` model (subtracting centimeters from whole meters, on a ribbon roll drawn as
# whole meter sticks). The student hands over whole meters (tap), breaks one meter into 100 cm (✂ Break a meter),
# then drags the scissors along the broken meter to cut the centimeters. The picture never states what is left.
#   data-m       meters on the roll
#   data-orders  "m:c,m:c…" whole meters and centimeters in each order, in turn (the wow job has two orders)
#   flags        one order:   meters (only when the order has whole meters), break, cut
#                more orders: meters1, break1, cut1, cut2, … (break only for the order that opens the first meter)
#   The next thing to do carries class cm-next (steps point the hand at it with data-cue=".cm-next").
#   When an order is cut exactly, the scissors lock there; the next order starts from that mark.
# Run on the files after patch1101:
#   python tools/storybook/patch1102.py tools/storybook/sb.src.js assets/storybook/sb.js
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── cutm (3.11.02 subtracting from meters). data-m (meters on the roll), data-orders "m:c,m:c".
     Tap a whole meter to hand it over · ✂ Break a meter opens one meter into 100 cm · drag the scissors to cut.
     Flags (one order): meters, break, cut. Flags (more orders): meters1, break1, cut1, cut2…  ── */
  MODS.cutm = function (box) {
    var M = +box.dataset.m || 9, name = box.dataset.name || 'cutm';
    var O = (box.dataset.orders || '0:50').split(',').map(function (p) { var q = p.split(':'); return { m: +q[0] || 0, c: +q[1] || 0 }; });
    var multi = O.length > 1, G = [], T = [], gs = 0, ts = 0;
    O.forEach(function (o) { gs += o.m; ts += o.c; G.push(gs); T.push(ts); });
    function nm(base, i) { return multi ? base + (i + 1) : base; }
    var S = mstate(name, { g: 0, b: 0, c: 0, d: 0 });
    var X0 = 14, BW = 672, narrow = false;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 300" role="group" aria-label="A ribbon roll of ' + M + ' whole meters"></svg></div>' +
      '<div class="sb-row cm-tools" style="margin-top:6px"><button type="button" class="sb-btn cm-break" aria-label="Break a meter">✂ Break a meter</button></div>' +
      '<div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), bb = $('.cm-break', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function cur() { return Math.min(S.d, O.length - 1); }
    function allDone() { return S.d >= O.length; }
    function give() {
      if (allDone()) return;
      var i = cur();
      if (S.g >= G[i]) { if (!S.b) { brk(); return; } msg('This order needs no more whole meters. Keep them on the roll.'); return; }
      if (S.g + S.b >= M) return;
      S.g++; save(); pluck(HZ.D4); draw();
      msg('You handed over ' + (S.g === 1 ? '1 whole meter.' : S.g + ' whole meters.'));
    }
    function brk() {
      if (allDone()) return;
      var i = cur();
      if (S.b) { msg('One meter is already open. Cut from it.'); return; }
      if (S.g < G[i]) { msg('Hand over the whole meters first.'); return; }
      if (S.g >= M) return;
      S.b = 1; save(); pluck(HZ.G4); draw();
      msg('One meter is now 100 centimeters.');
    }
    bb.addEventListener('click', brk);
    function cutTo(v) {
      var i = cur(), lock = S.d ? T[S.d - 1] : 0, before = S.c;
      v = Math.max(lock, Math.min(100, v)); S.c = v;
      var piece = S.c - lock;
      if (S.c === T[i] && S.g >= G[i]) { S.d = i + 1; save(); pluck(HZ.C5); draw(); msg('✓ Cut! That piece is ' + piece + ' cm, just what the order asked for.', true); return; }
      save(); if (v !== before) pluck(HZ.E4); draw();
      msg(piece ? 'That piece is ' + piece + ' cm. The order asks for ' + O[i].c + ' cm.' : 'Drag the scissors along the open meter.');
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var LH = narrow ? 30 : 16, BH = narrow ? 64 : 42, FS = narrow ? 22 : 13, i = cur(), lock = S.d ? T[S.d - 1] : 0;
      var yRow = 8 + LH + 6, gap = 4, u = (BW - gap * (M - 1)) / M, next = null;
      NS('text', { x: X0, y: 8 + LH - 4, 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5B6478', text: 'RIBBON ROLL · ' + M + ' WHOLE METERS', 'pointer-events': 'none' }, svg);
      // order of blocks, left to right: handed over, the open meter, whole meters still on the roll
      var bx = 0;
      for (var n = 0; n < M; n++) {
        var x = X0 + n * (u + gap), kind = n < S.g ? 'gone' : (n === S.g && S.b) ? 'open' : 'roll';
        if (kind === 'open') bx = x;
        var g = NS('g', {}, svg);
        if (kind === 'gone') {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#F1ECFA', stroke: '#6B46C1', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 5, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#6B46C1', text: u > (narrow ? 150 : 60) ? 'handed over' : '✓', 'pointer-events': 'none' }, g);
        } else if (kind === 'open') {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#EAF3FF', stroke: '#8FB2DA', 'stroke-width': 2 }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 5, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#1D4FA8', text: u > (narrow ? 90 : 60) ? 'open' : '✂', 'pointer-events': 'none' }, g);
        } else {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#F6DE94', stroke: '#B8902A', 'stroke-width': 2 }, g);
          for (var tk = 1; tk < 10; tk++) NS('line', { x1: x + tk * u / 10, y1: yRow, x2: x + tk * u / 10, y2: yRow + (tk === 5 ? BH * .3 : BH * .18), stroke: '#8A6A00', 'stroke-width': 1, 'pointer-events': 'none' }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 7, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 15, 'font-weight': 900, fill: '#5A4300', text: '1 m', 'pointer-events': 'none' }, g);
          var can = !allDone() && S.g < G[i];
          g.setAttribute('class', 'cm-m' + (can && !next ? ' cm-next' : ''));
          g.setAttribute('role', 'button'); g.setAttribute('tabindex', can ? 0 : -1);
          g.setAttribute('aria-label', 'Whole meter on the roll' + (can ? '. Tap to hand it over.' : ''));
          if (can) { g.style.cursor = 'pointer'; if (!next) next = g; }
          drag(g, svg, null, function () { }, give);
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); give(); } });
        }
      }
      var H = yRow + BH + (narrow ? 14 : 10);
      bb.disabled = !!S.b || allDone();
      bb.classList.toggle('cm-next', !next && !S.b && !allDone());
      if (!next && !S.b && !allDone()) next = bb;
      if (S.b) {
        // the open meter, drawn large: 100 centimeters with a mark for every one
        var yS = H + (narrow ? 70 : 48), k = BW / 100, sh = narrow ? 66 : 46;
        NS('polygon', { points: bx + ',' + (yRow + BH) + ' ' + (bx + u) + ',' + (yRow + BH) + ' ' + (X0 + BW) + ',' + yS + ' ' + X0 + ',' + yS, fill: '#8FB2DA', opacity: .18, 'pointer-events': 'none' }, svg);
        NS('text', { x: X0, y: yS - (narrow ? 44 : 30), 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: 'THE OPEN METER · 100 CENTIMETERS', 'pointer-events': 'none' }, svg);
        NS('rect', { x: X0, y: yS, width: BW, height: sh, rx: 3, fill: '#EAF3FF', stroke: '#8FB2DA', 'stroke-width': 2 }, svg);
        for (var o = 0; o < S.d && o < O.length; o++) {
          var a = o ? T[o - 1] : 0, w = T[o] - a;
          if (w > 0) { NS('rect', { x: X0 + a * k, y: yS, width: w * k, height: sh, fill: multi && o < S.d - 1 ? '#C7B6EE' : '#B9A6E8', stroke: '#6B46C1', 'stroke-width': 1.5 }, svg); }
        }
        var shade = NS('rect', { class: 'cm-shade', x: X0 + lock * k, y: yS, width: Math.max(0, (S.c - lock) * k), height: sh, fill: '#6B46C1', opacity: .55, 'pointer-events': 'none' }, svg);
        for (var c = 0; c <= 100; c++) {
          var big = c % 10 === 0, mid = c % 5 === 0, xx = X0 + c * k;
          NS('line', { x1: xx, y1: yS, x2: xx, y2: yS + (big ? sh * .5 : mid ? sh * .34 : sh * .2), stroke: '#1F2A44', 'stroke-width': big ? 1.8 : 1, 'pointer-events': 'none' }, svg);
          if (big && (!narrow || c % 20 === 0)) NS('text', { x: xx, y: yS + sh - 5, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 12, 'font-weight': 800, fill: '#0E1C42', text: String(c), 'pointer-events': 'none' }, svg);
        }
        for (var p = 0; p < S.d && p < O.length; p++) {
          var a2 = p ? T[p - 1] : 0;
          if (T[p] - a2 >= (narrow ? 14 : 8)) NS('text', { x: X0 + (a2 + T[p]) / 2 * k, y: yS + sh + (narrow ? 26 : 16), 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#6B46C1', text: multi ? 'order ' + (p + 1) : 'cut off', 'pointer-events': 'none' }, svg);
        }
        var ex = X0 + S.c * k, ky = yS - (narrow ? 26 : 18);
        var gl = NS('line', { x1: ex, y1: ky, x2: ex, y2: yS + sh + 4, stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
        H = yS + sh + (narrow ? 36 : 24);
        if (!allDone()) {
          var kn = NS('g', { class: 'drag cm-sc' + (!next ? ' cm-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'End of the cut. Drag the scissors.', 'aria-valuemin': lock, 'aria-valuemax': 100, 'aria-valuenow': S.c }, svg);
          NS('circle', { cx: ex, cy: ky, r: narrow ? 24 : 17, fill: '#fff', stroke: '#6B46C1', 'stroke-width': 4 }, kn);
          NS('text', { x: ex, y: ky + 6, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 16, 'font-weight': 900, fill: '#6B46C1', text: '✂', 'pointer-events': 'none' }, kn);
          var c0 = S.c, live = S.c;
          drag(kn, svg, function (pt) {
            var v = Math.max(lock, Math.min(100, Math.round((pt.x - X0) / k))); if (v === live) return; live = v;
            kn.setAttribute('transform', 'translate(' + ((v - c0) * k) + ',0)'); gl.setAttribute('x1', X0 + v * k); gl.setAttribute('x2', X0 + v * k);
            shade.setAttribute('width', Math.max(0, (v - lock) * k));
          }, function (pt) { if (pt) cutTo(live); else draw(); }, function () { });
          kn.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0; if (!dv) return; e.preventDefault(); cutTo(S.c + dv); var nn = $('.cm-sc', svg); if (nn) nn.focus(); });
        }
      }
      svg.setAttribute('viewBox', '0 0 700 ' + H);
      // flags: what is done stays done
      O.forEach(function (od, j) {
        if (od.m && S.g >= G[j]) flag(box, nm('meters', j));
        if (j === 0 && S.b) flag(box, nm('break', j));
        if (S.d > j) flag(box, nm('cut', j));
      });
      if (!out.innerHTML) msg(allDone() ? '✓ Every order is cut.' : 'The roll has ' + M + ' whole meters.', allDone());
    }
    onWidth(box, draw); draw();
  };

'''
for p in sys.argv[1:]:
    s = open(p).read()
    if 'MODS.cutm' in s: print(p, 'already patched'); continue
    assert 'MODS.mstick' in s, p + ': run patch1101 first'
    assert s.count(MARK) == 1, p
    s = s.replace(MARK, MOD + MARK)
    open(p, 'w').write(s); print(p, 'patched')
