# 3.11.06 layer change: new `weigh` model (kilograms and grams): a dial scale, a weight mat and a two-pan balance.
#
#   data-kind  dial | mat | balance
#   data-max, data-tick   dial range and small-mark size in grams (dial only); a long mark every 500 g, numbers at 0, 1 kg, 2 kg …
#   data-items "name:grams[:label]"  things to weigh (jar, bag, box). On a dial or a mat they wait beside the platform; on a
#              balance the first one starts on the left pan (hidden weight) unless data-compare is set, then both wait
#              and go one on each pan.
#   data-weights "1000,500,200,100,50,20,10"  the weight tray (each kind can be used again and again); tap or drag a weight
#              onto the platform / mat / right pan; tap a weight that is on it to take it back off.
#   data-t     target total (dial/mat) → flag `w`; flags: `on` (the item is on the dial), `a` (compare: first bag on),
#              `tip` (compare: both bags on), `level` (balance pans level).
#   The next thing to use carries class wg-next. Readouts say what happened ("The pans are level", "The right pan is too
#   light"), never a weight in grams.
# Read aloud: "1 kg 900 g" → "1 kilogram 900 grams".
# Run on the files after patch1105:
#   python tools/storybook/patch1106.py tools/storybook/sb.src.js assets/storybook/sb.js assets/storybook/sb.css
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── weigh (3.11.06 kilograms and grams): dial scale, weight mat, balance. See tools/storybook/patch1106.py. ── */
  MODS.weigh = function (box) {
    var name = box.dataset.name || 'weigh', K = box.dataset.kind || 'dial', T = +box.dataset.t || 0, CMP = !!box.dataset.compare;
    var MX = +box.dataset.max || 2000, TK = +box.dataset.tick || 100;
    var IT = (box.dataset.items || '').split(',').filter(Boolean).map(function (p) { var q = p.split(':'); return { n: q[0], g: +q[1], l: q[2] || q[0] }; });
    var WT = (box.dataset.weights || '').split(',').filter(Boolean).map(Number);
    var S = mstate(name, { on: K === 'balance' && !CMP && IT.length ? [0] : [], w: [] });
    function f(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function wl(g) { return g >= 1000 ? (g / 1000) + ' kg' : g + ' g'; }
    var narrow = false;
    box.innerHTML = '<div class="sb-stage sb-wg"><svg viewBox="0 0 700 460" role="group" aria-label="' + (K === 'dial' ? 'A scale with a dial' : K === 'mat' ? 'A weight mat' : 'A balance with two pans') + '"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function itemsOn() { return S.on.map(function (i) { return IT[i]; }); }
    function sumW() { return S.w.reduce(function (a, b) { return a + b; }, 0); }
    function load() { return itemsOn().reduce(function (a, it) { return a + it.g; }, 0) + (K === 'balance' ? 0 : sumW()); }
    function leftG() { return CMP ? (S.on.indexOf(0) > -1 ? IT[0].g : 0) : (IT[0] ? IT[0].g : 0); }
    function rightG() { return CMP ? (S.on.indexOf(1) > -1 ? IT[1].g : 0) : sumW(); }
    function addW(g) {
      if (K === 'dial' && load() + g > MX) { msg('That is too heavy for this scale.'); return; }
      S.w.push(g); save(); pluck(g >= 500 ? HZ.C4 : g >= 100 ? HZ.E4 : HZ.G4); after();
    }
    function remW(i) { S.w.splice(i, 1); save(); pluck(HZ.D4); after(); }
    function putItem(i) {
      if (S.on.indexOf(i) > -1) return;
      if (CMP && i === 1 && S.on.indexOf(0) < 0) { msg('Put ' + IT[0].l + ' on the left pan first.'); return; }
      S.on.push(i); save(); pluck(HZ.C4); after();
    }
    function after() { draw(); say(); }
    function say() {
      if (K === 'balance') {
        if (CMP) { msg(S.on.length < 2 ? (S.on.length ? IT[0].l + ' is on the left pan.' : 'Put each bag on a pan.') : 'The pan with ' + (IT[0].g > IT[1].g ? IT[0].l : IT[1].l) + ' went down.', S.on.length === 2); return; }
        var L = leftG(), R = rightG();
        msg(!R ? 'The box is on the left pan. Add weights to the right pan.' : R === L ? '✓ The pans are level.' : R < L ? 'The right pan is still too light. Add more.' : 'Too heavy! Tap a weight on the right pan to take it off.', R === L);
        return;
      }
      if (K === 'dial') { var n = S.w.length; msg(itemsOn().length ? 'The ' + itemsOn()[0].l + (/s$/.test(itemsOn()[0].l) ? ' are' : ' is') + ' on the scale. Read the dial.' : n ? 'Weights on the scale: ' + S.w.slice().sort(function (a, b) { return b - a; }).map(wl).join(', ') + '.' : 'Nothing is on the scale yet.', T ? load() === T : itemsOn().length > 0); return; }
      var cnt = {}; S.w.forEach(function (g) { cnt[g] = (cnt[g] || 0) + 1; });
      msg(S.w.length ? 'On the mat: ' + Object.keys(cnt).map(Number).sort(function (a, b) { return b - a; }).map(function (g) { return cnt[g] + ' × ' + wl(g); }).join(', ') + '.' : 'The mat is empty.', T && load() === T);
    }
    // a weight: gold kilogram, brass grams; size by mass
    function weight(g, x, y, s, parent) {
      var k = g >= 1000, h = (k ? 54 : g >= 500 ? 46 : g >= 200 ? 40 : g >= 100 ? 34 : g >= 50 ? 30 : 26) * s, w = (k ? 56 : g >= 500 ? 48 : g >= 200 ? 42 : g >= 100 ? 36 : g >= 50 ? 32 : 28) * s;
      var gg = NS('g', {}, parent);
      NS('rect', { x: x - w / 2, y: y - h, width: w, height: h, rx: 6 * s, fill: k ? '#E2B33C' : '#C9A36A', stroke: k ? '#8A6A00' : '#7A5A2A', 'stroke-width': 2 }, gg);
      NS('rect', { x: x - w * 0.18, y: y - h - 8 * s, width: w * 0.36, height: 9 * s, rx: 3, fill: k ? '#C99A2A' : '#A9844E', stroke: k ? '#8A6A00' : '#7A5A2A', 'stroke-width': 1.5 }, gg);
      NS('text', { x: x, y: y - h / 2 + 5 * s, 'text-anchor': 'middle', 'font-size': (k ? 15 : 12) * s, 'font-weight': 900, fill: '#3A2A12', text: wl(g), 'pointer-events': 'none' }, gg);
      return { g: gg, w: w, h: h };
    }
    function item(it, x, y, s, parent, hide) {
      var gg = NS('g', {}, parent), w = 92 * s, h = 70 * s;
      if (it.n === 'jar') {
        NS('path', { d: 'M' + (x - w / 2 + 8) + ' ' + (y - h) + ' L' + (x + w / 2 - 8) + ' ' + (y - h) + ' L' + (x + w / 2) + ' ' + (y - 10) + ' Q' + (x + w / 2) + ' ' + y + ' ' + (x + w / 2 - 10) + ' ' + y + ' L' + (x - w / 2 + 10) + ' ' + y + ' Q' + (x - w / 2) + ' ' + y + ' ' + (x - w / 2) + ' ' + (y - 10) + ' Z', fill: '#DCEBF8', stroke: '#5B6478', 'stroke-width': 2.5 }, gg);
        NS('rect', { x: x - w / 2 + 3, y: y - h * 0.72, width: w - 6, height: h * 0.72 - 3, rx: 6, fill: '#9CC8EE' }, gg);
      } else if (it.n === 'box') {
        NS('rect', { x: x - w / 2, y: y - h, width: w, height: h, rx: 4, fill: '#C49A6C', stroke: '#7A5A2A', 'stroke-width': 2.5 }, gg);
        NS('line', { x1: x - w / 2, y1: y - h * 0.7, x2: x + w / 2, y2: y - h * 0.7, stroke: '#7A5A2A', 'stroke-width': 2 }, gg);
      } else {
        NS('path', { d: 'M' + (x - w / 2 + 6) + ' ' + y + ' Q' + (x - w / 2 - 4) + ' ' + (y - h * 0.6) + ' ' + (x - w * 0.28) + ' ' + (y - h) + ' L' + (x + w * 0.28) + ' ' + (y - h) + ' Q' + (x + w / 2 + 4) + ' ' + (y - h * 0.6) + ' ' + (x + w / 2 - 6) + ' ' + y + ' Z', fill: '#E8D9B5', stroke: '#8A6A3A', 'stroke-width': 2.5 }, gg);
      }
      NS('text', { x: x, y: y - h * 0.3, 'text-anchor': 'middle', 'font-size': 15 * s, 'font-weight': 900, fill: '#3A2A12', text: hide ? it.l + ' ?' : it.l, 'pointer-events': 'none' }, gg);
      return gg;
    }
    function dropOn(node, target, cb) {
      var p0 = null;
      drag(node, svg, function (pt) { if (!p0) p0 = pt; node.setAttribute('transform', 'translate(' + (pt.x - p0.x) + ',' + (pt.y - p0.y) + ')'); },
        function (pt) { if (pt && pt.x > target[0] && pt.x < target[2] && pt.y > target[1] && pt.y < target[3]) cb(); else draw(); },
        function () { cb(); });
      node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cb(); } });
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var s = narrow ? 1.45 : 1, FS = narrow ? 22 : 14, next = null, target, H;
      if (K === 'dial') {
        var py = narrow ? 128 : 92, r = narrow ? 150 : 118, cx = 350, cy = py + 40 + r, A0 = -150, A1 = 150, tot = load();
        function ang(g) { return (A0 + (A1 - A0) * Math.min(1, g / MX)) * Math.PI / 180; }
        var pw = 2 * r + 40;
        NS('rect', { x: cx - 16, y: py + 10, width: 32, height: 24, fill: '#AEB6CC' }, svg);
        NS('rect', { x: cx - r - 26, y: cy - r - 16, width: 2 * r + 52, height: 2 * r + 46, rx: 22, fill: '#E9EEF5', stroke: '#5B6478', 'stroke-width': 3 }, svg);
        NS('rect', { x: cx - pw / 2, y: py, width: pw, height: 14, rx: 5, fill: '#8C96A8', stroke: '#5B6478', 'stroke-width': 2 }, svg);
        NS('circle', { cx: cx, cy: cy, r: r, fill: '#fff', stroke: '#1F2A44', 'stroke-width': 3 }, svg);
        for (var m = 0; m <= MX; m += TK) {
          var a = ang(m), big = m % 1000 === 0, mid = m % 500 === 0, l = big ? 24 : mid ? 17 : 10;
          NS('line', { x1: cx + Math.sin(a) * r, y1: cy - Math.cos(a) * r, x2: cx + Math.sin(a) * (r - l), y2: cy - Math.cos(a) * (r - l), stroke: '#1F2A44', 'stroke-width': big ? 3 : mid ? 2.2 : 1.3, 'pointer-events': 'none' }, svg);
          if (big) NS('text', { x: cx + Math.sin(a) * (r - 44 * s / 1.2), y: cy - Math.cos(a) * (r - 44 * s / 1.2) + FS * 0.36, 'text-anchor': 'middle', 'font-size': FS + 2, 'font-weight': 900, fill: '#0E1C42', text: m ? (m / 1000) + ' kg' : '0', 'pointer-events': 'none' }, svg);
        }
        var pa = ang(tot);
        NS('line', { class: 'wg-ptr', x1: cx, y1: cy, x2: cx + Math.sin(pa) * (r - 14), y2: cy - Math.cos(pa) * (r - 14), stroke: '#C0392B', 'stroke-width': 4, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        NS('circle', { cx: cx, cy: cy, r: 8, fill: '#C0392B' }, svg);
        target = [cx - pw / 2 - 20, 0, cx + pw / 2 + 20, cy + r + 30];
        // what is on the platform
        var xx = cx - (itemsOn().length ? 0 : 0);
        itemsOn().forEach(function (it) { item(it, cx, py, s * 0.9, svg); });
        if (!itemsOn().length && S.w.length) {
          var sp = 0; S.w.forEach(function (g) { sp += weight(g, 0, 0, s * 0.8, NS('g', {}, null)).w + 6; });
          var x0 = cx - sp / 2;
          S.w.forEach(function (g, i) { var tmp = weight(g, 0, 0, s * 0.8, NS('g', {}, null)); var wg = weight(g, x0 + tmp.w / 2, py, s * 0.8, svg); x0 += tmp.w + 6;
            wg.g.setAttribute('class', 'wg-on'); wg.g.setAttribute('role', 'button'); wg.g.setAttribute('tabindex', 0); wg.g.setAttribute('aria-label', wl(g) + ' weight on the scale. Tap to take it off.'); wg.g.style.cursor = 'pointer';
            drag(wg.g, svg, null, function () { }, function () { remW(i); }); });
        }
        H = cy + r + 34;
      } else if (K === 'mat') {
        var my = 40, mh = narrow ? 230 : 170;
        NS('rect', { x: 20, y: my, width: 660, height: mh, rx: 14, fill: '#EFE6D2', stroke: '#B8A27A', 'stroke-width': 3 }, svg);
        NS('text', { x: 36, y: my + 26, 'font-size': FS, 'font-weight': 900, fill: '#7A6440', text: 'WEIGHT MAT', 'pointer-events': 'none' }, svg);
        var sorted = S.w.map(function (g, i) { return [g, i]; }).sort(function (a, b) { return b[0] - a[0]; }), x1 = 60, row = 0, ys = my + mh - 16;
        sorted.forEach(function (p) {
          var tmp = weight(p[0], 0, 0, s * 0.85, NS('g', {}, null)); if (x1 + tmp.w > 670) { x1 = 60; row++; }
          var wg = weight(p[0], x1 + tmp.w / 2, ys - row * (tmp.h + 20) * 1.0, s * 0.85, svg); x1 += tmp.w + 8;
          wg.g.setAttribute('class', 'wg-on'); wg.g.setAttribute('role', 'button'); wg.g.setAttribute('tabindex', 0); wg.g.setAttribute('aria-label', wl(p[0]) + ' weight on the mat. Tap to take it off.'); wg.g.style.cursor = 'pointer';
          drag(wg.g, svg, null, function () { }, function () { remW(p[1]); });
        });
        target = [0, 0, 700, my + mh + 20]; H = my + mh + 20;
      } else {
        var px = 350, pyv = narrow ? 70 : 60, arm = narrow ? 230 : 210, L = leftG(), R = rightG(), d = R - L;
        var tilt = (CMP ? S.on.length < 2 : !R && !L) ? 0 : d === 0 ? 0 : (d > 0 ? 1 : -1) * Math.min(9, 3 + Math.abs(d) / 60);
        var tr = tilt * Math.PI / 180, ly = pyv - Math.sin(tr) * arm, ry = pyv + Math.sin(tr) * arm, lx = px - Math.cos(tr) * arm, rx = px + Math.cos(tr) * arm;
        NS('rect', { x: px - 12, y: pyv, width: 24, height: narrow ? 300 : 230, fill: '#8C96A8', stroke: '#5B6478', 'stroke-width': 2 }, svg);
        NS('rect', { x: px - 90, y: pyv + (narrow ? 296 : 226), width: 180, height: 16, rx: 6, fill: '#5B6478' }, svg);
        NS('line', { x1: lx, y1: ly, x2: rx, y2: ry, stroke: '#3A2A12', 'stroke-width': 8, 'stroke-linecap': 'round' }, svg);
        NS('circle', { cx: px, cy: pyv, r: 10, fill: '#C9A227', stroke: '#6B4A12', 'stroke-width': 2 }, svg);
        NS('path', { d: 'M' + (px - 8) + ' ' + (pyv - 30) + ' L' + (px + 8) + ' ' + (pyv - 30) + ' L' + px + ' ' + (pyv - 10) + ' Z', fill: d === 0 && (R || L) ? '#1E7A4C' : '#B23A2E' }, svg);
        var drop = narrow ? 120 : 100, pw2 = narrow ? 210 : 180;
        [[lx, ly, 'L'], [rx, ry, 'R']].forEach(function (p) {
          NS('line', { x1: p[0], y1: p[1], x2: p[0] - pw2 / 2 + 10, y2: p[1] + drop, stroke: '#5B6478', 'stroke-width': 2 }, svg);
          NS('line', { x1: p[0], y1: p[1], x2: p[0] + pw2 / 2 - 10, y2: p[1] + drop, stroke: '#5B6478', 'stroke-width': 2 }, svg);
          NS('path', { d: 'M' + (p[0] - pw2 / 2) + ' ' + (p[1] + drop) + ' Q' + p[0] + ' ' + (p[1] + drop + 26) + ' ' + (p[0] + pw2 / 2) + ' ' + (p[1] + drop) + ' Z', fill: '#D7DEEA', stroke: '#5B6478', 'stroke-width': 3 }, svg);
          NS('text', { x: p[0], y: p[1] + drop + 50 * s, 'text-anchor': 'middle', 'font-size': FS - 1, 'font-weight': 800, fill: '#5B6478', text: p[2] === 'L' ? 'LEFT PAN' : 'RIGHT PAN', 'pointer-events': 'none' }, svg);
        });
        if (CMP) { S.on.forEach(function (i) { var px2 = i === 0 ? lx : rx, py2 = (i === 0 ? ly : ry) + drop; item(IT[i], px2, py2, s * 0.85, svg); }); target = S.on.indexOf(0) < 0 ? [lx - pw2 / 2 - 30, 0, lx + pw2 / 2 + 30, ly + drop + 60] : [rx - pw2 / 2 - 30, 0, rx + pw2 / 2 + 30, ry + drop + 60]; }
        else {
          if (IT[0]) item(IT[0], lx, ly + drop, s * 0.85, svg, true);
          var tw = 0, ws = S.w.map(function (g) { var t0 = weight(g, 0, 0, s * 0.72, NS('g', {}, null)); tw += t0.w + 4; return t0; }), xx2 = rx - Math.min(tw, pw2 + 40) / 2, row2 = 0, start = xx2;
          S.w.forEach(function (g, i) { if (xx2 + ws[i].w > rx + pw2 / 2 + 20) { xx2 = start; row2++; } var wg = weight(g, xx2 + ws[i].w / 2, ry + drop - row2 * 46 * s, s * 0.72, svg); xx2 += ws[i].w + 4;
            wg.g.setAttribute('class', 'wg-on'); wg.g.setAttribute('role', 'button'); wg.g.setAttribute('tabindex', 0); wg.g.setAttribute('aria-label', wl(g) + ' weight on the right pan. Tap to take it off.'); wg.g.style.cursor = 'pointer';
            drag(wg.g, svg, null, function () { }, function () { remW(i); }); });
          target = [rx - pw2 / 2 - 40, 0, rx + pw2 / 2 + 40, ry + drop + 70];
        }
        H = pyv + (narrow ? 330 : 256);
      }
      // the tray: things to weigh and weights, under the tool
      var ty = H + 16, th = narrow ? 130 : 96;
      NS('rect', { x: 20, y: ty, width: 660, height: th, rx: 12, fill: '#F7F2E6', stroke: '#D9C79F', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
      NS('text', { x: 34, y: ty + 20 * s, 'font-size': FS - 2, 'font-weight': 900, fill: '#8A6A3A', text: 'TRAY · DRAG OR TAP', 'pointer-events': 'none' }, svg);
      var tx = 50, base = ty + th - 14;
      IT.forEach(function (it, i) {
        if (S.on.indexOf(i) > -1 || (K === 'balance' && !CMP)) return;
        var g = item(it, tx + 46 * s, base, s * 0.85, svg); tx += 110 * s;
        var need = !CMP || (i === 0 ? S.on.indexOf(0) < 0 : S.on.indexOf(0) > -1);
        g.setAttribute('class', 'wg-item' + (need && !next ? ' wg-next' : '')); g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.setAttribute('aria-label', it.l + '. Drag it onto the ' + (K === 'balance' ? (i === 0 ? 'left' : 'right') + ' pan' : 'scale') + '.'); g.style.cursor = 'grab';
        if (need && !next) next = g;
        dropOn(g, target, function () { putItem(i); });
      });
      WT.forEach(function (gv) {
        var tmp = weight(gv, 0, 0, s * 0.85, NS('g', {}, null)); if (tx + tmp.w > 680) return;
        var wg = weight(gv, tx + tmp.w / 2, base, s * 0.85, svg); tx += tmp.w + 14 * s;
        wg.g.setAttribute('class', 'wg-w'); wg.g.setAttribute('data-g', gv); wg.g.setAttribute('role', 'button'); wg.g.setAttribute('tabindex', 0); wg.g.setAttribute('aria-label', 'Add a ' + wl(gv) + ' weight'); wg.g.style.cursor = 'grab';
        dropOn(wg.g, target, function () { addW(gv); });
      });
      svg.setAttribute('viewBox', '0 0 700 ' + (ty + th + 8));
      // flags
      if (K === 'dial' && IT.length && itemsOn().length) flag(box, 'on');
      if ((K === 'dial' || K === 'mat') && T && load() === T) flag(box, 'w');
      if (K === 'balance' && CMP) { if (S.on.indexOf(0) > -1) flag(box, 'a'); if (S.on.length === 2) flag(box, 'tip'); }
      if (K === 'balance' && !CMP && sumW() && sumW() === leftG()) flag(box, 'level');
      if (!out.innerHTML) say();
    }
    onWidth(box, draw); draw();
  };

'''
RA_OLD = ".replace(/\\b(\\d[\\d,]*|blank) mL\\b/g,"
RA_NEW = ".replace(/\\b(\\d[\\d,]*) kg weight/g, '$1 kilogram weight').replace(/\\b(\\d[\\d,]*) g weight/g, '$1 gram weight')" + ".replace(/\\b(\\d[\\d,]*|blank) kg\\b/g, function (x, n) { return n + ' kilogram' + (n === '1' ? '' : 's'); }).replace(/\\b(\\d[\\d,]*|blank) g\\b/g, function (x, n) { return n + ' gram' + (n === '1' ? '' : 's'); }).replace(/(kilograms?|grams?) = /g, '$1 equals ')" + RA_OLD
CSS = """
/* 3.11.06 scale + balance */
.sb-wg svg .wg-w:focus-visible,.sb-wg svg .wg-item:focus-visible,.sb-wg svg .wg-on:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
"""
for p in sys.argv[1:]:
    if p.endswith('.css'):
        c = open(p).read()
        if '.sb-wg svg' in c: print(p, 'already patched'); continue
        open(p, 'w').write(c.rstrip('\n') + '\n' + CSS); print(p, 'patched'); continue
    s = open(p).read()
    if 'MODS.weigh' in s: print(p, 'already patched'); continue
    assert 'MODS.beaker' in s, p + ': run patch1105 first'
    assert s.count(MARK) == 1, p
    s = s.replace(MARK, MOD + MARK)
    assert s.count(RA_OLD) == 1, p + ': read-aloud line not as expected'
    s = s.replace(RA_OLD, RA_NEW)
    open(p, 'w').write(s); print(p, 'patched')
