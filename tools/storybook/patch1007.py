# 3.10.07 layer change: new `gap` model ("how much more": line up two bars of the same tiles, then drag gap
# tiles onto the shorter bar until the ends match; the gap tiles are the difference) and new `storyb` model
# (Story Builder: pick a clue word, a thing and a unit, set two amounts on tiles, get a story starter, solve, Play).
# Run on the files after patch1006:
#   python tools/storybook/patch1007.py tools/storybook/sb.src.js assets/storybook/sb.js
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── gap (3.10.07 "how much more"): two bars of the same tiles lined up under 1 whole.
     data-d, data-a (top bar, the bigger amount), data-b (bottom bar), data-rows "Bass part,Flute part", data-label
     (the navy whole's label). Drag (or tap) gap tiles from the tray onto the bottom bar until it ends where the top
     bar ends; tap the last gap tile to take it back. Flag: fill (bottom + gap tiles = top) ── */
  MODS.gap = function (box) {
    var d = +box.dataset.d, A = +box.dataset.a, B = +box.dataset.b, name = box.dataset.name || 'gap', lab = box.dataset.label || '1 whole';
    var rows = (box.dataset.rows || 'Top bar,Bottom bar').split(','), S = mstate(name, { g: 0 });
    var BW = 680, LX = 10, RH = 50, Y0 = 8, YA = 0, YB = 0, TY = 0, narrow = false;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 300" role="group" aria-label="Two bars in ' + DPL(d) + ' lined up"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function nm(k) { return k + ' ' + (k === 1 ? DNAME[d] : DPL(d)); }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; RH = narrow ? 76 : 50;
      var LH = narrow ? 34 : 24; YA = Y0 + RH + LH + 8; YB = YA + RH + LH + 8; TY = YB + RH + LH + 22;
      var full = B + S.g >= A, H = full ? YB + RH + 14 : TY + RH + 12;
      svg.setAttribute('viewBox', '0 0 700 ' + H); svg.innerHTML = '';
      wholeBar(svg, LX, Y0, BW, RH, lab);
      var w = BW / d, noLab = narrow && d > 10;
      [[YA, A, 0, rows[0]], [YB, B, S.g, rows[1]]].forEach(function (r, k) {
        var y = r[0];
        NS('text', { x: LX, y: y - 8, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: r[3].toUpperCase(), 'pointer-events': 'none' }, svg);
        NS('rect', { x: LX, y: y, width: BW, height: RH, rx: 6, fill: '#F6F7FB', stroke: '#AEB6CC', 'stroke-width': 2, 'stroke-dasharray': '6 5', 'pointer-events': 'none' }, svg);
        for (var i = 0; i < r[1]; i++) { var t = ftile(svg, LX + i * w, y, w, RH, d, true, 'tile'); t.style.pointerEvents = 'none'; if (noLab && t.querySelector('g')) t.querySelector('g').remove(); }
        for (var j = 0; j < r[2]; j++) (function (j) {
          var x = LX + (B + j) * w, g = NS('g', { class: 'tile gp-new', tabindex: 0, role: 'button', 'aria-label': 'Gap tile ' + (j + 1) + (j === S.g - 1 ? ', tap to take it back' : '') }, svg);
          NS('rect', { x: x + 1, y: y, width: w - 2, height: RH, rx: 6, fill: '#FFF3C4', stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }, g);
          NS('text', { x: x + w / 2, y: y + RH / 2 + 7, 'text-anchor': 'middle', 'font-size': narrow ? 26 : 18, 'font-weight': 900, fill: '#8A6A00', text: String(j + 1), 'pointer-events': 'none' }, g);
          function rm() { if (j === S.g - 1) { S.g--; save(); pluck(HZ.D4); draw(); } }
          g.addEventListener('click', rm); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rm(); } });
        })(j);
      });
      var ex = LX + A * w;
      NS('line', { x1: ex, y1: YA - 4, x2: ex, y2: YB + RH + 6, stroke: '#C9A227', 'stroke-width': 3, 'stroke-dasharray': '6 5', 'pointer-events': 'none' }, svg);
      if (!full) {
        NS('text', { x: LX, y: TY - 12, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: 'TRAY · drag or tap a gap tile', 'pointer-events': 'none' }, svg);
        var tw = Math.max(w, narrow ? 90 : 60), tr = NS('g', { class: 'tile gp-tray', tabindex: 0, role: 'button', 'aria-label': 'Add a gap tile to the ' + rows[1].toLowerCase() }, svg);
        NS('rect', { x: LX + 1, y: TY, width: tw - 2, height: RH, rx: 6, fill: '#FFF3C4', stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }, tr);
        NS('text', { x: LX + tw / 2, y: TY + RH / 2 + 7, 'text-anchor': 'middle', 'font-size': narrow ? 24 : 16, 'font-weight': 900, fill: '#8A6A00', text: '1/' + d, 'pointer-events': 'none' }, tr);
        var ghost = null;
        drag(tr, svg, function (pt) { if (!ghost) { ghost = NS('rect', { width: w - 2, height: RH, rx: 6, fill: '#FFF3C4', stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 3', opacity: .85, 'pointer-events': 'none' }, svg); } ghost.setAttribute('x', pt.x - w / 2); ghost.setAttribute('y', pt.y - RH / 2); },
          function (pt) { if (ghost) ghost.remove(); ghost = null; if (pt && pt.y > YB - 40 && pt.y < YB + RH + 40) add(); }, add);
        tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(); } });
      }
      report();
    }
    function add() {
      if (B + S.g >= A) { msg('That would go past the end of the ' + rows[0].toLowerCase() + '. The gap stops where the ' + rows[0].toLowerCase() + ' ends.'); return; }
      S.g++; save(); pluck(HZ.G4 * (1 + 0.04 * S.g)); draw();
    }
    function report() {
      var ok = B + S.g === A; flag(box, 'fill', ok); if (ok) flag(box, 'fill');
      if (ok) { msg('The two bars end at the same place. The gap is <b>' + nm(S.g) + '</b>.', true); return; }
      msg(S.g ? 'Gap tiles: <b>' + S.g + '</b>. Keep going until the ' + rows[1].toLowerCase() + ' ends at the gold line.' : 'The ' + rows[1].toLowerCase() + ' is shorter. Fill the gap up to the gold line.');
    }
    document.addEventListener('sb:step', report); onWidth(box, draw); draw();
  };

  /* ── storyb (3.10.07 Story Builder): the student writes a take-away story of their own.
     Chips: clue (left · how much more), thing (candle · ribbon · bread · water: a take-away and a how-much-more starter each), unit (data-units "7,11").
     Then tap a tile in the top bar (first amount, at least 2) and in the bottom bar (second amount, less than the first).
     The page shows a story starter, sets the answer boxes in the step marked .stb-solve (data-a = first − second),
     and ▶ Play my story plays the first amount, then what is taken, then what is left.
     Flags: clue · thing · unit · a · b · play ── */
  MODS.storyb = function (box) {
    var name = box.dataset.name || 'storyb', UN = (box.dataset.units || '7,11').split(',').map(Number);
    var S = mstate(name, { clue: '', thing: '', d: 0, a: 0, b: 0, played: 0 }), busy = false;
    var CLUES = [['left', 'How much is left?'], ['more', 'How much more?']];
    var THINGS = {
      candle: ['🕯️ candle', 'candle', 'A candle is {A} of a foot tall. It burns {B} of a foot. <b>How much of the candle is left?</b>', 'One candle is {A} of a foot tall. Another candle is {B} of a foot tall. <b>How much taller is the first candle?</b>'],
      ribbon: ['🎀 ribbon', 'ribbon', 'Lena has {A} of a meter of ribbon. She cuts off {B} of a meter. <b>How much ribbon is left?</b>', 'Lena\'s ribbon is {A} of a meter long. Hans\'s ribbon is {B} of a meter long. <b>How much longer is Lena\'s ribbon?</b>'],
      bread: ['🍞 bread', 'loaf of bread', 'There is {A} of a loaf of bread. The singers eat {B} of the loaf. <b>How much bread is left?</b>', 'Lena has {A} of a loaf. Hans has {B} of a loaf. <b>How much more bread does Lena have?</b>'],
      water: ['💧 water', 'jug of water', 'A jug is {A} full of water. The players drink {B} of the jug. <b>How much water is left?</b>', 'One jug is {A} full. Another jug is {B} full. <b>How much more water is in the first jug?</b>'] };
    var job = box.closest('.sb-job');
    box.innerHTML = '<div class="stb-pick"><div class="sb-row stb-clue"><b>Clue word:</b> ' + CLUES.map(function (c) { return '<button type="button" class="sb-btn ghost" data-v="' + c[0] + '" aria-label="Clue word: ' + c[1] + '">' + c[1] + '</button>'; }).join('') + '</div>' +
      '<div class="sb-row stb-thing"><b>Story thing:</b> ' + Object.keys(THINGS).map(function (k) { return '<button type="button" class="sb-btn ghost" data-v="' + k + '" aria-label="Story thing: ' + THINGS[k][1] + '">' + THINGS[k][0] + '</button>'; }).join('') + '</div>' +
      '<div class="sb-row stb-unit"><b>Unit:</b> ' + UN.map(function (u) { return '<button type="button" class="sb-btn ghost" data-v="' + u + '" aria-label="Unit: ' + DPL(u) + '">' + DPL(u) + '</button>'; }).join('') + '</div></div>' +
      '<div class="sb-stage sb-tiles" style="margin-top:8px"><svg viewBox="0 0 700 200" role="group" aria-label="Two bars for your story"></svg></div>' +
      '<div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn stb-play">▶ Play my story</button></div><div class="stb-frame" aria-live="polite"></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), frame = $('.stb-frame', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function frs(k, d) { return '<span class="fr"><span>' + k + '</span><span>' + d + '</span></span>'; }
    function chips() {
      [['.stb-clue', S.clue], ['.stb-thing', S.thing], ['.stb-unit', String(S.d || '')]].forEach(function (c) {
        $$(c[0] + ' button', box).forEach(function (b) { var on = b.dataset.v === c[1]; b.classList.toggle('ghost', !on); b.setAttribute('aria-pressed', on); });
      });
    }
    $$('.stb-pick button', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var row = b.parentNode.className;
        if (/clue/.test(row)) S.clue = b.dataset.v; else if (/thing/.test(row)) S.thing = b.dataset.v;
        else { var nd = +b.dataset.v; if (nd !== S.d) { S.d = nd; S.a = 0; S.b = 0; S.played = 0; } }
        save(); pluck(HZ.C5); draw();
      });
    });
    var BW = 680, LX = 10, RH = 50, YA = 0, YB = 0, narrow = false;
    function draw() {
      chips(); narrow = (box.clientWidth || 800) < 560; RH = narrow ? 76 : 50;
      var LH = narrow ? 34 : 24; YA = LH + 6; YB = YA + RH + LH + 14;
      svg.setAttribute('viewBox', '0 0 700 ' + (YB + RH + 12)); svg.innerHTML = '';
      var d = S.d;
      if (!d) { NS('text', { x: 350, y: YA + RH / 2 + 6, 'text-anchor': 'middle', 'font-size': narrow ? 26 : 17, 'font-weight': 800, fill: '#5B6478', text: 'Pick a unit to get your two bars.' }, svg); }
      else {
        var w = BW / d;
        [['a', YA, 'FIRST AMOUNT (top bar)', 'Top bar tile '], ['b', YB, 'SECOND AMOUNT (bottom bar)', 'Bottom bar tile ']].forEach(function (r) {
          var k = r[0], y = r[1];
          NS('text', { x: LX, y: y - 8, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: r[2] + (S[k] ? ' · ' + S[k] + ' ' + (S[k] === 1 ? DNAME[d] : DPL(d)) : ''), 'pointer-events': 'none' }, svg);
          for (var i = 0; i < d; i++) (function (i) {
            var on = i < S[k], t = ftile(svg, LX + i * w, y, w, RH, d, on, 'tile');
            if (narrow && d > 10 && t.querySelector('g')) t.querySelector('g').remove();
            t.setAttribute('tabindex', 0); t.setAttribute('role', 'button'); t.setAttribute('aria-label', r[3] + (i + 1));
            function set() { setAmt(k, i + 1); }
            t.addEventListener('click', set); t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } });
          })(i);
        });
      }
      report();
    }
    function setAmt(k, n) {
      var d = S.d;
      if (k === 'a') { if (n === d) { msg('Leave room: pick less than 1 whole, so there is something to take away from.'); return; } if (n < 2) { msg('Pick at least 2 ' + DPL(d) + ', so you can take some away and still have some left.'); return; } S.a = n; if (S.b >= S.a) S.b = 0; }
      else { if (!S.a) { msg('Set the top bar first.'); return; } if (n >= S.a) { msg('The bottom bar must be <b>shorter</b> than the top bar. Pick fewer than ' + S.a + ' ' + DPL(d) + '.'); return; } S.b = n; }
      S.played = 0; save(); pluck(HZ.G4 * (1 + 0.05 * n)); draw();
    }
    function story() {
      var T = THINGS[S.thing], d = S.d; if (!T || !d || !S.a || !S.b || !S.clue) return '';
      return T[S.clue === 'left' ? 2 : 3].replace('{A}', frs(S.a, d)).replace('{B}', frs(S.b, d));
    }
    function setAns() {
      var sv = job && $('.stb-solve', job); if (!sv) return;
      var ins = $$('.sb-ans', sv), ok = S.a && S.b && S.d;
      if (ins[0]) { ins[0].dataset.a = ok ? String(S.a - S.b) : '?'; ins[0].dataset.hint = ok ? 'Take the second amount away from the first: ' + S.a + ' − ' + S.b + '.' : 'Build both bars first.'; }
      if (ins[1]) { ins[1].dataset.a = ok ? String(S.d) : '?'; ins[1].dataset.hint = ok ? 'The unit stays ' + DPL(S.d) + ', so the denominator stays ' + S.d + '.' : 'Build both bars first.'; }
    }
    $('.stb-play', box).addEventListener('click', function () {
      if (busy) return; if (!(S.a && S.b && S.d)) { msg('Build both bars first.'); return; }
      busy = true; musicDuck(); var dt = 0.22, N = ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B4', 'C5'], t = 0;
      for (var i = 0; i < S.a; i++) pluck(HZ[N[i % N.length]], t + i * dt); t += S.a * dt + 0.35;
      for (var j = 0; j < S.b; j++) pluck(HZ.D4, t + j * dt); t += S.b * dt + 0.35;
      for (var q = 0; q < S.a - S.b; q++) pluck(HZ[N[q % N.length]] * 2, t + q * dt); t += (S.a - S.b) * dt;
      setTimeout(function () { busy = false; S.played = 1; save(); report(); }, t * 1000 + 150);
    });
    function report() {
      flag(box, 'clue', !!S.clue); if (S.clue) flag(box, 'clue');
      flag(box, 'thing', !!S.thing); if (S.thing) flag(box, 'thing');
      flag(box, 'unit', !!S.d); if (S.d) flag(box, 'unit');
      flag(box, 'a', !!S.a); if (S.a) flag(box, 'a');
      flag(box, 'b', !!S.b); if (S.b) flag(box, 'b');
      if (S.played && S.a && S.b) flag(box, 'play');
      setAns();
      var st = story(); frame.innerHTML = st ? '<div class="sb-card" style="margin:8px 0 0;background:#FFFBEF"><span class="sb-k">Your story starter</span><p style="margin:4px 0 0">' + st + '</p></div>' : '';
      if (!S.clue) msg('Pick a clue word.'); else if (!S.thing) msg('Pick a thing for your story.'); else if (!S.d) msg('Pick a unit.');
      else if (!S.a) msg('Tap a tile in the top bar to set the first amount.'); else if (!S.b) msg('Tap a tile in the bottom bar to set the second amount.');
      else msg(S.played ? (S.clue === 'left' ? 'You heard the first amount, then the part taken away (low notes), then what is left.' : 'You heard the first amount, then the second amount (low notes), then the gap.') : 'Your story is ready. Write it in your own words.', true);
    }
    document.addEventListener('sb:step', report); onWidth(box, draw); draw();
  };

