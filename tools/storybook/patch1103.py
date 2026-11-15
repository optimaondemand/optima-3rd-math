# 3.11.03 layer change: new `kmroad` model (kilometers and meters on a road built from 100 m pieces).
#   build  drag the end of the road (snaps to 100 m, arrow keys too). Ten 100 m pieces join into one gold "1 km" bar
#          with a km stone. data-max (m), data-t "1900" (one target, flag `road`) or "900,2500,2900" (stops in order,
#          flags stop1, stop2, stop3). The road locks at a stop once it is reached.
#   show   data-roads "900,1020" + data-labs "Road A|Road B": roads already laid on one scale (no flags).
#   route  data-legs "900,500,900,500" + data-direct "2100": a winding road and a straight path; the button
#          "Lay the road out straight" lays both on one scale (flag `straight`).
# Readouts are feedback only; they never state the length.
# Run on the files after patch1102:
#   python tools/storybook/patch1103.py tools/storybook/sb.src.js assets/storybook/sb.js
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── kmroad (3.11.03 kilometers). data-mode build | show | route. See tools/storybook/patch1103.py. ── */
  MODS.kmroad = function (box) {
    var mode = box.dataset.mode || 'build', name = box.dataset.name || 'kmroad', MAX = +box.dataset.max || 3000;
    var T = (box.dataset.t || '').split(',').filter(Boolean).map(Number), multi = T.length > 1;
    var X0 = 20, BW = 660, narrow = false;
    var S = mstate(name, mode === 'route' ? { st: 0 } : { len: 0, d: 0 });
    function fm(m) { var k = Math.floor(m / 1000), r = m % 1000; return k ? k + ' km' + (r ? ' ' + r + ' m' : '') : m + ' m'; }
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 200" role="group" aria-label="' + (mode === 'route' ? 'A winding road and a straight path' : 'A road built from 100 meter pieces') + '"></svg></div>' +
      (mode === 'route' ? '<div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn kr-go" aria-label="Lay the road out straight">↔ Lay the road out straight</button></div>' : '') +
      '<div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    // a laid road from 0 to len on a scale of k px per m at (x, y): gold 1 km bars, then 100 m pieces
    function road(g, x, y, len, k, h) {
      var km = Math.floor(len / 1000), rest = len - km * 1000, i, fs = narrow ? 20 : 12;
      for (i = 0; i < km; i++) {
        NS('rect', { x: x + i * 1000 * k, y: y, width: 1000 * k, height: h, rx: 4, fill: '#F6DE94', stroke: '#B8902A', 'stroke-width': 2 }, g);
        NS('text', { x: x + (i + 0.5) * 1000 * k, y: y + h / 2 + fs * 0.38, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5A4300', text: '1 km', 'pointer-events': 'none' }, g);
      }
      var p = 0;
      for (var m = 0; m < rest; m += 100, p++) {
        var w = Math.min(100, rest - m) * k;
        NS('rect', { x: x + (km * 1000 + m) * k, y: y + 2, width: w, height: h - 4, rx: 2, fill: p % 2 ? '#C9D3E6' : '#DCE4F2', stroke: '#7B8DB0', 'stroke-width': 1.5 }, g);
        if (100 * k > (narrow ? 70 : 34) && w >= 100 * k) NS('text', { x: x + (km * 1000 + m + 50) * k, y: y + h / 2 + 4, 'text-anchor': 'middle', 'font-size': narrow ? 15 : 10, 'font-weight': 800, fill: '#33415E', text: '100 m', 'pointer-events': 'none' }, g);
      }
    }
    // the ruler under a road: a tick every 100 m, a km stone at every 1,000 m
    function scale(g, x, y, max, k) {
      NS('line', { x1: x, y1: y, x2: x + max * k, y2: y, stroke: '#5B6478', 'stroke-width': 2 }, g);
      for (var m = 0; m <= max; m += 100) {
        var big = m % 1000 === 0, xx = x + m * k;
        NS('line', { x1: xx, y1: y, x2: xx, y2: y + (big ? 12 : 6), stroke: '#5B6478', 'stroke-width': big ? 2 : 1 }, g);
        if (big) {
          NS('rect', { x: xx - (narrow ? 26 : 18), y: y + 14, width: narrow ? 52 : 36, height: narrow ? 30 : 20, rx: 6, fill: '#EDEAE3', stroke: '#9A938A', 'stroke-width': 1.5 }, g);
          NS('text', { x: xx, y: y + (narrow ? 36 : 28), 'text-anchor': 'middle', 'font-size': narrow ? 18 : 11, 'font-weight': 900, fill: '#3F3A33', text: m / 1000 + ' km', 'pointer-events': 'none' }, g);
        }
      }
      return narrow ? 50 : 38;
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var RH = narrow ? 56 : 34, FS = narrow ? 22 : 14;
      if (mode === 'show') {
        var R = (box.dataset.roads || '900,1020').split(',').map(Number), labs = (box.dataset.labs || 'Road A|Road B').split('|');
        var ks = BW / MAX, y = 8;
        R.forEach(function (len, i) {
          NS('text', { x: X0, y: y + FS, 'font-size': FS, 'font-weight': 900, fill: '#5B6478', text: (labs[i] || '').toUpperCase(), 'pointer-events': 'none' }, svg);
          y += FS + 6; road(NS('g', {}, svg), X0, y, len, ks, RH);
          NS('line', { x1: X0 + len * ks, y1: y - 4, x2: X0 + len * ks, y2: y + RH + 4, stroke: '#C9A227', 'stroke-width': 3, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
          y += RH + 12;
        });
        y += scale(NS('g', {}, svg), X0, y, MAX, ks);
        svg.setAttribute('viewBox', '0 0 700 ' + (y + 6)); msg(''); return;
      }
      if (mode === 'route') {
        var legs = (box.dataset.legs || '900,500,900,500').split(',').map(Number), dir = +box.dataset.direct || 2100;
        var P = [[40, 190], [210, 50], [350, 150], [500, 50], [660, 190]], tot = legs.reduce(function (a, b) { return a + b; }, 0);
        NS('line', { x1: P[0][0], y1: P[0][1], x2: P[4][0], y2: P[4][1], stroke: '#1D4FA8', 'stroke-width': 4, 'stroke-dasharray': '10 8' }, svg);
        NS('text', { x: 350, y: P[0][1] + (narrow ? 36 : 26), 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: 'straight path · ' + fm(dir), 'pointer-events': 'none' }, svg);
        NS('polyline', { points: P.map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: '#8A6A3A', 'stroke-width': narrow ? 14 : 10, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
        NS('polyline', { points: P.map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: '#E9D9B5', 'stroke-width': narrow ? 4 : 3, 'stroke-dasharray': '8 8' }, svg);
        for (var i = 0; i < 4; i++) {
          var mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2, w = narrow ? 92 : 64;
          NS('rect', { x: mx - w / 2, y: my - (narrow ? 18 : 13), width: w, height: narrow ? 34 : 24, rx: 8, fill: '#fff', stroke: '#8A6A3A', 'stroke-width': 2 }, svg);
          NS('text', { x: mx, y: my + (narrow ? 8 : 5), 'text-anchor': 'middle', 'font-size': narrow ? 20 : 13, 'font-weight': 900, fill: '#5A3A1A', text: legs[i] + ' m', 'pointer-events': 'none' }, svg);
        }
        [[P[0], 'START'], [P[4], 'END']].forEach(function (q) {
          NS('circle', { cx: q[0][0], cy: q[0][1], r: narrow ? 14 : 10, fill: '#0E1C42' }, svg);
          NS('text', { x: q[0][0], y: q[0][1] - (narrow ? 22 : 16), 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#0E1C42', text: q[1], 'pointer-events': 'none' }, svg);
        });
        var H = 236 + (narrow ? 12 : 0), bt = $('.kr-go', box);
        if (S.st) {
          var kk = BW / MAX, yy = H + 10, g2 = NS('g', {}, svg);
          NS('text', { x: X0, y: yy + FS, 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: 'STRAIGHT PATH', 'pointer-events': 'none' }, g2);
          yy += FS + 6; NS('rect', { x: X0, y: yy, width: dir * kk, height: RH * 0.7, rx: 4, fill: '#EAF3FF', stroke: '#1D4FA8', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g2);
          yy += RH * 0.7 + 12;
          NS('text', { x: X0, y: yy + FS, 'font-size': FS, 'font-weight': 900, fill: '#5A3A1A', text: 'THE ROAD, LAID OUT STRAIGHT', 'pointer-events': 'none' }, g2);
          yy += FS + 6; var x = X0;
          legs.forEach(function (L, j) { NS('rect', { x: x, y: yy, width: L * kk, height: RH * 0.7, rx: 3, fill: j % 2 ? '#C9A46A' : '#DDBE84', stroke: '#8A6A3A', 'stroke-width': 1.5 }, g2); NS('text', { x: x + L * kk / 2, y: yy + RH * 0.35 + 5, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#3A2A12', text: L + ' m', 'pointer-events': 'none' }, g2); x += L * kk; });
          yy += RH * 0.7 + 10; yy += scale(g2, X0, yy, MAX, kk); H = yy + 6;
          bt.disabled = true; flag(box, 'straight');
          msg('Both are laid out on the same scale now.', true);
        } else if (!out.innerHTML) msg('The road bends. The straight path does not.');
        svg.setAttribute('viewBox', '0 0 700 ' + H);
        return;
      }
      // build
      var k = BW / MAX, yR = 8 + (narrow ? 70 : 46), g = NS('g', {}, svg), lock = multi ? (S.d ? T[S.d - 1] : 0) : (S.d ? S.len : 0);
      NS('rect', { x: X0, y: yR, width: BW, height: RH, rx: 4, fill: '#F4F1EA', stroke: '#D8D2C4', 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }, g);
      road(g, X0, yR, S.len, k, RH);
      T.forEach(function (t, i) {
        var tx = X0 + t * k, done = multi ? S.d > i : S.d > 0;
        NS('line', { x1: tx, y1: yR - (narrow ? 34 : 24), x2: tx, y2: yR + RH + 4, stroke: done ? '#1E7A4C' : '#B23A2E', 'stroke-width': 3, 'pointer-events': 'none' }, svg);
        NS('path', { d: 'M' + tx + ' ' + (yR - (narrow ? 34 : 24)) + ' l' + (narrow ? 26 : 18) + ' ' + (narrow ? 8 : 6) + ' l-' + (narrow ? 26 : 18) + ' ' + (narrow ? 8 : 6) + ' z', fill: done ? '#1E7A4C' : '#B23A2E', 'pointer-events': 'none' }, svg);
        NS('text', { x: tx, y: yR - (narrow ? 40 : 30), 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#3A2A12', text: multi ? 'STOP ' + (i + 1) : (box.dataset.goal || 'GOAL'), 'pointer-events': 'none' }, svg);
      });
      var H2 = yR + RH + 8; H2 += scale(NS('g', {}, svg), X0, H2, MAX, k);
      svg.setAttribute('viewBox', '0 0 700 ' + (H2 + 6));
      var allDone = multi ? S.d >= T.length : S.d > 0;
      if (!allDone) {
        var ex = X0 + S.len * k, kn = NS('g', { class: 'drag kr-end', tabindex: 0, role: 'slider', 'aria-label': 'End of the road. Drag to build it.', 'aria-valuemin': lock, 'aria-valuemax': MAX, 'aria-valuenow': S.len }, svg);
        NS('circle', { cx: ex, cy: yR + RH / 2, r: narrow ? 26 : 18, fill: '#fff', stroke: '#0E1C42', 'stroke-width': 4 }, kn);
        NS('text', { x: ex, y: yR + RH / 2 + 6, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 16, 'font-weight': 900, fill: '#0E1C42', text: '▶', 'pointer-events': 'none' }, kn);
        var l0 = S.len, live = S.len, ghost = NS('rect', { x: X0 + S.len * k, y: yR + 2, width: 0, height: RH - 4, fill: '#7B8DB0', opacity: .35, 'pointer-events': 'none' }, svg);
        svg.insertBefore(ghost, kn);
        drag(kn, svg, function (pt) {
          var v = Math.max(lock, Math.min(MAX, Math.round((pt.x - X0) / k / 100) * 100)); if (v === live) return; live = v;
          kn.setAttribute('transform', 'translate(' + ((v - l0) * k) + ',0)');
          ghost.setAttribute('x', X0 + Math.min(v, l0) * k); ghost.setAttribute('width', Math.abs(v - l0) * k);
        }, function (pt) { if (pt) setLen(live); else draw(); }, function () { });
        kn.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowLeft' ? -100 : e.key === 'ArrowRight' ? 100 : 0; if (!dv) return; e.preventDefault(); setLen(Math.max(lock, Math.min(MAX, S.len + dv))); var n = $('.kr-end', svg); if (n) n.focus(); });
      }
      if (multi) { for (var j = 0; j < S.d; j++) flag(box, 'stop' + (j + 1)); } else if (S.d) flag(box, 'road');
      if (!out.innerHTML) msg(allDone ? (multi ? '✓ The message reached every stop.' : '✓ The road reaches the ' + (box.dataset.goal || 'goal').toLowerCase() + '.') : 'The road starts at 0. Each piece is 100 m.', allDone);
    }
    function setLen(v) {
      var before = S.len; S.len = v;
      var crossed = Math.floor(v / 1000) > Math.floor(before / 1000);
      if (multi) {
        var t = T[S.d];
        if (v === t) { S.d++; save(); pluck(HZ.C5); draw(); msg('✓ The message reached stop ' + S.d + '.', true); return; }
      } else if (v === T[0]) { S.d = 1; save(); pluck(HZ.C5); draw(); msg('✓ The road reaches the ' + (box.dataset.goal || 'goal').toLowerCase() + '.', true); return; }
      save(); if (v !== before) pluck(crossed ? HZ.G4 : HZ.E4); draw();
      var tgt = multi ? T[S.d] : T[0];
      msg(crossed ? 'Ten pieces of 100 m just joined into 1 km!' : v > tgt ? 'The road goes past the ' + (multi ? 'stop' : (box.dataset.goal || 'goal').toLowerCase()) + '.' : 'The road has not reached the ' + (multi ? 'stop' : (box.dataset.goal || 'goal').toLowerCase()) + ' yet.');
    }
    if (mode === 'route') $('.kr-go', box).addEventListener('click', function () { if (S.st) return; S.st = 1; save(); pluck(HZ.G4); out.innerHTML = ''; draw(); });
    onWidth(box, draw); draw();
  };

'''
# read aloud: "1 km 900 m" → "1 kilometer 900 meters"
RA0 = ".replace(/\\b(\\d+|blank) (c?m)\\b/g, function (x, n, u) { return n + ' ' + (u === 'cm' ? 'centimeter' : 'meter') + (n === '1' ? '' : 's'); })"
RA1 = ".replace(/\\b(\\d[\\d,]*|blank) km\\b/g, function (x, n) { return n + ' kilometer' + (n === '1' ? '' : 's'); }).replace(/\\b(\\d[\\d,]*|blank) (c?m)\\b/g, function (x, n, u) { return n + ' ' + (u === 'cm' ? 'centimeter' : 'meter') + (n === '1' ? '' : 's'); })"
for p in sys.argv[1:]:
    s = open(p).read()
    if 'MODS.kmroad' in s: print(p, 'already patched'); continue
    assert 'MODS.cutm' in s, p + ': run patch1102 first'
    assert s.count(MARK) == 1, p
    assert s.count(RA0) == 1, p + ': read-aloud cleaner not as expected'
    s = s.replace(RA0, RA1).replace(MARK, MOD + MARK)
    s = s.replace("replace(/(meters?|centimeters?) = /g, '$1 equals ')", "replace(/(kilometers?|meters?|centimeters?) = /g, '$1 equals ')")
    open(p, 'w').write(s); print(p, 'patched')
