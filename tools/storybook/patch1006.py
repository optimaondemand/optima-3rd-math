# 3.10.06 layer change: new `addsub` model (one Fraction Tiles bar: add tiles, take tiles away, or cut 1 whole first)
# and new `mfill` model (Measure Filler: measures with notes already written; add sixteenths until each is full; Play).
# Run on the files after patch1005:
#   python tools/storybook/patch1006.py tools/storybook/sb.src.js assets/storybook/sb.js
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── addsub (3.10.06): one bar of same-size tiles. data-d (denominator), data-ops "+5,+9,-3" (or "cut,-4"),
     data-start (tiles already there), data-label (the whole bar's label), data-what ("notes"). Each op is a part:
     add tiles from the tray (drag or tap), take tiles away (tap a tile; it turns into a dashed outline with an ✕),
     or ✂ cut 1 whole into equal tiles. Flags: f1, f2, … (that part is done) ── */
  MODS.addsub = function (box) {
    var d = +box.dataset.d, OPS = box.dataset.ops.split(','), name = box.dataset.name || 'addsub', st0 = +box.dataset.start || 0, lab = box.dataset.label || '1 whole';
    var S = mstate(name, { n: null, x: {} }); if (!S.n) { S.n = []; for (var q = 0; q < st0; q++) S.n.push(-1); }
    var hasAdd = OPS.some(function (o) { return o[0] === '+'; }), hasCut = OPS.indexOf('cut') > -1;
    var BW = 680, LX = 10, RH = 52, Y0 = 8, BY = 0, TY = 0, narrow = false, PH = ['#C9A227', '#B23A2E', '#6B46C1'];
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 220" role="group" aria-label="Fraction tiles in ' + DPL(d) + '"></svg></div>' +
      (hasCut ? '<div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn as-cut">✂ Cut 1 whole into ' + DPL(d) + '</button></div>' : '') + '<div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), cutB = $('.as-cut', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function nm(k) { return k + ' ' + (k === 1 ? DNAME[d] : DPL(d)); }
    function cur() { for (var i = 0; i < OPS.length; i++) if (!stepDoneFor(box, 'f' + (i + 1))) return i; return OPS.length; }
    function want(i) { return OPS[i] === 'cut' ? d : Math.abs(+OPS[i]); }
    function got(i) { if (OPS[i] === 'cut') return S.n.length; if (OPS[i][0] === '+') return S.n.filter(function (p) { return p === i; }).length; var c = 0; for (var k in S.x) if (S.x[k] === i) c++; return c; }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; RH = narrow ? 80 : 52; BY = Y0 + RH + (narrow ? 40 : 30); TY = BY + RH + (narrow ? 64 : 48);
      var c = cur(), trayOn = c < OPS.length && OPS[c][0] === '+', H = trayOn ? TY + RH + 12 : BY + RH + 12;
      svg.setAttribute('viewBox', '0 0 700 ' + H); svg.innerHTML = '';
      wholeBar(svg, LX, Y0, BW, RH, lab);
      NS('rect', { x: LX, y: BY, width: BW, height: RH, rx: 6, fill: '#F6F7FB', stroke: '#AEB6CC', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
      var w = BW / d, noLab = narrow && d > 10;
      if (hasCut && !S.n.length) { var wb = NS('g', { 'pointer-events': 'none' }, svg); NS('rect', { x: LX + 1, y: BY, width: BW - 2, height: RH, rx: 6, fill: '#3A4A78' }, wb); NS('text', { x: LX + BW / 2, y: BY + RH / 2 + 7, 'text-anchor': 'middle', 'font-size': narrow ? 26 : 19, 'font-weight': 900, fill: '#fff', text: '1 whole, not cut yet' }, wb); }
      S.n.forEach(function (p, i) {
        var tk = S.x[i] != null, g;
        if (tk) {
          g = NS('g', { class: 'tile as-t taken' }, svg);
          NS('rect', { x: LX + i * w + 1, y: BY, width: w - 2, height: RH, rx: 6, fill: '#fff', stroke: DCOL[d], 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
          NS('text', { x: LX + i * w + w / 2, y: BY + RH / 2 + 9, 'text-anchor': 'middle', 'font-size': narrow ? 34 : 26, 'font-weight': 900, fill: OPS.slice(0, S.x[i]).some(function (o) { return o[0] === '-'; }) ? '#6B46C1' : '#B23A2E', text: '✕', 'pointer-events': 'none' }, g);
        } else {
          g = ftile(svg, LX + i * w, BY, w, RH, d, true, 'tile as-t');
          if (p > 0) { g.querySelector('rect').setAttribute('fill-opacity', '0.5'); $$('text,line', g).forEach(function (t) { t.setAttribute('fill', '#0E1C42'); t.setAttribute('stroke', '#0E1C42'); }); }
          if (noLab && g.querySelector('g')) g.querySelector('g').remove();
        }
        g.dataset.i = i; g.setAttribute('tabindex', 0); g.setAttribute('role', 'button');
        g.setAttribute('aria-label', 'Tile ' + (i + 1) + (tk ? ', taken away' : ''));
        function act() { tap(i); }
        g.addEventListener('click', act); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      });
      for (var j = 1; j < d && noLab; j++) NS('line', { x1: LX + j * w, y1: BY + RH + 2, x2: LX + j * w, y2: BY + RH + 10, stroke: '#AEB6CC', 'stroke-width': 2, 'pointer-events': 'none' }, svg);
      if (trayOn) {
        NS('text', { x: LX, y: TY - 12, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: 'TRAY · drag or tap a one-' + DNAME[d] + ' tile', 'pointer-events': 'none' }, svg);
        var tw = Math.max(w, narrow ? 90 : 60), tr = ftile(svg, LX, TY, tw, RH, d, false, 'tile as-tray'); tr.setAttribute('tabindex', 0); tr.setAttribute('role', 'button'); tr.setAttribute('aria-label', 'Add a one-' + DNAME[d] + ' tile');
        var ghost = null;
        drag(tr, svg, function (pt) { if (!ghost) { ghost = ftile(svg, 0, 0, w, RH, d, true); ghost.setAttribute('opacity', .8); ghost.style.pointerEvents = 'none'; } ghost.setAttribute('transform', 'translate(' + (pt.x - w / 2) + ',' + (pt.y - RH / 2) + ')'); },
          function (pt) { if (ghost) ghost.remove(); ghost = null; if (pt && pt.y > BY - 40 && pt.y < BY + RH + 40) add(); }, add);
        tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(); } });
      }
      if (cutB) cutB.disabled = S.n.length > 0;
      report();
    }
    function add() {
      var c = cur(); if (c >= OPS.length || OPS[c][0] !== '+') return;
      if (S.n.length >= d) { msg('The bar is full. It can only hold 1 whole.'); return; }
      if (got(c) >= want(c)) { msg('That is all ' + want(c) + '. Count again: you need ' + nm(want(c)) + ' in this part.'); return; }
      S.n.push(c); save(); pluck(HZ.G4); draw();
    }
    function tap(i) {
      var c = cur(); if (c >= OPS.length) return;
      var op = OPS[c];
      if (op[0] === '+') { if (S.n[i] === c && i === S.n.length - 1) { S.n.pop(); save(); draw(); } else msg('Drag a tile from the tray to add one. Tap your last new tile to take it back.'); return; }
      if (op[0] === '-') {
        if (S.x[i] != null) { if (S.x[i] === c) { delete S.x[i]; save(); draw(); } return; }
        if (got(c) >= want(c)) { msg('You took away ' + nm(want(c)) + ' already. Tap an ✕ tile to put it back.'); return; }
        S.x[i] = c; save(); pluck(HZ.D4); draw(); return;
      }
      msg('Press ✂ Cut 1 whole into ' + DPL(d) + ' first.');
    }
    if (cutB) cutB.addEventListener('click', function () { if (S.n.length) return; for (var k = 0; k < d; k++) S.n.push(-1); save(); pluck(HZ.C5); draw(); });
    function report() {
      var c = cur(), done = [];
      OPS.forEach(function (op, i) { var ok = got(i) === want(i); flag(box, 'f' + (i + 1), ok); if (ok && i <= c) flag(box, 'f' + (i + 1)); });
      c = cur();
      var left = S.n.length - Object.keys(S.x).length, base = st0 ? nm(st0) + ' to start' : '';
      if (c >= OPS.length) { msg('Done. Count the shaded tiles to check your answer.', true); return; }
      var op = OPS[c], g = got(c);
      if (op === 'cut') msg('1 whole is one big piece. Cut it into ' + DPL(d) + '.');
      else if (op[0] === '+') msg(c === 0 && !st0 ? 'Tiles added: <b>' + g + '</b>' : 'New tiles added: <b>' + g + '</b> (the lighter ones)');
      else msg('Tiles taken away: <b>' + g + '</b>');
    }
    var lastC = -1; document.addEventListener('sb:step', function () { var c = cur(); if (c !== lastC) { lastC = c; draw(); } else report(); }); onWidth(box, draw); draw(); lastC = cur();
  };

  /* ── mfill (3.10.06 Measure Filler): data-d 16, data-m "13,11,9" (sixteenths already written in each measure).
     Drag (or tap the tray, then tap a measure) to add one-sixteenth tiles; tap a new tile to take it back.
     Flags: all (every measure is exactly 1 whole) · play ── */
  MODS.mfill = function (box) {
    var d = +box.dataset.d || 16, M = box.dataset.m.split(',').map(Number), name = box.dataset.name || 'mfill', S = mstate(name, { a: M.map(function () { return 0; }), played: 0 }), busy = false, sel = false;
    var BW = 680, LX = 10, RH = 50, GAPY = 46, narrow = false, Y = [], TY = 0;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 300" role="group" aria-label="' + M.length + ' measures to fill"></svg></div>' +
      '<div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn mf-play">▶ Play the measures</button><button type="button" class="sb-btn ghost mf-0">↺ Start over</button></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function full(r) { return M[r] + S.a[r] === d; }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; RH = narrow ? 76 : 50; GAPY = narrow ? 70 : 46;
      Y = M.map(function (m, r) { return 8 + r * (RH + GAPY) + GAPY - 10; }); TY = Y[M.length - 1] + RH + (narrow ? 70 : 52);
      svg.setAttribute('viewBox', '0 0 700 ' + (TY + RH + 12)); svg.innerHTML = '';
      var w = BW / d;
      M.forEach(function (m, r) {
        var y = Y[r];
        NS('text', { x: LX, y: y - 12, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: full(r) ? '#1E7A4C' : '#5B6478', text: 'MEASURE ' + (r + 1) + (full(r) ? ' · full ✓' : ''), 'pointer-events': 'none' }, svg);
        var bg = NS('rect', { class: 'mf-row', x: LX, y: y, width: BW, height: RH, rx: 6, fill: sel ? '#FFF7DC' : '#F6F7FB', stroke: sel ? '#C9A227' : '#AEB6CC', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
        bg.dataset.r = r;
        for (var i = 0; i < m + S.a[r]; i++) (function (i) {
          var neu = i >= m, g = ftile(svg, LX + i * w, y, w, RH, d, true, 'tile' + (neu ? ' mf-new' : ''));
          if (narrow && g.querySelector('g')) g.querySelector('g').remove();
          if (!neu) { g.querySelector('rect').setAttribute('fill', '#4A3426'); return; }
          g.querySelector('rect').setAttribute('fill-opacity', '0.55');
          g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Measure ' + (r + 1) + ': take back this sixteenth');
          function rm() { if (i === m + S.a[r] - 1) { S.a[r]--; S.played = 0; save(); draw(); } }
          g.addEventListener('click', rm); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rm(); } });
        })(i);
      });
      NS('text', { x: LX, y: TY - 12, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: 'TRAY · drag a one-sixteenth tile into a measure', 'pointer-events': 'none' }, svg);
      var tw = narrow ? 90 : 60, tr = ftile(svg, LX, TY, tw, RH, d, sel, 'tile mf-tray'); tr.setAttribute('tabindex', 0); tr.setAttribute('role', 'button'); tr.setAttribute('aria-label', 'A one-sixteenth tile. Tap it, then tap a measure.');
      var ghost = null;
      drag(tr, svg, function (pt) { if (!ghost) { ghost = ftile(svg, 0, 0, w, RH, d, true); ghost.setAttribute('opacity', .8); ghost.style.pointerEvents = 'none'; } ghost.setAttribute('transform', 'translate(' + (pt.x - w / 2) + ',' + (pt.y - RH / 2) + ')'); },
        function (pt) { if (ghost) ghost.remove(); ghost = null; if (!pt) return; for (var r = 0; r < M.length; r++) if (pt.y > Y[r] - 24 && pt.y < Y[r] + RH + 24) { add(r); return; } },
        function () { sel = !sel; draw(); if (sel) msg('Now tap the measure where it goes.'); });
      tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); var r = M.findIndex(function (m, k) { return !full(k); }); if (r > -1) add(r); } });
      report();
    }
    function add(r) { if (full(r)) { draw(); msg('Measure ' + (r + 1) + ' is full: ' + d + ' sixteenths make 1 whole. It can\'t hold more.'); return; } S.a[r]++; S.played = 0; save(); pluck(HZ.G4 * (1 + 0.06 * r)); draw(); }
    svg.addEventListener('click', function (e) { if (!sel) return; var pt = svgPt(svg, e); for (var r = 0; r < M.length; r++) if (pt.y > Y[r] - 10 && pt.y < Y[r] + RH + 10) { sel = false; add(r); return; } });
    $('.mf-0', box).addEventListener('click', function () { S.a = M.map(function () { return 0; }); S.played = 0; sel = false; save(); draw(); });
    var MEL = ['G4', 'A4', 'B4', 'D5', 'B4', 'A4', 'G4', 'D4'], NEW = ['D5', 'E5', 'D5', 'B4', 'G5', 'E5', 'D5', 'B4'];
    $('.mf-play', box).addEventListener('click', function () {
      if (busy) return; if (!M.every(function (m, r) { return full(r); })) { msg('Fill every measure first. Each one must be exactly 1 whole.'); return; }
      busy = true; musicDuck(); var Mt = 2.4, dt = Mt / d;
      M.forEach(function (m, r) { for (var i = 0; i < d; i++) pluck(HZ[(i < m ? MEL : NEW)[i % 8]], r * Mt + i * dt); });
      M.forEach(function (m, r) { setTimeout(function () { playhead(svg, LX, BW, Y[r] - 4, Y[r] + RH + 4, Mt); }, r * Mt * 1000); });
      setTimeout(function () { busy = false; S.played = 1; save(); report(); }, M.length * Mt * 1000 + 150);
    });
    function report() {
      var all = M.every(function (m, r) { return full(r); }); flag(box, 'all', all); if (all) flag(box, 'all');
      if (all && S.played) { flag(box, 'play'); msg('Every measure is exactly 1 whole, so the music keeps a steady beat.', true); return; }
      if (all) { msg('Every measure is full: ' + d + ' sixteenths each.', true); return; }
      var n = M.filter(function (m, r) { return full(r); }).length; if (!sel) msg(n ? n + ' of ' + M.length + ' measures ' + (n === 1 ? 'is' : 'are') + ' full.' : 'The dark notes are already written. Fill the empty space in each measure.');
    }
    document.addEventListener('sb:step', report); onWidth(box, draw); draw();
  };

'''
for p in sys.argv[1:]:
    s = open(p).read()
    if 'MODS.mfill' in s: print(p, 'already patched'); continue
    assert 'MODS.halfsort' in s, p + ': run patch1005 first'
    assert s.count(MARK) == 1, p
    s = s.replace(MARK, MOD + MARK)
    open(p, 'w').write(s); print(p, 'patched')