'''
# addsub: an add part that comes after a take-away part clears the ✕ tiles first (8 − 6, then + 7 needs the room).
# The taken count is kept in S.cx, so the take-away part stays done.
GOT0 = "var c = 0; for (var k in S.x) if (S.x[k] === i) c++; return c; }"
GOT1 = "var c = 0; for (var k in S.x) if (S.x[k] === i) c++; return c + ((S.cx || {})[i] || 0); }"
ADD0 = "if (S.n.length >= d) { msg('The bar is full. It can only hold 1 whole.'); return; }"
ADD1 = ("if (!got(c) && Object.keys(S.x).length) { var keep = []; S.cx = S.cx || {}; S.n.forEach(function (p, i) { if (S.x[i] != null) S.cx[S.x[i]] = (S.cx[S.x[i]] || 0) + 1; else keep.push(p); }); S.n = keep; S.x = {}; }\n      " + ADD0)
# addsub: with data-start, the first part's new tiles are lighter too (start tiles stay dark).
LT0 = "if (p > 0) { g.querySelector('rect').setAttribute('fill-opacity', '0.5');"
LT1 = "if (p > 0 || (st0 && p === 0)) { g.querySelector('rect').setAttribute('fill-opacity', '0.5');"
for p in sys.argv[1:]:
    s = open(p).read()
    if 'MODS.storyb' in s: print(p, 'already patched'); continue
    assert 'MODS.mfill' in s, p + ': run patch1006 first'
    assert s.count(MARK) == 1, p
    assert s.count(GOT0) == 1 and s.count(ADD0) == 1 and s.count(LT0) == 1, p + ': addsub not as expected'
    s = s.replace(GOT0, GOT1).replace(ADD0, ADD1).replace(LT0, LT1)
    s = s.replace(MARK, MOD + MARK)
    open(p, 'w').write(s); print(p, 'patched')
