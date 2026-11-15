# 3.11.01 layer change: new `mstick` model (meters and centimeters, measured with a real-looking meter stick and
# a centimeter ruler, the same look as the library's Rulers & Measuring Tape tool). Modes:
#   lay   drag the meter stick onto the object from its left end, then the 60 cm ruler onto the rest (flags stick, ruler)
#   show  the same picture with both tools already in place (no flags)
#   start drag the object so its left end sits on 0 (data-r ruler length in cm, data-s where it starts) (flag zero)
#   cut   a marble meter with a 60 cm ruler after it; drag the ribbon's end to each target in data-t (flags cut1, cut2…);
#         once the answer step after a cut (.ms-say1, .ms-say2…) is done, the marble meter shows the length both ways
# Run on the files after patch1007:
#   python tools/storybook/patch1101.py tools/storybook/sb.src.js assets/storybook/sb.js
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── mstick (3.11.01 meters and centimeters). data-mode lay | show | start | cut, data-len (object, cm),
     data-obj (cloth · board · rope · table · quill · cord · ribbon), data-label (the object's name on screen).
     lay: drag (or tap) the meter stick onto the object, then the 60 cm ruler onto the rest. Flags: stick, ruler.
     start: data-r (ruler length, cm), data-s (where the object starts); drag it (or arrow keys) so it starts at 0. Flag: zero.
     cut: data-t "108,141"; drag the ribbon's end (or arrow keys); flags cut1, cut2… when the end sits on that target
     while its step is open. The marble meter shows the length both ways once the step .ms-sayN after it is done. ── */
  MODS.mstick = function (box) {
    var mode = box.dataset.mode || 'lay', L = +box.dataset.len || 100, obj = box.dataset.obj || 'cloth', name = box.dataset.name || 'mstick';
    var lab = box.dataset.label || obj, R = +box.dataset.r || 25, T = (box.dataset.t || '').split(',').filter(Boolean).map(Number);
    var S = mstate(name, mode === 'start' ? { s: +box.dataset.s || 1 } : mode === 'cut' ? { len: 60, k: 0 } : { st: 0, ru: 0 });
    if (mode === 'show') { S = { st: 1, ru: 1 }; }
    var RU = 60, X0 = 14, BW = 672, narrow = false;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 260" role="group" aria-label="' + (mode === 'start' ? 'A ruler and a ' + lab : mode === 'cut' ? 'A marble meter, a ruler and a ribbon' : 'A ' + lab + ', a meter stick and a centimeter ruler') + '"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    var FILL = { cloth: '#F3E7C9', board: '#B07A45', rope: '#C9A46A', table: '#8B5A2B', quill: '#F7F3EA', cord: '#2F6FDE', ribbon: '#6B46C1' };
    function objBar(x, y, w, h) {
      var g = NS('g', {}, svg), c = FILL[obj] || '#C9A46A';
      if (obj === 'quill') {
        NS('rect', { x: x, y: y - 4, width: w, height: h + 8, fill: 'transparent' }, g);   // easy to grab
        NS('path', { d: 'M' + x + ' ' + (y + h / 2) + ' L' + (x + w * 0.18) + ' ' + (y + h * 0.42) + ' Q' + (x + w * 0.6) + ' ' + (y - h * 0.1) + ' ' + (x + w) + ' ' + (y + h * 0.2) + ' Q' + (x + w * 0.62) + ' ' + (y + h * 1.0) + ' ' + (x + w * 0.18) + ' ' + (y + h * 0.58) + ' Z', fill: c, stroke: '#7A6A4F', 'stroke-width': 2 }, g);
        NS('line', { x1: x, y1: y + h / 2, x2: x + w * 0.96, y2: y + h * 0.26, stroke: '#7A6A4F', 'stroke-width': 2 }, g);
        return g;
      }
      NS('rect', { x: x, y: y, width: w, height: h, rx: obj === 'rope' || obj === 'cord' || obj === 'ribbon' ? h / 2 : 4, fill: c, stroke: obj === 'cloth' ? '#B79A5B' : '#5A3A1A', 'stroke-width': 2 }, g);
      if (obj === 'cloth') for (var i = 1; i * 26 < w; i++) NS('text', { x: x + i * 26 - 6, y: y + h / 2 + 6, 'font-size': 15, fill: '#6B46C1', opacity: .55, text: '⚜', 'pointer-events': 'none' }, g);
      if (obj === 'board' || obj === 'table') for (var j = 1; j < 4; j++) NS('line', { x1: x + 4, y1: y + j * h / 4, x2: x + w - 4, y2: y + j * h / 4 + (j % 2 ? 2 : -2), stroke: '#6E4524', 'stroke-width': 1.2, opacity: .5 }, g);
      if (obj === 'rope') for (var q = 0; q * 12 < w; q++) NS('line', { x1: x + q * 12, y1: y + 2, x2: x + q * 12 + 10, y2: y + h - 2, stroke: '#8A6A3A', 'stroke-width': 2, opacity: .6 }, g);
      return g;
    }
    // a stick of `cm` centimeters starting at value v0 (labels v0…v0+cm), drawn at x, y with k px per cm
    function stick(g, x, y, cm, k, v0, kind, endLab) {
      var h = narrow ? 62 : 40, marble = kind === 'marble';
      NS('rect', { x: x, y: y, width: cm * k, height: h, rx: 3, fill: marble ? '#ECE7DE' : kind === 'meter' ? '#F6DE94' : '#EAF3FF', stroke: marble ? '#9A938A' : kind === 'meter' ? '#B8902A' : '#8FB2DA', 'stroke-width': 2 }, g);
      if (marble) { NS('path', { d: 'M' + (x + 10) + ' ' + (y + h - 6) + ' q' + (cm * k * 0.2) + ' -' + (h * 0.5) + ' ' + (cm * k * 0.45) + ' -' + (h * 0.2) + ' t' + (cm * k * 0.5) + ' -' + (h * 0.3), fill: 'none', stroke: '#C9C2B6', 'stroke-width': 2 }, g); }
      for (var i = 0; i <= cm; i++) {
        var v = v0 + i, big = v % 10 === 0, mid = v % 5 === 0, xx = x + i * k;
        NS('line', { x1: xx, y1: y, x2: xx, y2: y + (big ? h * 0.5 : mid ? h * 0.34 : h * 0.2), stroke: marble ? '#5E5850' : '#1F2A44', 'stroke-width': big ? 1.8 : 1 }, g);
        if (big && (i > 0 || v === 0) && (i < cm || endLab || (kind !== 'meter' && kind !== 'marble'))) NS('text', { x: xx, y: y + h - 5, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 12, 'font-weight': 800, fill: marble ? '#5E5850' : '#0E1C42', text: String(v), 'pointer-events': 'none' }, g);
      }
      return h;
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var LH = narrow ? 30 : 16, OH = narrow ? 56 : 34;
      if (mode === 'start') {
        var k = BW / (R + 1), yO = 8 + LH + 4, yR = yO + OH + 10;
        NS('text', { x: X0, y: 8 + LH - 6, 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5B6478', text: lab.toUpperCase() + ' · DRAG IT', 'pointer-events': 'none' }, svg);
        var rh = stick(NS('g', {}, svg), X0, yR, R, k, 0, R > 60 ? 'meter' : 'ruler', true);
        NS('text', { x: X0, y: yR + rh + LH + 4, 'font-size': narrow ? 20 : 13, 'font-weight': 800, fill: '#5B6478', text: R > 60 ? 'METER STICK · 1 METER' : 'CENTIMETER RULER', 'pointer-events': 'none' }, svg);
        var g = objBar(X0 + S.s * k, yO, L * k, OH); g.setAttribute('class', 'drag ms-obj'); g.setAttribute('tabindex', 0); g.setAttribute('role', 'button');
        g.setAttribute('aria-label', 'The ' + lab + '. Its left end is on ' + S.s + '. Use the arrow keys to move it.');
        NS('line', { x1: X0 + S.s * k, y1: yO - 4, x2: X0 + S.s * k, y2: yR + rh, stroke: S.s ? '#B23A2E' : '#1E7A4C', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
        var gx0 = 0;
        drag(g, svg, function (pt) { if (!gx0) gx0 = pt.x - (X0 + S.s * k); g.setAttribute('transform', 'translate(' + (pt.x - gx0 - (X0 + S.s * k)) + ',0)'); },
          function (pt) { if (pt) { S.s = Math.max(0, Math.min(R - L, Math.round((pt.x - gx0 - X0) / k))); save(); pluck(HZ.G4); } gx0 = 0; draw(); },
          function () { });
        g.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0; if (!dv) return; e.preventDefault(); S.s = Math.max(0, Math.min(R - L, S.s + dv)); save(); draw(); var n = $('.ms-obj', svg); if (n) n.focus(); });
        svg.setAttribute('viewBox', '0 0 700 ' + (yR + rh + LH + 12));
        flag(box, 'zero', S.s === 0); if (S.s === 0) flag(box, 'zero');
        msg(S.s === 0 ? 'The left end is on <b>0</b>.' : 'The left end is on <b>' + S.s + '</b>, not on 0.', S.s === 0);
        return;
      }
      if (mode === 'cut') {
        var kc = BW / 165, yRb = 8 + LH + 6, yS = yRb + OH + 12, gS = NS('g', {}, svg);
        var sh = stick(gS, X0, yS, 100, kc, 0, 'marble'); stick(gS, X0 + 100 * kc, yS, RU, kc, 0, 'ruler');
        NS('text', { x: X0 + 50 * kc, y: yS + sh + (narrow ? 30 : 22), 'text-anchor': 'middle', 'font-size': narrow ? 24 : 17, 'font-weight': 900, fill: '#5E5850', 'letter-spacing': 4, text: 'MÈTRE', 'pointer-events': 'none' }, svg);
        NS('text', { x: X0 + 130 * kc, y: yS + sh + (narrow ? 30 : 22), 'text-anchor': 'middle', 'font-size': narrow ? 22 : 12, 'font-weight': 800, fill: '#1D4FA8', text: 'CENTIMETER RULER', 'pointer-events': 'none' }, svg);
        NS('text', { x: X0, y: 8 + LH - 6, 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5B6478', text: 'RIBBON · DRAG ITS END', 'pointer-events': 'none' }, svg);
        var rib = objBar(X0, yRb, S.len * kc, OH).querySelector('rect'), len0 = S.len;
        var ex = X0 + S.len * kc, kn = NS('g', { class: 'drag ms-end', tabindex: 0, role: 'slider', 'aria-label': 'End of the ribbon', 'aria-valuemin': 1, 'aria-valuemax': 160, 'aria-valuenow': S.len }, svg);
        NS('circle', { cx: ex, cy: yRb + OH / 2, r: narrow ? 24 : 17, fill: '#fff', stroke: '#6B46C1', 'stroke-width': 4 }, kn);
        NS('text', { x: ex, y: yRb + OH / 2 + 6, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: '#6B46C1', text: '✂', 'pointer-events': 'none' }, kn);
        var gl = NS('line', { x1: ex, y1: yRb + OH, x2: ex, y2: yS + sh, stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
        var H = yS + sh + (narrow ? 40 : 30), say = 0;
        for (var t = 0; t < T.length; t++) { var sy = $('.ms-say' + (t + 1), box.closest('.sb-job') || document); if (sy && sy.classList.contains('right')) say = t + 1; }
        if (say) {
          var tv = T[say - 1], both = Math.floor(tv / 100) + ' m ' + (tv % 100) + ' cm = ' + tv + ' cm', bg = NS('g', { class: 'ms-both' }, svg);
          NS('rect', { x: X0 + 8 * kc, y: H, width: 84 * kc, height: narrow ? 44 : 34, rx: 8, fill: '#FFFBEF', stroke: '#C9A227', 'stroke-width': 2 }, bg);
          NS('text', { x: X0 + 50 * kc, y: H + (narrow ? 30 : 23), 'text-anchor': 'middle', 'font-size': narrow ? 24 : 18, 'font-weight': 900, fill: '#0E1C42', text: '✓ ' + both, 'pointer-events': 'none' }, bg);
          H += narrow ? 52 : 42;
        }
        svg.setAttribute('viewBox', '0 0 700 ' + H);
        // while dragging, only move the ribbon end (a redraw mid-drag would drop the pointer)
        drag(kn, svg, function (pt) { var v = Math.max(1, Math.min(160, Math.round((pt.x - X0) / kc))); if (v === S.len) return; S.len = v; rib.setAttribute('width', v * kc); kn.setAttribute('transform', 'translate(' + ((v - len0) * kc) + ',0)'); gl.setAttribute('x1', X0 + v * kc); gl.setAttribute('x2', X0 + v * kc); },
          function () { save(); pluck(HZ.G4); draw(); check(); }, function () { });
        kn.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0; if (!dv) return; e.preventDefault(); S.len = Math.max(1, Math.min(160, S.len + dv)); save(); draw(); check(); var n = $('.ms-end', svg); if (n) n.focus(); });
        check(true); return;
      }
      // lay / show
      var kl = BW / 165, yO2 = 8 + LH + 4, yT = yO2 + OH + 10, th = narrow ? 62 : 40, yTray = yT + th + LH + (narrow ? 40 : 26);
      NS('text', { x: X0, y: 8 + LH - 6, 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5B6478', text: lab.toUpperCase(), 'pointer-events': 'none' }, svg);
      objBar(X0, yO2, L * kl, OH);
      var endx = X0 + L * kl;
      NS('line', { x1: endx, y1: yO2 - 4, x2: endx, y2: yT + th + 6, stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
      var tray = !(S.st && S.ru);
      if (tray && mode !== 'show') NS('text', { x: X0, y: yTray - 8, 'font-size': narrow ? 20 : 13, 'font-weight': 900, fill: '#5B6478', text: 'TOOLS · drag or tap', 'pointer-events': 'none' }, svg);
      var ms = NS('g', { class: S.st ? '' : 'drag', tabindex: S.st ? -1 : 0, role: 'button', 'aria-label': 'Meter stick' }, svg);
      stick(ms, S.st ? X0 : X0, S.st ? yT : yTray, 100, kl, 0, 'meter');
      NS('text', { x: X0 + 50 * kl, y: (S.st ? yT : yTray) + th + (narrow ? 26 : 15), 'text-anchor': 'middle', 'font-size': narrow ? 22 : 12, 'font-weight': 800, fill: '#5A4300', text: 'METER STICK · 1 m', 'pointer-events': 'none' }, svg);
      var rx = S.ru ? X0 + 100 * kl : X0 + 104 * kl, ru = NS('g', { class: S.ru ? '' : 'drag', tabindex: S.ru ? -1 : 0, role: 'button', 'aria-label': 'Centimeter ruler' }, svg);
      stick(ru, rx, S.ru ? yT : yTray, RU, kl, 0, 'ruler');
      NS('text', { x: rx + 30 * kl, y: (S.ru ? yT : yTray) + th + (narrow ? 26 : 15), 'text-anchor': 'middle', 'font-size': narrow ? 22 : 12, 'font-weight': 800, fill: '#1D4FA8', text: 'CENTIMETER RULER', 'pointer-events': 'none' }, svg);
      svg.setAttribute('viewBox', '0 0 700 ' + ((tray && mode !== 'show') ? yTray + th + LH + 14 : yT + th + LH + 14));
      if (mode === 'show') { ms.removeAttribute('tabindex'); ru.removeAttribute('tabindex'); ms.removeAttribute('role'); ru.removeAttribute('role'); msg(''); return; }
      function place(which) {
        if (which === 'ru' && !S.st) { msg('Put the meter stick on first. Start at the left end of the ' + lab + '.'); return; }
        S[which] = 1; save(); pluck(which === 'st' ? HZ.D4 : HZ.G4); draw();
      }
      [[ms, 'st'], [ru, 'ru']].forEach(function (p) {
        if (S[p[1]]) return; var node = p[0], gx = 0, gy = 0, bx = p[1] === 'st' ? X0 : rx;
        drag(node, svg, function (pt) { if (!gx) { gx = pt.x - bx; gy = pt.y - yTray; } node.setAttribute('transform', 'translate(' + (pt.x - gx - bx) + ',' + (pt.y - gy - yTray) + ')'); },
          function (pt) { gx = 0; if (pt && pt.y < yTray) place(p[1]); else draw(); }, function () { place(p[1]); });
        node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(p[1]); } });
      });
      flag(box, 'stick', !!S.st); if (S.st) flag(box, 'stick');
      flag(box, 'ruler', !!(S.st && S.ru)); if (S.st && S.ru) flag(box, 'ruler');
      msg(!S.st ? 'Nothing is measured yet. The ' + lab + ' ends at the gold line.' : !S.ru ? 'The meter stick covers 1 meter. Some ' + lab + ' is left over past it.' : 'Both tools are down. The gold line shows where the ' + lab + ' ends on the ruler.', !!(S.st && S.ru));
    }
    function check(quiet) {
      if (mode !== 'cut') return;
      for (var t = 0; t < T.length; t++) {
        var nmF = 'cut' + (t + 1), st = stepFor(box, nmF);
        if (!quiet && st && st.classList.contains('now') && !st.classList.contains('right') && S.len === T[t]) { flag(box, nmF); if (!quiet) msg('✓ Cut! The ribbon ends right on the mark you wanted.', true); return; }
      }
      if (!quiet) msg(S.len > 100 ? 'The ribbon is longer than the marble meter.' : 'The ribbon is not as long as the marble meter.');
      else if (!out.innerHTML) msg(S.len > 100 ? 'The ribbon is longer than the marble meter.' : 'The ribbon is not as long as the marble meter.');
    }
    document.addEventListener('sb:step', function () { if (mode === 'cut') draw(); });
    onWidth(box, draw); draw();
  };

'''
# read aloud: say "m" and "cm" after a number as meters and centimeters ("1 m 46 cm" → "1 meter 46 centimeters")
RA0 = ".replace(/_{2,}/g, ' blank ').replace(/\\s+/g, ' ')\n"
RA1 = (".replace(/_{2,}/g, ' blank ').replace(/\\s+/g, ' ')\n"
       "      .replace(/\\b(\\d+|blank) (c?m)\\b/g, function (x, n, u) { return n + ' ' + (u === 'cm' ? 'centimeter' : 'meter') + (n === '1' ? '' : 's'); }).replace(/(meters?|centimeters?) = /g, '$1 equals ')\n")
SYM0 = "'The open side must face the greater fraction.'"
SYM1 = "'The open side must face the greater ' + ((String(a) + String(b)).indexOf('/') > -1 ? 'fraction.' : 'amount.')"
for p in sys.argv[1:]:
    s = open(p).read()
    if 'MODS.mstick' in s: print(p, 'already patched'); continue
    assert 'MODS.storyb' in s, p + ': run patch1007 first'
    assert s.count(MARK) == 1, p
    assert s.count(SYM0) == 1, p + ': sym message not as expected'
    assert s.count(RA0) == 1, p + ': read-aloud cleaner not as expected'
    s = s.replace(RA0, RA1)
    s = s.replace(SYM0, SYM1)
    s = s.replace(MARK, MOD + MARK)
    open(p, 'w').write(s); print(p, 'patched')
