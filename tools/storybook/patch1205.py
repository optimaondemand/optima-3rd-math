# patch1205: 3.12.05 Properties of Triangles. Run after patch1204 on sb.src.js, assets/storybook/sb.js and assets/storybook/sb.css.
#   python3 patch1205.py tools/storybook/sb.src.js assets/storybook/sb.js assets/storybook/sb.css
# Adds MODS.tns: name triangles by their sides and by their angles. Cuisenaire rods (Math Tools colors), the 11 x 11
# geoboard (Math Tools look), the set square, tick marks and name cards. No decoration. data-do:
#   rsort  : Think. Three rod triangles (data-rods "5-7-9,7-7-7,9-9-4") go into three groups: all 3 the same,
#            2 the same, none the same. Drag (or tap a triangle, then a group). Flag sorted when all 3 are in.
#   corner : fixed shapes (data-tris JSON, geoboard pins, or pixels with data-free). Drag the set square onto each
#            corner (or tap a corner): it says smaller / square / bigger. Flag checked when every corner is checked.
#            Shapes with "ask" get name boxes ("s" sides, "a" angles); cards in data-cards. Flag named when all boxes
#            are right. "pre": {"s": "isosceles"} shows a box already filled (Mia). data-ticks shows tick marks.
#   name   : Your Turn. Make a band triangle (tap 3 pins, then the first again). It must have data-side equal sides
#            (2 = exactly two). Tick marks pop on (flag made). Then its side name (flag named).
#   make   : On your own. Band triangle with data-side (0 = no equal sides) and data-ang (obtuse | right | acute)
#            (flag made); set square on the corner that decides the angle name (flag checked); both names (flag named).
#   match  : the Wow. data-tris (pixels, data-free) drawn in Byrne's colors with tick marks. Set square on corners,
#            six cards, each used once (flag named).
import sys
HOOK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod]; if (f) try { f(b); } catch (e) { console.error('model', b.dataset.mod, e); } });"
MOD = r'''  /* ── tns (3.12.05 properties of triangles): rods, geoboard, set square, tick marks, name cards. data-do rsort | corner | name | make | match. See patch1205.py ── */
  MODS.tns = function (box) {
    var name = box.dataset.name || 'tns', DO = box.dataset.do || 'corner', FREE = !!box.dataset.free, TICKS = !!box.dataset.ticks || DO === 'name' || DO === 'make' || DO === 'match';
    var NAVY = '#0E1C42', OKG = '#1E7A4C', RED = '#B23A2E', GOLD = '#C9A227', GRAY = '#5B6478', PIN = '#6B7280', LINE = '#D9DEEA', SQF = '#D9F0E3', ORG = '#C26A0A';
    var BAND = ['#6B46C1', '#23915A', '#D2453B', '#2F6FDE', '#F08A24'], BYRNE = ['#C8102E', '#E8B10E', '#1F4E9C'];
    var ROD = [null, ['#F7F5EE', NAVY], ['#E03C31', '#fff'], ['#7BC043', '#fff'], ['#8E44AD', '#fff'], ['#F4D03F', NAVY], ['#1E7B34', '#fff'], ['#2C2C2C', '#fff'], ['#8B5A2B', '#fff'], ['#2E86DE', '#fff'], ['#F08A24', '#fff']];
    var RNAME = [null, 'white', 'red', 'light green', 'purple', 'yellow', 'dark green', 'black', 'brown', 'blue', 'orange'];
    var SN = ['equilateral', 'isosceles', 'scalene'], AN = ['acute', 'right', 'obtuse'];
    var TRIS = box.dataset.tris ? JSON.parse(box.dataset.tris) : [], ORIG = JSON.parse(JSON.stringify(TRIS)), FH = 470;
    function layoutFree() { if (!FREE) return; if (F > 1) { FH = ORIG.length * 390 + 110; ORIG.forEach(function (o, t) { var xs = o.p.map(function (q) { return q[0]; }), ys = o.p.map(function (q) { return q[1]; }), cx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, by = Math.max.apply(null, ys); TRIS[t].p = o.p.map(function (q) { return [350 + (q[0] - cx) * 2, 70 + t * 390 + 300 - (by - q[1]) * 2]; }); }); } else { FH = 470; ORIG.forEach(function (o, t) { TRIS[t].p = o.p.map(function (q) { return q.slice(); }); }); } }
    var CARDS = (box.dataset.cards || '').split(',').filter(Boolean);
    var S = mstate(name, DO === 'rsort' ? { g: {} } : { p: [], k: 0, ck: {}, nm: {} });
    if (!S.ck) S.ck = {}; if (!S.nm) S.nm = {}; if (!S.p) S.p = [];
    box.innerHTML = '<div class="sb-stage sb-an sb-tns"><div class="an-btns"></div>' + (DO === 'rsort' ? '<div class="tn-rtray" role="group" aria-label="Rod triangles to sort"></div><div class="tn-groups" role="group" aria-label="Groups"></div>' : '<svg viewBox="0 0 700 460" role="group"></svg><div class="tn-names"></div><div class="bm-chips tn-cards" role="group" aria-label="Name cards to drag"></div>') + '</div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.an-btns', box), namesB = $('.tn-names', box), cardsB = $('.tn-cards', box), F = 1, SEL = null;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OKG + '">' + h + '</span>' : h; }
    function bad(t) { pluck(HZ.D4); msg(t); }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    function tapK(g, fn) { g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); }
    function P(v, deg, r) { var a = deg * Math.PI / 180; return { x: v.x + r * Math.cos(a), y: v.y - r * Math.sin(a) }; }
    function pill(x, y, t, col) { var w = (String(t).length * 9.5 + 18) * F, h = 30 * F; x = Math.max(w / 2 + 6, Math.min(694 - w / 2, x)); var g = NS('g', { 'pointer-events': 'none' }, svg); NS('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill: '#fff', stroke: col || NAVY, 'stroke-width': 2 }, g); NS('text', { x: x, y: y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, 'font-weight': 900, fill: col || NAVY, text: t }, g); return g; }
    function pts(a) { return a.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '); }

    /* ── shape math (pins are whole numbers, so lengths compare exactly; pixels get a small tolerance) ── */
    function d2(a, b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }
    function eqv(a, b) { return FREE ? Math.abs(Math.sqrt(a) - Math.sqrt(b)) < 1.5 : a === b; }
    function sides(p) { return p.map(function (q, i) { return d2(q, p[(i + 1) % p.length]); }); }
    function eqCount(p) { var s = sides(p), e = (eqv(s[0], s[1]) ? 1 : 0) + (eqv(s[1], s[2]) ? 1 : 0) + (eqv(s[0], s[2]) ? 1 : 0); return e === 3 ? 3 : e === 1 ? 2 : 0; }
    function sideName(p) { var c = eqCount(p); return c === 3 ? 'equilateral' : c === 2 ? 'isosceles' : 'scalene'; }
    function kindAt(p, i) { var n = p.length, q = p[i], a = p[(i + n - 1) % n], c = p[(i + 1) % n], dot = (a[0] - q[0]) * (c[0] - q[0]) + (a[1] - q[1]) * (c[1] - q[1]);
      if (FREE) { var cs = dot / Math.sqrt(d2(a, q) * d2(c, q)); return Math.abs(cs) < 0.02 ? 'square' : cs > 0 ? 'smaller' : 'bigger'; }
      return dot === 0 ? 'square' : dot > 0 ? 'smaller' : 'bigger'; }
    function angName(p) { var k = p.map(function (_, i) { return kindAt(p, i); }); return k.indexOf('square') > -1 ? 'right' : k.indexOf('bigger') > -1 ? 'obtuse' : 'acute'; }
    function cross(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }
    function same(a, b) { return a[0] === b[0] && a[1] === b[1]; }

    /* ── geoboard (Math Tools look) or a plain mat for pixel shapes ── */
    var N = 11, GB = 440, MG = 30;
    function sp() { return (GB - 2 * MG) / (N - 1); }
    function GP(q) { return FREE ? { x: q[0], y: q[1] } : { x: 130 + MG + q[0] * sp(), y: 10 + MG + q[1] * sp() }; }
    function board() {
      if (FREE) { svg.setAttribute('viewBox', '0 0 700 ' + FH); NS('rect', { x: 4, y: 4, width: 692, height: FH - 8, rx: 18, fill: '#FBF6EA', stroke: '#E6DCC4', 'stroke-width': 2, 'pointer-events': 'none' }, svg); return; }
      svg.setAttribute('viewBox', '0 0 700 460');
      NS('rect', { x: 132, y: 12, width: GB - 4, height: GB - 4, rx: 22, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
    }
    function pins(onTap, hi) {
      if (FREE) return;
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) (function (x, y) {
        var c = GP([x, y]), g = NS('g', onTap ? { class: 'tr-pin', 'data-p': x + ',' + y, role: 'button', tabindex: -1, 'aria-label': 'Pin ' + (x + 1) + ', ' + (y + 1) } : { 'pointer-events': 'none' }, svg);
        if (onTap) NS('circle', { cx: c.x, cy: c.y, r: sp() * 0.48, fill: 'transparent' }, g);
        if (hi && hi[0] === x && hi[1] === y) NS('circle', { cx: c.x, cy: c.y, r: 11, fill: 'none', stroke: BAND[0], 'stroke-width': 3 }, g);
        NS('circle', { cx: c.x, cy: c.y, r: 5, fill: PIN, stroke: '#fff', 'stroke-width': 1.5 }, g);
        if (onTap) tapK(g, function () { onTap([x, y]); });
      })(x, y);
    }
    function shape(p, closed, col, byrne) {
      var ps = p.map(GP);
      if (byrne) { NS('polygon', { points: pts(ps), fill: col, 'fill-opacity': .1, stroke: 'none', 'pointer-events': 'none' }, svg); ps.forEach(function (a, i) { var b = ps[(i + 1) % ps.length]; NS('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: BYRNE[i % 3], 'stroke-width': 6, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); }); return; }
      NS(closed ? 'polygon' : 'polyline', { points: pts(ps), fill: closed ? col : 'none', 'fill-opacity': .14, stroke: col, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
    }
    // tick marks: equal sides get the same number of marks; sides with no match get 1, 2 and 3 so no two look alike
    function ticks(p) {
      var s = sides(p), marks = [0, 0, 0], c = eqCount(p);
      if (c === 3) marks = [1, 1, 1];
      else if (c === 2) { var m = eqv(s[0], s[1]) ? [0, 1, 2] : eqv(s[1], s[2]) ? [1, 2, 0] : [0, 2, 1]; marks[m[0]] = 1; marks[m[1]] = 1; marks[m[2]] = 2; }
      else { var o = [0, 1, 2].sort(function (a, b) { return s[a] - s[b]; }); marks[o[0]] = 1; marks[o[1]] = 2; marks[o[2]] = 3; }
      p.forEach(function (q, i) {
        var A = GP(q), B = GP(p[(i + 1) % 3]), dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, m = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
        for (var t = 0; t < marks[i]; t++) { var off = (t - (marks[i] - 1) / 2) * 9; NS('line', { x1: m.x + ux * off - nx * 10, y1: m.y + uy * off - ny * 10, x2: m.x + ux * off + nx * 10, y2: m.y + uy * off + ny * 10, stroke: NAVY, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); }
      });
    }

    /* ── the set square on a corner ── */
    var KW = { square: 'a square corner', smaller: 'smaller than a square corner', bigger: 'bigger than a square corner' };
    var KC = { square: OKG, smaller: ORG, bigger: RED };
    function cornerMark(p, i, k) {
      var n = p.length, Q = GP(p[i]), A = GP(p[(i + n - 1) % n]), C = GP(p[(i + 1) % n]);
      var la = Math.hypot(A.x - Q.x, A.y - Q.y), lc = Math.hypot(C.x - Q.x, C.y - Q.y), u = { x: (A.x - Q.x) / la, y: (A.y - Q.y) / la }, v = { x: (C.x - Q.x) / lc, y: (C.y - Q.y) / lc };
      if (k === 'square') { var s = 14; NS('polyline', { points: pts([{ x: Q.x + u.x * s, y: Q.y + u.y * s }, { x: Q.x + (u.x + v.x) * s, y: Q.y + (u.y + v.y) * s }, { x: Q.x + v.x * s, y: Q.y + v.y * s }]), fill: 'none', stroke: OKG, 'stroke-width': 3, 'pointer-events': 'none' }, svg); return; }
      var r = 20, a1 = Math.atan2(u.y, u.x), a2 = Math.atan2(v.y, v.x), da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      NS('path', { d: 'M' + (Q.x + r * Math.cos(a1)).toFixed(1) + ' ' + (Q.y + r * Math.sin(a1)).toFixed(1) + ' A' + r + ' ' + r + ' 0 0 ' + (da > 0 ? 1 : 0) + ' ' + (Q.x + r * Math.cos(a2)).toFixed(1) + ' ' + (Q.y + r * Math.sin(a2)).toFixed(1), fill: 'none', stroke: KC[k], 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
    }
    // the set square laid on a corner: its square corner on the vertex, one edge along a side
    function squareOn(p, i) {
      var n = p.length, Q = GP(p[i]), A = GP(p[(i + n - 1) % n]), C = GP(p[(i + 1) % n]), la = Math.hypot(A.x - Q.x, A.y - Q.y), u = { x: (A.x - Q.x) / la, y: (A.y - Q.y) / la };
      var w1 = { x: -u.y, y: u.x }, w2 = { x: u.y, y: -u.x }, cx = C.x - Q.x, cy = C.y - Q.y, w = (w1.x * cx + w1.y * cy) >= (w2.x * cx + w2.y * cy) ? w1 : w2, L = 92;
      NS('polygon', { points: pts([Q, { x: Q.x + u.x * L, y: Q.y + u.y * L }, { x: Q.x + w.x * L, y: Q.y + w.y * L }]), fill: SQF, 'fill-opacity': .72, stroke: NAVY, 'stroke-width': 2, 'pointer-events': 'none' }, svg);
    }
    function allChecked(t) { var p = TRIS[t].p; for (var i = 0; i < p.length; i++) if (!S.ck[t + ':' + i]) return false; return true; }
    function corners(list, onCheck) {
      // tap areas on every corner + one draggable set square
      list.forEach(function (o) {
        o.p.forEach(function (q, i) {
          var key = o.t + ':' + i, c = GP(q), g = NS('g', { class: 'tn-cn' + (S.ck[key] ? ' done' : ''), 'data-k': key, role: 'button', tabindex: 0, 'aria-label': 'A corner' + (S.ck[key] ? ': ' + KW[S.ck[key]] : ', not checked yet') }, svg);
          NS('circle', { cx: c.x, cy: c.y, r: 24 * F, fill: 'transparent' }, g);
          if (!S.ck[key]) NS('circle', { cx: c.x, cy: c.y, r: 9, fill: 'rgba(201,162,39,.25)', stroke: GOLD, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, g);
          tapK(g, function () { onCheck(o.t, i); });
        });
      });
      var home = FREE ? { x: 606, y: FH - 34 } : { x: 610, y: 430 }, g = NS('g', { class: 'drag tn-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag its square corner onto a corner of a triangle.' }, svg);
      NS('polygon', { points: pts([home, P(home, 0, 72), P(home, 90, 72)]), fill: SQF, 'fill-opacity': .9, stroke: '#8792A8', 'stroke-width': 2 }, g);
      NS('circle', { cx: home.x, cy: home.y, r: 30, fill: 'transparent' }, g);
      NS('text', { x: home.x + 36, y: home.y + 20, 'text-anchor': 'middle', 'font-size': 13 * F, 'font-weight': 800, fill: GRAY, text: 'set square', 'pointer-events': 'none' }, g);
      drag(g, svg, function (pt) { g.setAttribute('transform', 'translate(' + (pt.x - home.x) + ',' + (pt.y - home.y) + ')'); }, function (pt) {
        var best = null, bd = 1e9; list.forEach(function (o) { o.p.forEach(function (q, i) { var c = GP(q), dd = pt ? Math.hypot(pt.x - c.x, pt.y - c.y) : 1e9; if (dd < bd) { bd = dd; best = [o.t, i]; } }); });
        if (best && bd < 40 * F) onCheck(best[0], best[1]); else { bad('Drop the set square so its square corner lands right on a corner of the triangle.'); draw(); }
      }, function () {});
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); var nx = null; list.some(function (o) { return o.p.some(function (q, i) { if (!S.ck[o.t + ':' + i]) { nx = [o.t, i]; return true; } }); }); if (nx) onCheck(nx[0], nx[1]); } });
    }
    var LAST = null;
    function check(t, i) {
      var p = shapeOf(t), k = kindAt(p, i); S.ck[t + ':' + i] = k; LAST = [t, i]; save(); pluck(k === 'square' ? HZ.C5 : k === 'bigger' ? HZ.E4 : HZ.G4); draw();
      var lab = TRIS[t] && TRIS[t].lab ? 'Triangle ' + TRIS[t].lab + ': ' : '';
      msg(lab + 'this corner is <b style="color:' + KC[k] + '">' + KW[k] + '</b>.' + (k === 'square' ? ' The set square fits exactly.' : k === 'bigger' ? ' The sides open wider than the set square.' : ' The sides fit inside the set square.'), k === 'square');
      after();
    }
    function shapeOf(t) { return t === 'u' ? S.p : TRIS[t].p; }

    /* ── name boxes + cards ── */
    var KIND = {}; SN.forEach(function (n) { KIND[n] = 's'; }); AN.forEach(function (n) { KIND[n] = 'a'; });
    function want(t, k) { var p = shapeOf(t); return k === 's' ? sideName(p) : angName(p); }
    function rowsOf() { var r = []; if (DO === 'name' || DO === 'make') { if (S.k) r.push({ t: 'u', lab: 'Your triangle', ask: DO === 'name' ? 's' : 'sa' }); } else TRIS.forEach(function (o, t) { if (o.ask || o.pre) r.push({ t: t, lab: o.lab ? 'Triangle ' + o.lab : (o.who || 'The triangle'), ask: o.ask || '', pre: o.pre || {} }); }); return r; }
    function used(card) { for (var k in S.nm) if (S.nm[k] === card) return true; return false; }
    function namesUI() {
      if (!namesB) return; var rows = rowsOf(); namesB.innerHTML = ''; cardsB.innerHTML = '';
      if (!rows.length) { cardsB.hidden = true; return; } cardsB.hidden = false;
      rows.forEach(function (r) {
        var line = el('div', 'tn-row'); line.appendChild(el('span', 'tn-lab', esc(r.lab)));
        ['s', 'a'].forEach(function (k) {
          var pre = r.pre && r.pre[k], ask = r.ask.indexOf(k) > -1; if (!pre && !ask) return;
          var key = r.t + ':' + k, v = pre || S.nm[key], sl = el('span', 'tn-slot' + (pre ? ' pre' : v ? ' ok' : ''), v ? esc(v) : (k === 's' ? 'name for the sides' : 'name for the angles'));
          sl.dataset.key = key; sl.dataset.k = k; sl.tabIndex = v ? -1 : 0; sl.setAttribute('role', 'button'); sl.setAttribute('aria-label', (k === 's' ? 'Box for the sides name' : 'Box for the angles name') + (v ? ': ' + v : ''));
          if (!v) tapK(sl, function () { if (SEL) put(SEL, sl); else bad('First pick a name card, then tap this box. Or drag a card onto the box.'); });
          line.appendChild(sl);
        });
        namesB.appendChild(line);
      });
      CARDS.forEach(function (c) {
        var b = el('button', 'bm-chip an-card tn-card' + (used(c) ? ' used' : '') + (SEL === c ? ' sel' : ''), esc(c)); b.type = 'button'; b.dataset.c = c; if (used(c)) b.disabled = true;
        hdrag(b, function (t) { var sl = t && t.closest && t.closest('.tn-slot'); if (sl && !sl.classList.contains('ok') && !sl.classList.contains('pre')) put(c, sl); else bad('Drop the card right on an empty name box.'); }, function () { SEL = SEL === c ? null : c; namesUI(); if (SEL) msg('Now tap the box where <b>' + esc(c) + '</b> goes.'); });
        cardsB.appendChild(b);
      });
    }
    var WHYS = { equilateral: 'Equilateral means all 3 sides are the same length.', isosceles: 'Isosceles means at least 2 sides are the same length.', scalene: 'Scalene means no sides are the same length.', acute: 'Acute means all 3 angles are smaller than a square corner.', right: 'Right means one angle is a square corner.', obtuse: 'Obtuse means one angle is bigger than a square corner.' };
    function put(c, sl) {
      SEL = null; var key = sl.dataset.key, k = sl.dataset.k, t = key.split(':')[0]; t = t === 'u' ? 'u' : +t;
      if (KIND[c] !== k) { bad('<b>' + esc(c) + '</b> tells about the ' + (KIND[c] === 's' ? 'sides' : 'angles') + '. This box needs a name for the ' + (k === 's' ? 'sides' : 'angles') + '.'); namesUI(); return; }
      var p = shapeOf(t);
      if (k === 'a') { var n = p.length, all = true; for (var i = 0; i < n; i++) if (!S.ck[t + ':' + i]) all = false; if (!all) { bad('Check every corner of this triangle with the set square first. Then you will know its angle name.'); namesUI(); return; } }
      var w = want(t, k);
      if (c === w) { S.nm[key] = c; LAST = null; save(); pluck(HZ.C5); draw(); msg('✓ <b>' + esc(c) + '</b>. ' + WHYS[c], true); after(); return; }
      if (DO === 'match' && c === 'isosceles' && w === 'equilateral') { bad('True, it has at least 2 equal sides! But use each name once. There is a more exact name for a triangle whose 3 sides are all the same.'); namesUI(); return; }
      var hint = k === 's' ? 'Count the tick marks. Sides with the same marks are the same length.' : 'Look at the corners you checked with the set square.';
      bad('Not <b>' + esc(c) + '</b>. ' + WHYS[c] + ' ' + hint); namesUI();
    }
    function namedAll() { var rows = rowsOf(); if (!rows.length) return false; return rows.every(function (r) { return ['s', 'a'].every(function (k) { return r.ask.indexOf(k) < 0 || S.nm[r.t + ':' + k]; }); }); }

    /* ── band triangles (name, make) ── */
    var RULE_S = box.dataset.side != null ? +box.dataset.side : -1, RULE_A = box.dataset.ang || '';
    function ruleOK(p) { var c = eqCount(p); if (RULE_S === 2 && c !== 2) return 's'; if (RULE_S === 0 && c !== 0) return 's'; if (RULE_A && angName(p) !== RULE_A) return 'a'; return ''; }
    function keyCorner(p) { for (var i = 0; i < 3; i++) { var k = kindAt(p, i); if (RULE_A === 'obtuse' && k === 'bigger') return i; if (RULE_A === 'right' && k === 'square') return i; } return -1; }
    function hook(q) {
      if (S.k) return;
      if (S.p.length && same(S.p[0], q)) {
        if (S.p.length < 3) { bad('Hook the band on 3 pins before you close it.'); return; }
        if (cross(S.p[0], S.p[1], S.p[2]) === 0) { bad('Those 3 pins are in one straight line, so the band lies flat. Press Start over and pick 3 pins that are not in a line.'); return; }
        var why = ruleOK(S.p);
        if (why) { S.k = 1; S.bad = why; save(); pluck(HZ.D4); draw(); flag(box, 'made', false);
          if (why === 's') msg(RULE_S === 2 ? 'That is a triangle, but look at the tick marks: ' + (eqCount(S.p) === 0 ? 'all 3 sides are different lengths.' : 'they do not show exactly 2 equal sides.') + ' Try going the same number of pin spaces left and right from a top pin. Press Start over.' : 'That is a triangle, but the tick marks show ' + eqCount(S.p) + ' sides that are the same length. Make every side a different length. Press Start over.');
          else msg('That is a triangle, but none of its corners is ' + (RULE_A === 'obtuse' ? 'bigger than a square corner. Try making it long and flat, with its top pin close to one end.' : RULE_A === 'right' ? 'a square corner.' : 'right.') + ' Press Start over.');
          return; }
        S.k = 1; S.bad = ''; save(); pluck(HZ.C5); draw(); flag(box, 'made');
        msg(DO === 'name' ? '✓ A triangle with exactly 2 sides the same length. The tick marks show which ones.' : '✓ A triangle with no sides the same length (look at the tick marks) and one wide corner. Now check that wide corner with the set square.', true); after(); return;
      }
      if (S.p.some(function (r) { return same(r, q); })) { bad('That pin is already in the band.'); return; }
      if (S.p.length >= 3) { bad('You have 3 pins. Now tap the first pin to close the band.'); return; }
      S.p.push(q); save(); pluck(HZ.E4 + S.p.length * 40); draw();
      msg(S.p.length < 3 ? 'Pin ' + S.p.length + ' is hooked. Tap the next pin.' : '3 pins. Now tap the first pin (the one with the ring) to close the band.');
    }
    function startOver() { S.p = []; S.k = 0; S.bad = ''; S.ck = {}; S.nm = {}; save(); draw(); flag(box, 'made', false); msg('The band is off. Tap a pin to start.'); }

    /* ── rsort (Think): rod triangles into groups ── */
    var GRP = [['all', 'All 3 the same'], ['two', '2 the same'], ['none', 'None the same']];
    function rodTri(ls) {
      // a closed triangle of three rods: base ls[0], left ls[1], right ls[2] (in units), drawn like the Math Tools rods
      var u = 15, c = ls[0], a = ls[1], b = ls[2], x = (a * a - b * b + c * c) / (2 * c), h = Math.sqrt(Math.max(0, a * a - x * x)), W = c * u + 36, H = h * u + 40;
      var A = { x: 18, y: H - 16 }, B = { x: 18 + c * u, y: H - 16 }, T = { x: 18 + x * u, y: H - 16 - h * u };
      function r(P1, P2, n) { var dx = P2.x - P1.x, dy = P2.y - P1.y, L = Math.hypot(dx, dy), nx = -dy / L * 6, ny = dx / L * 6, ang = Math.atan2(dy, dx) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180; var m = { x: (P1.x + P2.x) / 2, y: (P1.y + P2.y) / 2 };
        return '<polygon points="' + pts([{ x: P1.x + nx, y: P1.y + ny }, { x: P2.x + nx, y: P2.y + ny }, { x: P2.x - nx, y: P2.y - ny }, { x: P1.x - nx, y: P1.y - ny }]) + '" fill="' + ROD[n][0] + '" stroke="rgba(0,0,0,.45)" stroke-width="1.2" stroke-linejoin="round"/><text x="' + m.x.toFixed(1) + '" y="' + (m.y + 4).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="800" fill="' + ROD[n][1] + '" transform="rotate(' + ang.toFixed(1) + ' ' + m.x.toFixed(1) + ' ' + m.y.toFixed(1) + ')">' + n + '</text>'; }
      return '<svg viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" aria-hidden="true">' + r(A, T, a) + r(B, T, b) + r(A, B, c) + '</svg>';
    }
    function groupOf(ls) { var u = {}; ls.forEach(function (n) { u[n] = (u[n] || 0) + 1; }); var m = Math.max.apply(null, Object.keys(u).map(function (k) { return u[k]; })); return m === 3 ? 'all' : m === 2 ? 'two' : 'none'; }
    function rodWords(ls) { return ls.map(function (n) { return RNAME[n] + ' ' + n; }).join(', '); }
    function drawSort() {
      var RS = (box.dataset.rods || '5-7-9,7-7-7,9-9-4').split(',').map(function (s) { var a = s.split('-').map(Number); return [a[2], a[0], a[1]]; });
      var trayB = $('.tn-rtray', box), grpB = $('.tn-groups', box); trayB.innerHTML = ''; grpB.innerHTML = '';
      GRP.forEach(function (g) {
        var gb = el('div', 'tn-grp', '<div class="tn-gh">' + g[1] + '</div><div class="tn-gin"></div>'); gb.dataset.g = g[0]; gb.tabIndex = 0; gb.setAttribute('role', 'button'); gb.setAttribute('aria-label', 'Group: ' + g[1]);
        RS.forEach(function (ls, i) { if (S.g[i] === g[0]) $('.tn-gin', gb).appendChild(el('div', 'tn-rt in', rodTri(ls))); });
        tapK(gb, function () { if (SEL != null) drop(SEL, g[0]); else bad('First pick a rod triangle, then tap its group. Or drag the triangle onto a group.'); });
        grpB.appendChild(gb);
      });
      RS.forEach(function (ls, i) {
        if (S.g[i]) return;
        var b = el('button', 'tn-rt' + (SEL === i ? ' sel' : ''), rodTri(ls)); b.type = 'button'; b.dataset.i = i; b.setAttribute('aria-label', 'A triangle made of the ' + rodWords(ls) + ' rods. Drag it onto a group, or tap it and then tap a group.');
        hdrag(b, function (t) { var g = t && t.closest && t.closest('.tn-grp'); if (g) drop(i, g.dataset.g); else bad('Drop the triangle right on one of the three groups.'); }, function () { SEL = SEL === i ? null : i; draw(); if (SEL != null) msg('Now tap the group where this triangle goes.'); });
        trayB.appendChild(b);
      });
      if (!trayB.children.length) trayB.appendChild(el('p', 'tn-done', '✓ All three triangles are sorted.'));
      function drop(i, g) {
        SEL = null; var ls = RS[i], w = groupOf(ls);
        if (g === w) { S.g[i] = g; save(); pluck(HZ.C5); draw(); msg('✓ The ' + rodWords(ls) + ' rods: ' + (w === 'all' ? 'all 3 rods are the same length.' : w === 'two' ? '2 rods are the same length, and 1 is different.' : 'no two rods are the same length.'), true);
          if (Object.keys(S.g).length >= RS.length) { flag(box, 'sorted'); msg('✓ All sorted: one triangle in each group. Each group gets its own name next.', true); } return; }
        bad('Look at the numbers on the rods: ' + ls.join(', ') + '. How many of them are the same?'); draw();
      }
      if (Object.keys(S.g).length >= RS.length) flag(box, 'sorted');
    }

    /* ── draw each mode ── */
    function drawCorner() {
      board(); pins(null);
      TRIS.forEach(function (o, t) {
        shape(o.p, true, o.col || BAND[t % BAND.length], DO === 'match');
        if (TICKS && o.p.length === 3) ticks(o.p);
        if (o.lab) { var ys = o.p.map(function (q) { return GP(q).y; }), xs = o.p.map(function (q) { return GP(q).x; }); pill((Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, Math.min.apply(null, ys) - 22 * F, o.lab, NAVY); }
        o.p.forEach(function (q, i) { if (S.ck[t + ':' + i]) cornerMark(o.p, i, S.ck[t + ':' + i]); });
      });
      if (LAST && TRIS[LAST[0]]) squareOn(TRIS[LAST[0]].p, LAST[1]);
      corners(TRIS.map(function (o, t) { return { t: t, p: o.p }; }), check);
      svg.setAttribute('aria-label', (FREE ? 'Three triangles drawn in red, yellow and blue.' : 'A geoboard with 11 rows of 11 pins.') + ' ' + TRIS.length + (TRIS.length === 1 ? ' shape.' : ' shapes.') + ' The set square waits at the bottom right.');
      namesUI();
    }
    function drawBand() {
      board(); btns.innerHTML = '';
      if (S.p.length) shape(S.p, !!S.k, S.bad ? RED : BAND[DO === 'make' ? 3 : 0]);
      pins(S.k ? null : hook, S.p[0]);
      if (S.k) {
        ticks(S.p);
        if (!S.bad) {
          S.p.forEach(function (q, i) { if (S.ck['u:' + i]) cornerMark(S.p, i, S.ck['u:' + i]); });
          if (LAST && LAST[0] === 'u') squareOn(S.p, LAST[1]);
          if (DO === 'make') corners([{ t: 'u', p: S.p }], check);
        }
      }
      btn('↩ Start over', 'ghost sm tr-redo', startOver, !S.p.length);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins.' + (S.k ? ' A band makes a triangle.' : S.p.length ? ' The band is on ' + S.p.length + ' pins.' : ''));
      namesUI();
    }
    function after() {
      if (DO === 'corner' || DO === 'match') { if (TRIS.every(function (o, t) { return allChecked(t); })) flag(box, 'checked'); }
      if ((DO === 'name' || DO === 'make') && S.k && !S.bad) flag(box, 'made');
      if (DO === 'make' && S.k && !S.bad) { var kc = keyCorner(S.p); if (kc > -1 && S.ck['u:' + kc]) flag(box, 'checked'); }
      if (namedAll()) { flag(box, 'named'); if (DO !== 'rsort') msg('✓ Every name is in the right box.', true); }
    }
    function draw() { sizeF(); layoutFree(); if (svg) svg.innerHTML = ''; if (btns) btns.innerHTML = ''; ({ rsort: drawSort, corner: drawCorner, match: drawCorner, name: drawBand, make: drawBand }[DO] || drawCorner)(); }
    onWidth(box, draw); draw();
    // restore flags after a reload
    if (DO !== 'rsort') { if (DO === 'corner' || DO === 'match') { if (TRIS.every(function (o, t) { return allChecked(t); })) flag(box, 'checked'); }
      if ((DO === 'name' || DO === 'make') && S.k && !S.bad) flag(box, 'made'); if (DO === 'make' && S.k && !S.bad) { var kc0 = keyCorner(S.p); if (kc0 > -1 && S.ck['u:' + kc0]) flag(box, 'checked'); } if (namedAll()) flag(box, 'named'); }
  };

'''
CSS = '''
/* ── tns (3.12.05 properties of triangles; patch1205): rod sort, name boxes, cards, corners ── */
.sb-tns .tn-rtray{display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:12px;margin:6px 0 10px;padding:10px;border:1.5px dashed #DCE2EE;border-radius:12px;background:#FBFCFE;min-height:90px}
.sb-tns .tn-rt{background:#fff;border:2px solid #DCE2EE;border-radius:12px;padding:6px;cursor:grab;touch-action:none;box-shadow:0 2px 0 rgba(0,0,0,.12)}
.sb-tns .tn-rt svg{display:block;width:150px;height:auto}
.sb-tns .tn-rt.sel{border-color:#C9A227;box-shadow:0 0 0 3px rgba(201,162,39,.35)}
.sb-tns .tn-rt.dragging{opacity:.85;z-index:5;position:relative}
.sb-tns .tn-rt.in{cursor:default;box-shadow:none;border-color:#1E7A4C;padding:4px}
.sb-tns .tn-rt.in svg{width:110px}
.sb-tns .tn-groups{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.sb-tns .tn-grp{border:2.5px dashed #8792A8;border-radius:14px;background:#fff;min-height:140px;padding:8px;cursor:pointer;text-align:center}
.sb-tns .tn-grp:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.sb-tns .tn-gh{font-weight:900;color:#0E1C42;font-size:16px;margin-bottom:6px}
.sb-tns .tn-gin{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
.sb-tns .tn-done{margin:0;font-weight:800;color:#1E7A4C}
.sb-tns .tn-names{display:flex;flex-direction:column;gap:8px;margin:8px 0 4px}
.sb-tns .tn-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px}
.sb-tns .tn-lab{font-weight:900;color:#0E1C42;font-size:17px;min-width:120px;text-align:right}
.sb-tns .tn-slot{min-width:170px;min-height:42px;display:inline-flex;align-items:center;justify-content:center;padding:6px 12px;border:2.5px dashed #8792A8;border-radius:12px;color:#8792A8;font-size:14px;font-weight:800;background:#fff;cursor:pointer}
.sb-tns .tn-slot.ok{border-style:solid;border-color:#1E7A4C;color:#1E7A4C;background:#E8F5EE;font-size:17px;cursor:default}
.sb-tns .tn-slot.pre{border-style:solid;border-color:#8792A8;color:#0E1C42;background:#F1F3F8;font-size:17px;cursor:default}
.sb-tns .tn-slot:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.sb-tns .tn-cards{justify-content:center;margin-top:6px}
.sb-tns .tn-card.sel{outline:3px solid #C9A227;outline-offset:2px}
.sb-tns .tn-card.used{opacity:.35}
.sb-tns svg .tn-cn{cursor:pointer}
.sb-tns svg .tn-cn:not(.done) circle+circle{animation:anPulse 1.6s ease-in-out infinite}
.sb-tns svg .tn-cn:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
@media (max-width:560px){.sb-tns .tn-groups{gap:6px}.sb-tns .tn-grp{min-height:110px;padding:5px 3px}.sb-tns .tn-gh{font-size:13px}.sb-tns .tn-rt.in svg{width:72px}.sb-tns .tn-rt.in{padding:2px}.sb-tns .tn-lab{min-width:0;width:100%;text-align:center}.sb-tns .tn-slot{min-width:0;flex:1}.sb-tns .tn-rt svg{width:120px}}
'''
for p in sys.argv[1:]:
    s = open(p).read()
    if p.endswith('.css'):
        if '.sb-tns .tn-rtray' in s: print(p, 'already'); continue
        open(p, 'w').write(s.rstrip('\n') + '\n' + CSS.lstrip('\n')); print(p, 'ok'); continue
    if 'MODS.tns = function' in s: print(p, 'already'); continue
    assert s.count(HOOK) == 1, p
    s = s.replace(HOOK, MOD + HOOK, 1)
    open(p, 'w').write(s); print(p, 'ok')
