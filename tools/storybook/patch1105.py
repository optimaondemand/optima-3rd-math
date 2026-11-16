# 3.11.05 layer change: new `beaker` and `thermo` models (liters and milliliters; reading a thermometer).
#
# beaker  data-beakers "cap:tick:lab:v[:liq]" (one or two, comma separated; liq = water|milk)
#         data-do      any of: read (drag the gold pointer up the marks, flag `marks` at the top of the liquid)
#                              fill (drag the top of the liquid in beaker A, snaps to a mark, flag `fill` at data-t)
#         data-bottles "n:tap"  (tap each 1 L bottle to fill it with 1,000 mL; flag `b` when all are full)
#                      "n:pour" (a ⤵ Pour button under each beaker pours into the first bottle that isn't full, until
#                               the bottle is full or the beaker is empty; flag `pour`, or pour1/pour2 with two beakers)
#         data-t (fill target). Each part that still needs doing has class bk-next: the pointer (.bk-ptr), the water top
#         (.bk-fill), the first empty bottle (.bk-bot) and the next Pour button (.bk-pour); steps cue the part they name,
#         e.g. data-cue=".bk-bot.bk-next".
#         Readouts say what happened ("9 marks up", "1 bottle is full"); they never say how much is left.
# thermo  data-f (start, °F), data-do "read drag", data-t (drag target, °F). °F marks every 2 (labels every 10),
#         °C marks every 1 (labels every 10), on one tube. Read: drag the gold pointer to the top of the red line
#         (flag `read`); a dashed line crosses both scales. Drag (shows once `read` is done, or at once without read):
#         drag the top of the red line, snaps to 2 °F, arrow keys (flag `temp` at data-t). Next action: th-next.
# Read aloud: "1 L 850 mL" → "1 liter 850 milliliters", "86 °F" → "86 degrees Fahrenheit", "°C" → Celsius.
# Run on the files after patch1104:
#   python tools/storybook/patch1105.py tools/storybook/sb.src.js assets/storybook/sb.js assets/storybook/sb.css
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── beaker (3.11.05 liters and milliliters). See tools/storybook/patch1105.py. ── */
  MODS.beaker = function (box) {
    var name = box.dataset.name || 'beaker', DO = ' ' + (box.dataset.do || '') + ' ', T = +box.dataset.t || 0;
    var B = (box.dataset.beakers || '1000:50:100:0').split(',').map(function (p) { var q = p.split(':'); return { cap: +q[0], tk: +q[1], lab: +q[2], v0: +q[3], liq: q[4] || 'water' }; });
    var bt = (box.dataset.bottles || '0:tap').split(':'), NB = +bt[0] || 0, BM = bt[1] || 'tap', two = B.length > 1;
    var S = mstate(name, { v: B.map(function (b) { return b.v0; }), p: -1, f: [], poured: [] });
    while (S.f.length < NB) S.f.push(0);
    function f(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    var LET = ['A', 'B'], narrow = false;
    box.innerHTML = '<div class="sb-stage sb-bk"><svg viewBox="0 0 700 330" role="group" aria-label="' + (two ? 'Two beakers' : 'A beaker') + (NB ? ' and ' + NB + ' empty 1 liter bottle' + (NB > 1 ? 's' : '') : '') + '"></svg></div>' +
      (BM === 'pour' && NB ? '<div class="sb-row bk-tools" style="margin-top:6px">' + B.map(function (b, i) { return '<button type="button" class="sb-btn bk-pour" data-i="' + i + '" aria-label="Pour beaker ' + LET[i] + ' into the bottle">⤵ Pour beaker ' + (two ? LET[i] + ' ' : '') + 'into the bottle</button>'; }).join('') + '</div>' : '') +
      '<div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function full(i) { return S.f[i] >= 1000; }
    function pour(i) {
      if (S.v[i] <= 0) { msg('Beaker ' + (two ? LET[i] + ' ' : '') + 'is empty.'); return; }
      var j = S.f.findIndex(function (x) { return x < 1000; });
      if (j < 0) { msg('Every bottle is full.'); return; }
      var room = 1000 - S.f[j], go = Math.min(room, S.v[i]); S.f[j] += go; S.v[i] -= go; S.poured[i] = 1; save(); pluck(full(j) ? HZ.C5 : HZ.E4); draw();
      msg(full(j) && S.v[i] ? 'The bottle is full. Some is still in the beaker.' : full(j) ? 'The bottle is full, and the beaker is empty.' : 'The beaker is empty. The bottle is not full yet.', full(j));
    }
    $$('.bk-pour', box).forEach(function (b) { b.addEventListener('click', function () { pour(+b.dataset.i); }); });
    function tapBottle(j) {
      if (BM !== 'tap' || full(j)) return;
      S.f[j] = 1000; save(); pluck(HZ.G4); draw();
      var n = S.f.filter(function (x) { return x >= 1000; }).length;
      msg(n === 1 ? '1 bottle is full.' : n + ' bottles are full.', n === NB);
    }
    function setFill(v) {
      var b = B[0]; v = Math.max(0, Math.min(b.cap, Math.round(v / b.tk) * b.tk)); var was = S.v[0]; S.v[0] = v; save(); if (v !== was) pluck(HZ.E4); draw();
      msg(v === T ? '✓ The beaker is filled to the mark you need.' : v ? 'Drag the top of the water. Stop at the mark the step tells you.' : 'The beaker is empty. Drag up to fill it.', v === T);
    }
    function setPtr(m) {
      var b = B[0]; m = Math.max(0, Math.min(b.cap / b.tk, m)); S.p = m;
      var at = m * b.tk === S.v[0]; if (at) S.rd = 1; save(); pluck(HZ.D4); draw();
      msg(at ? '✓ The pointer is at the top of the ' + (b.liq === 'milk' ? 'milk' : 'water') + '. It is ' + m + ' mark' + (m === 1 ? '' : 's') + ' up.' : 'The pointer is ' + m + ' mark' + (m === 1 ? '' : 's') + ' up.', at);
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var FS = narrow ? 22 : 13, bw = narrow ? 120 : 112, bh = narrow ? 360 : 250, y0 = narrow ? 52 : 40, yB = y0 + bh, next = null;
      var gx = []; B.forEach(function (b, i) { gx.push((narrow ? 92 : 78) + i * (bw + (narrow ? 112 : 100))); });
      B.forEach(function (b, i) {
        var x = gx[i], col = b.liq === 'milk' ? ['#EFE3C2', '#9C8650'] : ['#9CC8EE', '#3B7DC4'];
        function Y(v) { return yB - v / b.cap * bh; }
        var LB = b.lab; while (bh / (b.cap / LB) < FS * 1.15) LB *= 2;
        NS('text', { x: x + bw / 2, y: y0 - (narrow ? 22 : 16), 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#5B6478', text: (two ? (narrow ? LET[i] + ' · ' : 'BEAKER ' + LET[i] + ' · ') : 'BEAKER · ') + f(b.cap) + ' mL', 'pointer-events': 'none' }, svg);
        NS('path', { d: 'M' + (x - 6) + ' ' + (y0 - 4) + ' L' + x + ' ' + y0 + ' L' + x + ' ' + (yB - 8) + ' Q' + x + ' ' + yB + ' ' + (x + 8) + ' ' + yB + ' L' + (x + bw - 8) + ' ' + yB + ' Q' + (x + bw) + ' ' + yB + ' ' + (x + bw) + ' ' + (yB - 8) + ' L' + (x + bw) + ' ' + y0, fill: '#F7FAFD', stroke: '#5B6478', 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
        if (S.v[i] > 0) {
          var wy = Y(S.v[i]);
          NS('path', { class: 'bk-liq', d: 'M' + (x + 1.5) + ' ' + wy + ' L' + (x + bw - 1.5) + ' ' + wy + ' L' + (x + bw - 1.5) + ' ' + (yB - 8) + ' Q' + (x + bw - 1.5) + ' ' + (yB - 1.5) + ' ' + (x + bw - 8) + ' ' + (yB - 1.5) + ' L' + (x + 8) + ' ' + (yB - 1.5) + ' Q' + (x + 1.5) + ' ' + (yB - 1.5) + ' ' + (x + 1.5) + ' ' + (yB - 8) + ' Z', fill: col[0], 'pointer-events': 'none' }, svg);
          NS('line', { x1: x + 1.5, y1: wy, x2: x + bw - 1.5, y2: wy, stroke: col[1], 'stroke-width': 2.5, 'pointer-events': 'none' }, svg);
        }
        for (var m = b.tk; m <= b.cap; m += b.tk) {
          var big = m % b.lab === 0, yy = Y(m);
          NS('line', { x1: x, y1: yy, x2: x + (big ? 26 : 13), y2: yy, stroke: '#1F2A44', 'stroke-width': big ? 2 : 1.2, 'pointer-events': 'none' }, svg);
          if (m % LB === 0) NS('text', { x: x - 10, y: yy + FS * .36, 'text-anchor': 'end', 'font-size': FS, 'font-weight': 800, fill: '#0E1C42', text: f(m), 'pointer-events': 'none' }, svg);
        }
        NS('text', { x: x - 10, y: yB + FS * .36, 'text-anchor': 'end', 'font-size': FS, 'font-weight': 800, fill: '#0E1C42', text: '0', 'pointer-events': 'none' }, svg);
        if (i === 0 && DO.indexOf(' read ') > -1 && !S.poured[0]) {
          var pm = S.p < 0 ? 0 : S.p, py = Y(pm * b.tk), hit = NS('rect', { x: x - 2, y: y0, width: 40, height: bh, fill: 'transparent', style: 'cursor:pointer' }, svg);
          for (var lm = 1; lm <= pm; lm++) NS('line', { x1: x, y1: Y(lm * b.tk), x2: x + (lm * b.tk % b.lab === 0 ? 26 : 13), y2: Y(lm * b.tk), stroke: '#C9A227', 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
          var pg = NS('g', { class: 'drag bk-ptr' + (pm * b.tk !== S.v[0] ? ' bk-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'Gold pointer on the marks. Drag it up.', 'aria-valuemin': 0, 'aria-valuemax': b.cap / b.tk, 'aria-valuenow': pm }, svg);
          var r = narrow ? 17 : 13;
          NS('rect', { x: x, y: py - r - 2, width: bw + 2 * r + 8, height: 2 * r + 4, fill: 'transparent', style: 'cursor:grab' }, pg);
          NS('path', { d: 'M' + (x + bw + 4) + ' ' + py + ' l' + (2 * r) + ' ' + (-r) + ' l0 ' + (2 * r) + ' Z', fill: '#C9A227', stroke: '#8A6A00', 'stroke-width': 1.5 }, pg);
          NS('line', { x1: x, y1: py, x2: x + bw + 4, y2: py, stroke: '#C9A227', 'stroke-width': 2, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, pg);
          if (pm) NS('text', { x: x + bw + 2 * r + 10, y: py + FS * .36, 'font-size': FS, 'font-weight': 900, fill: '#8A6A00', text: pm + ' mark' + (pm === 1 ? '' : 's') + ' up', 'pointer-events': 'none' }, svg);
          if (!next && pm * b.tk !== S.v[0]) next = pg;
          var p0 = pm, live = pm;
          drag(pg, svg, function (pt) { var v = Math.max(0, Math.min(b.cap / b.tk, Math.round((yB - pt.y) / bh * b.cap / b.tk))); if (v === live) return; live = v; pg.setAttribute('transform', 'translate(0,' + (Y(v * b.tk) - Y(p0 * b.tk)) + ')'); }, function (pt) { if (pt) setPtr(live); else draw(); }, function () { });
          drag(hit, svg, null, function () { }, function (e) { setPtr(Math.round((yB - svgPt(svg, e).y) / bh * b.cap / b.tk)); });
          pg.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0; if (!dv) return; e.preventDefault(); setPtr((S.p < 0 ? 0 : S.p) + dv); var nn = $('.bk-ptr', svg); if (nn) nn.focus(); });
        }
        if (i === 0 && DO.indexOf(' fill ') > -1 && (DO.indexOf(' read ') < 0 || S.rd)) {
          var fy = Y(S.v[0]), fg = NS('g', { class: 'drag bk-fill' + (S.v[0] !== T ? ' bk-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'Top of the water. Drag it up or down.', 'aria-valuemin': 0, 'aria-valuemax': b.cap, 'aria-valuenow': S.v[0] }, svg);
          var hr = narrow ? 20 : 15;
          NS('rect', { x: x + bw / 2 - 2 * hr, y: fy - hr, width: 4 * hr, height: 2 * hr, rx: hr, fill: '#fff', stroke: '#3B7DC4', 'stroke-width': 3 }, fg);
          NS('text', { x: x + bw / 2, y: fy + FS * .36, 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: '↕', 'pointer-events': 'none' }, fg);
          if (!next && S.v[0] !== T) next = fg;
          var v0 = S.v[0], lv = S.v[0];
          drag(fg, svg, function (pt) { var v = Math.max(0, Math.min(b.cap, Math.round((yB - pt.y) / bh * b.cap / b.tk) * b.tk)); if (v === lv) return; lv = v; fg.setAttribute('transform', 'translate(0,' + (Y(v) - Y(v0)) + ')'); }, function (pt) { if (pt) setFill(lv); else draw(); }, function () { });
          fg.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowUp' ? b.tk : e.key === 'ArrowDown' ? -b.tk : 0; if (!dv) return; e.preventDefault(); setFill(S.v[0] + dv); var nn = $('.bk-fill', svg); if (nn) nn.focus(); });
        }
      });
      // 1 L bottles
      var bx0 = gx[B.length - 1] + bw + (narrow ? 120 : 110), room = 700 - 12 - bx0, sp = NB ? Math.min(narrow ? 150 : 104, room / NB) : 0, ow = Math.min(narrow ? 92 : 64, sp - 10), bodyH = narrow ? 230 : 160, by = yB;
      if (NB > 3 && narrow) { sp = room / Math.min(NB, 3); ow = Math.min(ow, sp - 10); }
      for (var j = 0; j < NB; j++) {
        var rowN = narrow && NB > 3 ? Math.floor(j / 3) : 0, cx = bx0 + (narrow && NB > 3 ? j % 3 : j) * sp + sp / 2, yb = narrow && NB > 3 ? (rowN ? yB : yB - bodyH / 2 - 60) : by;
        var bh2 = narrow && NB > 3 ? bodyH * .55 : bodyH, nk = ow * .38, top = yb - bh2, g = NS('g', {}, svg);
        NS('path', { d: 'M' + (cx - ow / 2) + ' ' + (yb - 10) + ' L' + (cx - ow / 2) + ' ' + (top + 18) + ' Q' + (cx - ow / 2) + ' ' + top + ' ' + (cx - nk / 2) + ' ' + (top - 8) + ' L' + (cx - nk / 2) + ' ' + (top - 34) + ' L' + (cx + nk / 2) + ' ' + (top - 34) + ' L' + (cx + nk / 2) + ' ' + (top - 8) + ' Q' + (cx + ow / 2) + ' ' + top + ' ' + (cx + ow / 2) + ' ' + (top + 18) + ' L' + (cx + ow / 2) + ' ' + (yb - 10) + ' Q' + (cx + ow / 2) + ' ' + yb + ' ' + (cx + ow / 2 - 10) + ' ' + yb + ' L' + (cx - ow / 2 + 10) + ' ' + yb + ' Q' + (cx - ow / 2) + ' ' + yb + ' ' + (cx - ow / 2) + ' ' + (yb - 10), fill: '#F3FAF5', stroke: '#4C7A5A', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
        if (S.f[j] > 0) {
          var lh = (bh2 - 6) * Math.min(1, S.f[j] / 1000), liq = B.some(function (b) { return b.liq === 'milk'; }) ? '#EFE3C2' : '#9CC8EE';
          NS('rect', { x: cx - ow / 2 + 2, y: yb - 2 - lh, width: ow - 4, height: lh, rx: 6, fill: liq, stroke: liq === '#EFE3C2' ? '#9C8650' : '#3B7DC4', 'stroke-width': 1.5, 'pointer-events': 'none' }, g);
          if (full(j)) NS('text', { x: cx, y: yb - bh2 / 2 + FS * .36, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 11.5, 'font-weight': 900, fill: '#0E1C42', text: '1,000 mL', 'pointer-events': 'none' }, g);
        }
        NS('rect', { x: cx - ow * .36, y: top + 12, width: ow * .72, height: FS + 8, rx: 4, fill: '#fff', stroke: '#4C7A5A', 'stroke-width': 1.5, 'pointer-events': 'none' }, g);
        NS('text', { x: cx, y: top + 12 + FS * .98, 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#2E5B3C', text: '1 L', 'pointer-events': 'none' }, g);
        if (BM === 'tap') {
          var can = !full(j);
          var first = can && S.f.findIndex(function (x) { return x < 1000; }) === j;
          g.setAttribute('class', 'bk-bot' + (first ? ' bk-next' : '')); g.setAttribute('role', 'button'); g.setAttribute('tabindex', can ? 0 : -1);
          g.setAttribute('aria-label', '1 liter bottle' + (can ? ', empty. Tap to fill it.' : ', full.'));
          if (can) { g.style.cursor = 'pointer'; if (!next) next = g; }
          (function (jj) { drag(g, svg, null, function () { }, function () { tapBottle(jj); }); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapBottle(jj); } }); })(j);
        }
      }
      $$('.bk-pour', box).forEach(function (pb) { var i = +pb.dataset.i, need = !S.poured[i] && (i === 0 || S.poured[i - 1]); pb.disabled = S.v[i] <= 0 || S.f.every(function (x) { return x >= 1000; }); pb.classList.toggle('bk-next', need && !pb.disabled); });
      svg.setAttribute('viewBox', '0 0 700 ' + (yB + (narrow ? 26 : 18)));
      // flags: what is done stays done
      var b0 = B[0];
      if (DO.indexOf(' read ') > -1 && S.p >= 0 && S.p * b0.tk === S.v[0]) flag(box, 'marks');
      if (DO.indexOf(' fill ') > -1 && T && S.v[0] === T) flag(box, 'fill');
      if (NB && BM === 'tap' && S.f.every(function (x) { return x >= 1000; })) flag(box, 'b');
      B.forEach(function (b, i) { if (S.poured[i]) flag(box, two ? 'pour' + (i + 1) : 'pour'); });
      if (!out.innerHTML) msg(DO.indexOf(' read ') > -1 ? 'Drag the gold pointer up the marks.' : NB && BM === 'tap' ? 'Each bottle holds 1 liter.' : DO.indexOf(' fill ') > -1 ? 'Drag the top of the water.' : NB ? 'The bottle is empty. It holds 1 liter.' : '');
    }
    onWidth(box, draw); draw();
  };

  /* ── thermo (3.11.05 reading a thermometer, °F and °C on one tube). See tools/storybook/patch1105.py. ── */
  MODS.thermo = function (box) {
    var name = box.dataset.name || 'thermo', DO = ' ' + (box.dataset.do || 'read') + ' ', T = +box.dataset.t || 0, LO = 30, HI = 110;
    var S = mstate(name, { f: +box.dataset.f || 70, p: -1 });
    box.innerHTML = '<div class="sb-stage sb-th"><svg viewBox="0 0 700 460" role="group" aria-label="A thermometer with degrees Fahrenheit on the left and degrees Celsius on the right"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), narrow = false;
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function setP(v) { v = Math.max(LO, Math.min(HI, Math.round(v / 2) * 2)); S.p = v; if (v === S.f) S.r = 1; save(); pluck(HZ.D4); draw(); msg(v === S.f ? '✓ The pointer is at the top of the red line.' : 'Keep going. Stop at the top of the red line.', v === S.f); }
    function setF(v) { v = Math.max(LO, Math.min(HI, Math.round(v / 2) * 2)); var was = S.f; S.f = v; S.p = v; save(); if (v !== was) pluck(v > was ? HZ.G4 : HZ.D4); draw(); msg(v === T ? '✓ The red line is at the temperature you need.' : v > was ? 'Warmer: the red line went up.' : v < was ? 'Cooler: the red line went down.' : '', v === T); }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var FS = narrow ? 22 : 14, cx = 350, tw = narrow ? 34 : 26, yT = 40, yL = narrow ? 560 : 400, H = yL - yT, next = null;
      function Y(F) { return yL - (F - LO) / (HI - LO) * H; }
      NS('text', { x: cx - 120, y: 24, 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#B23A2E', text: '°F', 'pointer-events': 'none' }, svg);
      NS('text', { x: cx + 120, y: 24, 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: '°C', 'pointer-events': 'none' }, svg);
      NS('rect', { x: cx - tw / 2, y: yT - 14, width: tw, height: H + 30, rx: tw / 2, fill: '#F7FAFD', stroke: '#5B6478', 'stroke-width': 3 }, svg);
      NS('circle', { cx: cx, cy: yL + 34, r: tw * 1.05, fill: '#D9473A', stroke: '#5B6478', 'stroke-width': 3 }, svg);
      NS('rect', { x: cx - tw / 2 + 7, y: Y(S.f), width: tw - 14, height: yL + 34 - Y(S.f), fill: '#D9473A', 'pointer-events': 'none' }, svg);
      for (var F = LO; F <= HI; F += 2) { var big = F % 10 === 0, y = Y(F); NS('line', { x1: cx - tw / 2 - (big ? 34 : 18), y1: y, x2: cx - tw / 2 - 2, y2: y, stroke: '#1F2A44', 'stroke-width': big ? 2 : 1.2, 'pointer-events': 'none' }, svg); if (big) NS('text', { x: cx - tw / 2 - 42, y: y + FS * .36, 'text-anchor': 'end', 'font-size': FS, 'font-weight': 800, fill: '#0E1C42', text: F, 'pointer-events': 'none' }, svg); }
      for (var C = -1; C <= 43; C++) { var yc = Y(C * 9 / 5 + 32), bc = C % 10 === 0; NS('line', { x1: cx + tw / 2 + 2, y1: yc, x2: cx + tw / 2 + (bc ? 34 : C % 5 === 0 ? 24 : 16), y2: yc, stroke: '#1F2A44', 'stroke-width': bc ? 2 : 1.2, 'pointer-events': 'none' }, svg); if (bc) NS('text', { x: cx + tw / 2 + 42, y: yc + FS * .36, 'font-size': FS, 'font-weight': 800, fill: '#0E1C42', text: C, 'pointer-events': 'none' }, svg); }
      if (DO.indexOf(' read ') > -1) {
        var pv = S.p < 0 ? LO : S.p, py = Y(pv), r = narrow ? 17 : 13;
        var pg = NS('g', { class: 'drag th-ptr' + (pv !== S.f ? ' th-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'Gold pointer. Drag it up the marks.', 'aria-valuemin': LO, 'aria-valuemax': HI, 'aria-valuenow': pv }, svg);
        // the line skips the two columns of numbers, so it never runs through a label
        [[cx - 190, cx - tw / 2 - 46 - FS * 1.9], [cx - tw / 2 - 38, cx + tw / 2 + 38], [cx + tw / 2 + 46 + FS * 1.3, cx + 190]].forEach(function (sg) { NS('line', { x1: sg[0], y1: py, x2: sg[1], y2: py, stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, pg); });
        NS('path', { d: 'M' + (cx - 192) + ' ' + py + ' l' + (-2 * r) + ' ' + (-r) + ' l0 ' + (2 * r) + ' Z', fill: '#C9A227', stroke: '#8A6A00', 'stroke-width': 1.5 }, pg);
        NS('rect', { x: cx - 200 - 2 * r, y: py - r - 4, width: 390 + 2 * r, height: 2 * r + 8, fill: 'transparent', style: 'cursor:grab' }, pg);
        if (pv !== S.f && !next) next = pg;
        var p0 = pv, live = pv;
        drag(pg, svg, function (pt) { var v = Math.max(LO, Math.min(HI, Math.round((LO + (yL - pt.y) / H * (HI - LO)) / 2) * 2)); if (v === live) return; live = v; pg.setAttribute('transform', 'translate(0,' + (Y(v) - Y(p0)) + ')'); }, function (pt) { if (pt) setP(live); else draw(); }, function () { });
        pg.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowUp' ? 2 : e.key === 'ArrowDown' ? -2 : 0; if (!dv) return; e.preventDefault(); setP((S.p < 0 ? LO : S.p) + dv); var nn = $('.th-ptr', svg); if (nn) nn.focus(); });
      }
      if (DO.indexOf(' drag ') > -1 && (DO.indexOf(' read ') < 0 || S.r)) {
        var hy = Y(S.f), hr = narrow ? 20 : 15, hg = NS('g', { class: 'drag th-top' + (S.f !== T ? ' th-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'Top of the red line. Drag it up or down.', 'aria-valuemin': LO, 'aria-valuemax': HI, 'aria-valuenow': S.f }, svg);
        NS('circle', { cx: cx, cy: hy, r: hr, fill: '#fff', stroke: '#B23A2E', 'stroke-width': 4 }, hg);
        NS('text', { x: cx, y: hy + FS * .36, 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#B23A2E', text: '↕', 'pointer-events': 'none' }, hg);
        if (S.f !== T && !next) next = hg;
        var f0 = S.f, lf = S.f;
        drag(hg, svg, function (pt) { var v = Math.max(LO, Math.min(HI, Math.round((LO + (yL - pt.y) / H * (HI - LO)) / 2) * 2)); if (v === lf) return; lf = v; hg.setAttribute('transform', 'translate(0,' + (Y(v) - Y(f0)) + ')'); }, function (pt) { if (pt) setF(lf); else draw(); }, function () { });
        hg.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowUp' ? 2 : e.key === 'ArrowDown' ? -2 : 0; if (!dv) return; e.preventDefault(); setF(S.f + dv); var nn = $('.th-top', svg); if (nn) nn.focus(); });
      }
      svg.setAttribute('viewBox', '0 0 700 ' + (yL + 34 + tw * 1.05 + 10));
      if (DO.indexOf(' read ') > -1 && S.r) flag(box, 'read');
      if (T && S.f === T && (S.r || DO.indexOf(' read ') < 0)) flag(box, 'temp');
      if (!out.innerHTML) msg(DO.indexOf(' read ') > -1 && S.p !== S.f ? 'Drag the gold pointer up to the top of the red line.' : '');
    }
    onWidth(box, draw); draw();
  };

'''
RA_OLD = ".replace(/\\b(\\d[\\d,]*|blank) km\\b/g,"
RA_NEW = ".replace(/\\b(\\d[\\d,]*|blank) mL\\b/g, function (x, n) { return n + ' milliliter' + (n === '1' ? '' : 's'); }).replace(/\\b(\\d[\\d,]*|blank) L\\b/g, function (x, n) { return n + ' liter' + (n === '1' ? '' : 's'); }).replace(/(\\d+|blank) ?°F/g, '$1 degrees Fahrenheit').replace(/(\\d+|blank) ?°C/g, '$1 degrees Celsius').replace(/(liters?|milliliters?) = /g, '$1 equals ')" + RA_OLD
CSS = """
/* 3.11.05 beaker + thermometer */
.sb-bk svg .bk-bot:focus-visible,.sb-bk svg .drag:focus-visible,.sb-th svg .drag:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.bk-tools{display:flex;gap:8px;flex-wrap:wrap}
"""
for p in sys.argv[1:]:
    if p.endswith('.css'):
        c = open(p).read()
        if 'bk-tools' in c: print(p, 'already patched'); continue
        open(p, 'w').write(c.rstrip('\n') + '\n' + CSS); print(p, 'patched'); continue
    s = open(p).read()
    if 'MODS.beaker' in s: print(p, 'already patched'); continue
    assert 'MODS.cutkm' in s, p + ': run patch1104 first'
    assert s.count(MARK) == 1, p
    s = s.replace(MARK, MOD + MARK)
    assert s.count(RA_OLD) == 1, p + ': read-aloud line not as expected'
    s = s.replace(RA_OLD, RA_NEW)
    open(p, 'w').write(s); print(p, 'patched')
