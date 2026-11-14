# 3.10.05 layer change: new `bench` model (cups as tile bars with a halfway line and missing pieces) and new
# `halfsort` model (drag fraction cards left or right of one-half, then Play). Run on the files after patch1004:
#   python tools/storybook/patch1005.py tools/storybook/sb.src.js assets/storybook/sb.js
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── bench: cups as tile bars (data-fr "2/9,5/7,9/10", data-rows "Cup A,Cup B,Cup C"); buttons show the halfway
     line (½) and the missing pieces. data-btns "half,gap". Flags: half · gap ── */
  MODS.bench = function (box) {
    var FR = box.dataset.fr.split(',').map(function (s) { var p = s.split('/'); return [+p[0], +p[1]]; }), rows = (box.dataset.rows || '').split(','), name = box.dataset.name || 'bench';
    var btns = (box.dataset.btns || 'half,gap').split(','), S = mstate(name, { half: 0, gap: 0 });
    var BW = 680, LX = 10, RH = 46, GAPY = 40, narrow = false, NAVY = '#0E1C42', RED = '#B23A2E';
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 200" role="group" aria-label="' + FR.length + ' cups of coffee as fraction tiles"></svg></div>' +
      '<div class="sb-row" style="margin-top:6px">' + (btns.indexOf('half') > -1 ? '<button type="button" class="sb-btn bn-half">½ Show the halfway line</button>' : '') +
      (btns.indexOf('gap') > -1 ? '<button type="button" class="sb-btn bn-gap">Show the missing pieces</button>' : '') + '</div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function nm(k, d) { return k + ' ' + (k === 1 ? DNAME[d] : DPL(d)); }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; RH = narrow ? 76 : 46; GAPY = narrow ? 70 : 44;
      var Y0 = 8, H = Y0 + FR.length * (RH + GAPY) + 30; svg.setAttribute('viewBox', '0 0 700 ' + H); svg.innerHTML = '';
      FR.forEach(function (f, r) {
        var k = f[0], d = f[1], y = Y0 + r * (RH + GAPY) + GAPY - 8, w = BW / d;
        NS('text', { x: LX, y: y - 10, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: (rows[r] || '').toUpperCase(), 'pointer-events': 'none' }, svg);
        var g = NS('g', { 'aria-label': (rows[r] || 'Cup') + ': ' + nm(k, d) + ' full' }, svg);
        for (var i = 0; i < d; i++) { var t = ftile(g, LX + i * w, y, w, RH, d, i < k, 'tile'); if (narrow && d > 10 && t.querySelector('g')) t.querySelector('g').remove(); }
        if (S.gap && k < d) {
          NS('rect', { x: LX + k * w - 1, y: y - 5, width: (d - k) * w + 2, height: RH + 10, rx: 8, fill: 'none', stroke: RED, 'stroke-width': 3, 'stroke-dasharray': '7 5', 'pointer-events': 'none' }, svg);
          NS('text', { x: LX + BW, y: y - 10, 'text-anchor': 'end', 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: RED, text: 'missing ' + nm(d - k, d), 'pointer-events': 'none' }, svg);
        }
      });
      if (S.half) { var hx = LX + BW / 2; NS('line', { x1: hx, y1: 4, x2: hx, y2: H - 22, stroke: '#C9A227', 'stroke-width': 1.5, 'pointer-events': 'none' }, svg);
        FR.forEach(function (f, r) { var y = Y0 + r * (RH + GAPY) + GAPY - 8; NS('line', { x1: hx, y1: y - GAPY + 14, x2: hx, y2: y - 2, stroke: '#C9A227', 'stroke-width': 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); NS('line', { x1: hx, y1: y + RH + 2, x2: hx, y2: y + RH + 14, stroke: '#C9A227', 'stroke-width': 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); });
        NS('text', { x: hx, y: H - 4, 'text-anchor': 'middle', 'font-size': narrow ? 24 : 16, 'font-weight': 900, fill: '#8A6A00', text: 'one-half', 'pointer-events': 'none' }, svg); }
      var hb = $('.bn-half', box), gb = $('.bn-gap', box); if (hb) hb.disabled = !!S.half; if (gb) gb.disabled = !!S.gap;
      report();
    }
    function report() {
      if (S.half) flag(box, 'half'); if (S.gap) flag(box, 'gap');
      msg(S.half && S.gap ? 'The gold line is halfway. The red boxes show what each cup is missing.' : S.half ? 'The gold line is the halfway point of every cup.' : S.gap ? 'The red boxes show what each cup is missing.' : 'Each cup is one whole.', S.half || S.gap);
    }
    var hb = $('.bn-half', box), gb = $('.bn-gap', box);
    if (hb) hb.addEventListener('click', function () { S.half = 1; save(); pluck(HZ.G4); draw(); });
    if (gb) gb.addEventListener('click', function () { S.gap = 1; save(); pluck(HZ.E4); draw(); });
    document.addEventListener('sb:step', report); onWidth(box, draw); draw();
  };

  /* ── halfsort: drag fraction cards (data-cards "1/6,5/9,…") to the left of one-half (less) or the right (more);
     a wrong drop says why and the card goes back. Then Play: every cup, least to greatest, as a held note.
     Flags: sorted · play ── */
  MODS.halfsort = function (box) {
    var C = box.dataset.cards.split(','), name = box.dataset.name || 'halfsort', S = mstate(name, { z: {}, played: 0 }), busy = false, sel = null;
    function val(c) { var p = c.split('/'); return p[0] / p[1]; }
    function words(c) { var p = c.split('/'); return p[0] + ' ' + (+p[0] === 1 ? DNAME[+p[1]] : DPL(+p[1])); }
    function half(d) { return d % 2 ? (d - 1) / 2 + ' and a half' : String(d / 2); }
    function mini(c) { var p = c.split('/'), k = +p[0], d = +p[1], w = 96 / d, s = '<svg viewBox="0 0 100 18" width="100" height="18" aria-hidden="true" style="display:block;margin:4px auto 0">'; for (var i = 0; i < d; i++) s += '<rect x="' + (2 + i * w) + '" y="2" width="' + (w - 1) + '" height="14" rx="2" fill="' + (i < k ? DCOL[d] : '#fff') + '" stroke="' + DCOL[d] + '" stroke-width="1.2"/>'; return s + '<line x1="50" y1="0" x2="50" y2="18" stroke="#C9A227" stroke-width="2" stroke-dasharray="3 2"/></svg>'; }
    var zs = 'flex:1 1 45%;min-height:120px;border:3px dashed #AEB6CC;border-radius:16px;padding:10px;display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start;justify-content:center;background:#F6F7FB';
    box.innerHTML = '<div class="sb-stage" style="padding:12px"><div style="position:relative;height:46px;border-radius:8px;background:#0E1C42;color:#fff;font-weight:900;display:flex;align-items:center;justify-content:flex-start;padding-left:18px">1 whole cup<span style="position:absolute;left:50%;top:-6px;bottom:-6px;border-left:4px dashed #C9A227"></span></div>' +
      '<div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap"><div class="hs-zone" data-z="lo" style="' + zs + '" role="group" aria-label="Less than one-half"><b class="hs-zl" style="flex:1 1 100%;text-align:center;color:#5B6478">Less than one-half</b></div>' +
      '<div class="hs-zone" data-z="hi" style="' + zs + '" role="group" aria-label="More than one-half"><b class="hs-zl" style="flex:1 1 100%;text-align:center;color:#5B6478">More than one-half</b></div></div>' +
      '<div class="hs-tray" role="group" aria-label="Cups to sort" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:12px;min-height:20px"></div></div>' +
      '<div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn hs-play">▶ Play the cups</button><button type="button" class="sb-btn ghost hs-0">↺ Start over</button></div><div class="sb-readout" aria-live="polite"></div>';
    var tray = $('.hs-tray', box), out = $('.sb-readout', box), Z = { lo: $('.hs-zone[data-z="lo"]', box), hi: $('.hs-zone[data-z="hi"]', box) };
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function want(c) { return val(c) < 0.5 ? 'lo' : 'hi'; }
    function put(c, z) {
      if (want(c) !== z) { var p = c.split('/'); pluck(HZ.D4); sel = null; draw(); msg('Not that side. Half of ' + p[1] + ' is ' + half(+p[1]) + '. ' + p[0] + ' is ' + (z === 'lo' ? 'more' : 'less') + ' than that, so ' + words(c) + ' goes on the ' + (z === 'lo' ? 'right' : 'left') + '.'); return; }
      S.z[c] = z; save(); pluck(z === 'lo' ? HZ.E4 : HZ.A4); sel = null; draw(true);
    }
    function draw(said) {
      $$('.ord-card', box).forEach(function (n) { n.remove(); });
      C.forEach(function (c) {
        var b = el('button', 'ord-card hs-card', '<span style="font-size:22px">' + fracHTML(c) + '</span>' + mini(c)); b.type = 'button'; b.dataset.c = c; b.setAttribute('aria-label', words(c)); b.style.padding = '6px 8px';
        if (sel === c) b.style.outline = '4px solid #C9A227';
        (S.z[c] ? Z[S.z[c]] : tray).appendChild(b);
        if (S.z[c]) { b.disabled = true; b.style.cursor = 'default'; b.style.borderColor = '#1E7A4C'; return; }
        hdrag(b, function (t) { var z = t && t.closest && t.closest('.hs-zone'); if (z && box.contains(z)) put(c, z.dataset.z); }, function () { sel = sel === c ? null : c; draw(); });
      });
      report(said);
    }
    [Z.lo, Z.hi].forEach(function (z) { z.addEventListener('click', function (e) { if (sel && !e.target.closest('.hs-card')) put(sel, z.dataset.z); }); });
    $('.hs-0', box).addEventListener('click', function () { S.z = {}; S.played = 0; sel = null; save(); draw(); });
    $('.hs-play', box).addEventListener('click', function () {
      if (busy) return; if (Object.keys(S.z).length < C.length) { msg('Sort every cup first.'); return; }
      busy = true; musicDuck(); var order = C.slice().sort(function (a, b) { return val(a) - val(b); }), t = 0, F = [HZ.C4, HZ.D4, HZ.E4, HZ.G4, HZ.A4, HZ.C5, HZ.D5, HZ.E5];
      order.forEach(function (c, i) { var dur = 2.4 * val(c); bowTone(F[i % F.length], dur, t, 0.18); t += dur + 0.15; });
      setTimeout(function () { busy = false; S.played = 1; save(); report(); }, t * 1000 + 200);
    });
    function report(said) {
      var n = Object.keys(S.z).length, all = n === C.length;
      flag(box, 'sorted', all); if (all) flag(box, 'sorted');
      if (all && S.played) { flag(box, 'play'); msg('Least to greatest: every note was a little longer than the one before.', true); return; }
      if (all) { msg('Every cup is sorted.', true); return; }
      if (said) { msg('Yes! ' + n + ' of ' + C.length + ' cups sorted.', true); return; }
      if (!n && !sel) msg(''); else if (sel) msg('You picked ' + words(sel) + '. Which side does it go on?');
    }
    document.addEventListener('sb:step', function () { report(); }); draw();
  };

'''
for p in sys.argv[1:]:
    s = open(p).read()
    if 'MODS.halfsort' in s: print(p, 'already patched'); continue
    assert 'MODS.recut' in s, p + ': run patch1004 first'
    assert s.count(MARK) == 1, p
    s = s.replace(MARK, MOD + MARK)
    open(p, 'w').write(s); print(p, 'patched')
