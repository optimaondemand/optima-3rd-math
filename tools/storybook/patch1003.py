import sys, re
p = sys.argv[1]; s = open(p, encoding='utf-8').read(); orig = s
def rep(a, b, n=1):
    global s
    c = s.count(a); assert c == n, (c, a[:80]); s = s.replace(a, b)
# 1-3: sixteenths and twentieths
rep("10: '#117E7E', 11: '#8C2F6E', 12: '#5B6478' };", "10: '#117E7E', 11: '#8C2F6E', 12: '#5B6478', 16: '#6D4C41', 20: '#3949AB' };")
rep("10: 'tenth', 11: 'eleventh', 12: 'twelfth' };", "10: 'tenth', 11: 'eleventh', 12: 'twelfth', 16: 'sixteenth', 20: 'twentieth' };", 2)
# 4: stack — a row that can't line up with the gold line is a "try" row (3.10.03 Think: halves can't show 8 tenths)
rep("    function good(i) { return S.k[i] * D[0] === k * D[i]; }\n    function draw() {\n      svg.innerHTML = ''; wholeBar(svg, LX, Y0, BW, RH, '1 whole measure');\n      D.forEach(function (d, r) {",
    "    function can(i) { return (k * D[i]) % D[0] === 0; }\n    function good(i) { return can(i) ? S.k[i] * D[0] === k * D[i] : S.k[i] > 0; }\n    function draw() {\n      svg.innerHTML = ''; wholeBar(svg, LX, Y0, BW, RH, '1 whole measure');\n      D.forEach(function (d, r) {")
rep("""      var bad = D.map(function (d, r) { return r && S.k[r] && !good(r) ? r : 0; }).filter(Boolean)[0];
      if (all) msg('Every row is shaded right up to the gold line. Same amount, three names.', true);""",
"""      var bad = D.map(function (d, r) { return r && S.k[r] && can(r) && !good(r) ? r : 0; }).filter(Boolean)[0];
      var tried = D.map(function (d, r) { return r && S.k[r] && !can(r) ? r : 0; }).filter(Boolean);
      var no = tried.map(function (r) { var lo = Math.floor(k * D[r] / D[0]), nm = DNAME[D[r]]; var pl = DPL(D[r]); return (lo ? lo + ' ' + (lo > 1 ? pl + ' stop' : nm + ' stops') + ' before the gold line and ' : '') + (lo + 1) + ' ' + (lo + 1 > 1 ? pl + ' go' : nm + ' goes') + ' past it. ' + pl.charAt(0).toUpperCase() + pl.slice(1) + ' can\\'t show this amount.'; }).join(' ');
      if (all && tried.length) msg(no + ' The other ' + (D.length - 1 - tried.length > 1 ? 'rows line' : 'row lines') + ' up right on the gold line.', true);
      else if (all) msg('Every row is shaded right up to the gold line. Same amount, three names.', true);
      else if (no && !bad) msg(no + ' Try the next row.');""")
# 5: arrows — data-op="div": ÷ tags (3.10.03)
rep("    var S = mstate(name, { t: 0, u: 0 }), TAGS = [2, 3, 4, 5];",
    "    var S = mstate(name, { t: 0, u: 0 }), TAGS = [2, 3, 4, 5], dv = box.dataset.op === 'div', OP = dv ? '÷' : '×';")
rep("""'<button type="button" class="sym-card ar-card" data-t="' + t + '" aria-label="times ' + t + '">×' + t + '</button>'""",
    """'<button type="button" class="sym-card ar-card" data-t="' + t + '" aria-label="' + (dv ? 'divided by ' : 'times ') + t + '">' + OP + t + '</button>'""")
rep("""s.innerHTML = v ? '<span>×' + v + '</span>' : '<small>drop here</small>'; });""",
    """s.innerHTML = v ? '<span>' + OP + v + '</span>' : '<small>drop here</small>'; });""")
rep("""      if (t && u && t !== u) msg('×' + t + ' on the numerator but ×' + u + ' on the denominator. Different numbers change the amount. Use the same tag on both arrows.');""",
"""      if (dv) {
        if (t && u && t !== u) msg('÷' + t + ' on the numerator but ÷' + u + ' on the denominator. Different numbers change the amount. Use the same tag on both arrows.');
        else if (t === by && u === by) msg('÷' + by + ' on the numerator and ÷' + by + ' on the denominator. Every ' + by + ' parts group into 1 bigger part. Same amount, simpler name.', true);
        else if ((t && a % t) || (u && b % u)) { var z = t && a % t ? [t, a] : [u, b]; msg(z[1] + ' can\\'t be split into groups of ' + z[0] + ' with none left over. Try another tag.'); }
        else if (c && u && b / u !== +c) msg(b + ' ÷ ' + u + ' = ' + (b / u) + ', not ' + c + '. Try another tag.');
        else if (t && u) msg('÷' + t + ' on both arrows makes an equal fraction, but not the one this job asks for. Try another tag.');
        else if (t || u) msg('Now put the same tag on the other arrow.');
        else msg('Both arrows are empty.');
        return;
      }
      if (t && u && t !== u) msg('×' + t + ' on the numerator but ×' + u + ' on the denominator. Different numbers change the amount. Use the same tag on both arrows.');""")
# 6: trade (3.10.03 wow)
TRADE = r"""
  /* trade (3.10.03 wow): one measure of small shaded tiles (data-d, data-k of them; the rest of the measure is a rest).
     Drag a bigger tile from the tray onto the measure (or tap it): if every shaded tile groups evenly into that size, the whole
     row trades at once and the old row is kept above as a step of the staircase. ▶ Play: every row, one measure each, every tile
     a note as long as it is wide. data-sizes "8,4,2,1" (tray). Flags: t<size> (reached that size), whole (one tile fills the
     measure), simple (no bigger tray tile fits any more), play (played after the last trade) */
  MODS.trade = function (box) {
    var d = +box.dataset.d, k = +box.dataset.k, P = box.dataset.pre || '', name = box.dataset.name || 'trade', SZ = (box.dataset.sizes || '8,4,2,1').split(',').map(Number);
    var S = mstate(name, { rows: [d], played: 0 }), BW = 680, VW = 700, LX = 10, RH = 46, Y0 = 8, GAP = 22, busy = false;
    // narrow screens: a narrower drawing so the small tiles stay big enough to read
    function layout() { var nar = (box.clientWidth || 700) < 560; VW = nar ? 420 : 700; BW = VW - 20; }
    function cur() { return S.rows[S.rows.length - 1]; }
    function cnt(sz) { return k * sz / d; }
    function nm(sz, n) { return sz === 1 ? (n === 1 ? '1 whole' : n + ' wholes') : n + ' ' + (n === 1 ? DNAME[sz] : DPL(sz)); }
    function fits(sz) { var c = cur(); return sz < c && Number.isInteger(cnt(sz)) && Number.isInteger((d - k) * sz / d); }
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg role="group" aria-label="One measure of tiles to trade for bigger tiles"></svg></div><div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn tr-play">▶ Play every row</button><button type="button" class="sb-btn ghost tr-clear">↺ Start over</button></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function rowY(i) { return Y0 + RH + GAP + 14 + i * (RH + GAP); }
    function draw() {
      layout(); var nR = S.rows.length, MY = rowY(nR - 1), TY = MY + RH + 58, H = TY + RH + 34;
      svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + H); svg.innerHTML = '';
      wholeBar(svg, LX, Y0, BW, RH, '1 whole measure');
      S.rows.forEach(function (sz, i) {
        var y = rowY(i), w = BW / sz, n = cnt(sz), last = i === nR - 1, rest = (d - k) * sz / d;
        NS('text', { x: LX, y: y - 6, 'font-size': 13, 'font-weight': 900, fill: last ? '#0E1C42' : '#8A93A8', text: (last ? 'THE MEASURE NOW · ' : '') + nm(sz, n) + (k < d ? ' played' : ''), 'pointer-events': 'none' }, svg);
        var g = NS('g', { opacity: last ? 1 : 0.55, class: last ? 'tr-row' : '' }, svg);
        for (var j = 0; j < n; j++) { if (sz === 1) { NS('rect', { x: LX + 1, y: y, width: BW - 2, height: RH, rx: 6, fill: '#0E1C42' }, g); NS('text', { x: LX + BW / 2, y: y + RH / 2 + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 900, fill: '#fff', text: '1 whole note', 'pointer-events': 'none' }, g); } else ftile(g, LX + j * w, y, w, RH, sz, true, 'tile'); }
        for (var q = 0; q < rest; q++) { var x = LX + (n + q) * w; NS('rect', { x: x + 1, y: y, width: w - 2, height: RH, rx: 6, fill: '#F6F7FB', stroke: '#AEB6CC', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g); NS('text', { x: x + w / 2, y: y + RH / 2 + 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#8A93A8', text: 'rest', 'pointer-events': 'none' }, g); }
      });
      NS('text', { x: LX, y: TY - 10, 'font-size': 13, 'font-weight': 900, fill: '#5B6478', text: 'TRAY · drag a bigger tile onto the measure', 'pointer-events': 'none' }, svg);
      var tx = LX, tw = Math.min(150, (BW - 12 * (SZ.length - 1)) / SZ.length);
      SZ.forEach(function (sz) {
        var w = Math.min(BW / sz, tw), g = ftile(svg, tx, TY, w, RH, sz, false, 'tile tr-tray'); g.dataset.t = sz;
        g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Trade for ' + (sz === 1 ? 'the 1 whole tile' : DNAME[sz] + ' tiles'));
        if (sz === 1) { var lab = $$('text', g); lab.forEach(function (t) { t.remove(); }); $$('line', g).forEach(function (t) { t.remove(); }); NS('text', { x: tx + w / 2, y: TY + RH / 2 + 6, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 900, fill: '#0E1C42', text: '1 whole', 'pointer-events': 'none' }, g); }
        var ghost = null, y0 = MY;
        drag(g, svg, function (pt) { if (!ghost) { ghost = ftile(svg, 0, 0, w, RH, sz, true); ghost.setAttribute('opacity', .8); ghost.style.pointerEvents = 'none'; } ghost.setAttribute('transform', 'translate(' + (pt.x - w / 2) + ',' + (pt.y - RH / 2) + ')'); },
          function (pt) { if (ghost) ghost.remove(); ghost = null; if (pt && pt.y > y0 - 40 && pt.y < y0 + RH + 40) trade(sz); else if (pt) msg('Drop the tile on the measure.'); }, function () { trade(sz); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trade(sz); } });
        tx += w + 12;
      });
      report();
    }
    function trade(sz) {
      if (busy) return; var c = cur(), n = cnt(c);
      if (sz >= c) { msg('That tile is not bigger than the ' + DPL(c) + ' in the measure.'); pluck(HZ.D4); return; }
      if (!fits(sz)) { var g = c / sz; msg('The ' + n + ' ' + DPL(c) + ' can\'t all go into groups of ' + g + '. ' + (n % g ? (n % g) + ' would be left over' : 'The rest wouldn\'t fit') + ', so ' + (sz === 1 ? 'the 1 whole tile' : DNAME[sz] + ' tiles') + ' won\'t fit.'); S.tried = sz; save(); pluck(HZ.D4); return; }
      S.rows.push(sz); S.played = 0; save(); bowTone(HZ.G4, 0.5, 0, 0.14); draw();
    }
    // the hymn line in long notes, the quick line in short notes (a made-up tune; every row ends on the same beat)
    var TUNE = [392.0, 440.0, 493.88, 523.25, 587.33, 523.25, 493.88, 440.0];
    $('.tr-play', box).addEventListener('click', function () {
      if (busy) return; busy = true; musicDuck(); var M = 2.4;
      S.rows.forEach(function (sz, m) {
        var n = cnt(sz); bowTone(130.81, M * 0.97, m * M, 0.12);
        for (var i = 0; i < n; i++) bowTone(TUNE[(i * 16 / sz) % 8 | 0], M / sz, m * M + i * M / sz, 0.17);
        setTimeout(function () { var y = rowY(m); playhead(svg, LX, BW, y - 4, y + RH + 4, M); }, m * M * 1000);
      });
      setTimeout(function () { busy = false; S.played = 1; save(); report(); }, S.rows.length * M * 1000 + 150);
    });
    $('.tr-clear', box).addEventListener('click', function () { S.rows = [d]; S.played = 0; S.tried = 0; save(); draw(); });
    onWidth(box, draw);
    function report() {
      var c = cur(), n = cnt(c), stuck = !SZ.some(fits);
      SZ.forEach(function (sz) { if (S.rows.indexOf(sz) > -1) flag(box, P + 't' + sz); });
      if (S.rows.length > 1) flag(box, P + 'traded'); if (c === 1) flag(box, P + 'whole'); if (stuck) flag(box, P + 'simple'); if (stuck && S.played) flag(box, P + 'play');
      if (c === 1 && k === d) msg('One tile fills the whole measure: ' + d + ' ' + DNAME[d] + 's = 1 whole. Fewer notes, longer notes.' + (S.played ? '' : ' Press ▶ Play every row.'), true);
      else if (stuck) msg('Now the measure has ' + nm(c, n) + '. No bigger tile fits: ' + n + ' ' + (n === 1 ? DNAME[c] : DPL(c)) + ' can\'t all go into equal groups. That is the simplest form.' + (S.played ? '' : ' Press ▶ Play every row.'), true);
      else if (S.rows.length > 1) msg('Traded! Now the measure has ' + nm(c, n) + '. Same length as before, fewer tiles.', true);
      else msg('The measure has ' + n + ' ' + DNAME[d] + 's' + (k < d ? ' played and a rest' : '') + '.');
    }
    document.addEventListener('sb:step', report); draw();
  };
"""
rep("  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];", TRADE + "\n  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];")
i = s.index('var DNAME = {'); j = s.index('\n', i) + 1; s = s[:j] + "  function DPL(d) { return d === 2 ? 'halves' : DNAME[d] + 's'; }\n" + s[j:]
rep("text: (DNAME[d] + 's').toUpperCase() + (r ? ' · tap a tile to shade up to it' : ' · already shaded')", "text: DPL(d).toUpperCase() + (r ? ' · tap a tile to shade up to it' : ' · already shaded')")
rep("g.setAttribute('aria-label', DNAME[d] + 's row, tile ' + (i + 1)", "g.setAttribute('aria-label', DPL(d) + ' row, tile ' + (i + 1)")
assert s != orig
open(p, 'w', encoding='utf-8').write(s); print('patched', p)
