# patch1206: 3.12.06 Properties of Quadrilaterals. Run after patch1205 on sb.src.js, assets/storybook/sb.js and assets/storybook/sb.css.
#   python3 patch1206.py tools/storybook/sb.src.js assets/storybook/sb.js assets/storybook/sb.css
# Adds MODS.quad: 4-sided shapes on the 11 x 11 geoboard (Math Tools look), the set square, tick marks for equal sides
# and arrow marks for parallel sides. Definitions follow the Florida B.E.S.T. K-5 glossary (trapezoid = at least one
# pair of parallel sides; square is a rectangle and a rhombus). data-do:
#   reshape : Think. A band starts as data-quad. Drag a corner (or tap it, then tap a pin) to another pin. Crossed bands
#             and 3 corners in a line are refused. Flag made3 after 3 different new shapes.
#   check   : a fixed shape (data-quad). Tap two sides to test if they are parallel (flag par when every pair is found),
#             set square on each corner (flag checked), then the card with the name that tells the most (flag named).
#   make    : band of 4 pins (tap the first pin again to close). data-rule rect-not-square | one-pair (flag made); then
#             corners (data-need "ck") and/or the parallel pair (data-need "par"); then the name (flag named).
#   isrect  : Ben. A fixed square: set square on every corner (flag checked), then a Yes / No card (flag sorted).
#   qsort   : Mia. Four drawn shapes into Quadrilateral / Not a quadrilateral (flag sorted).
#   tree    : the Wow. Six picture cards onto the family tree (flag placed), then tap every name that fits the square
#             (flag all).
import sys
HOOK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod]; if (f) try { f(b); } catch (e) { console.error('model', b.dataset.mod, e); } });"
MOD = r'''  /* ── quad (3.12.06 properties of quadrilaterals): geoboard, set square, tick + arrow marks, name cards. data-do reshape | check | make | isrect | qsort | tree. See patch1206.py ── */
  MODS.quad = function (box) {
    var name = box.dataset.name || 'quad', DO = box.dataset.do || 'check';
    var NAVY = '#0E1C42', OKG = '#1E7A4C', RED = '#B23A2E', GOLD = '#C9A227', GRAY = '#5B6478', PIN = '#6B7280', LINE = '#D9DEEA', SQF = '#D9F0E3', ORG = '#C26A0A';
    var BAND = ['#6B46C1', '#23915A', '#D2453B', '#2F6FDE', '#F08A24'];
    var Q0 = box.dataset.quad ? JSON.parse(box.dataset.quad) : [[2, 3], [8, 3], [8, 7], [2, 7]];
    var RULE = box.dataset.rule || '', NEED = box.dataset.need || '', COL = box.dataset.col || BAND[DO === 'make' ? 3 : 0];
    var CARDS = (box.dataset.cards || 'quadrilateral,trapezoid,parallelogram,rectangle,rhombus,square').split(',');
    var DEF = { reshape: { p: Q0.map(function (q) { return q.slice(); }), seen: {}, sel: -1 }, check: { pr: [], ck: {}, nm: '', s1: -1 }, make: { p: [], k: 0, pr: [], ck: {}, nm: '', s1: -1 }, isrect: { ck: {}, v: '' }, qsort: { g: {} }, tree: { at: {}, tap: {} } };
    var S = mstate(name, JSON.parse(JSON.stringify(DEF[DO] || {})));
    var HTMLMODE = DO === 'qsort' || DO === 'tree';
    box.innerHTML = '<div class="sb-stage sb-an sb-quad"><div class="an-btns"></div>' + (HTMLMODE ? '<div class="qd-tray" role="group" aria-label="Cards to drag"></div><div class="qd-area"></div>' : '<svg viewBox="0 0 700 460" role="group"></svg><div class="qd-chips"></div><div class="qd-names"></div><div class="bm-chips qd-cards" role="group" aria-label="Name cards to drag"></div>') + '</div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.an-btns', box), chips = $('.qd-chips', box), namesB = $('.qd-names', box), cardsB = $('.qd-cards', box), F = 1, SEL = null, LAST = -1;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OKG + '">' + h + '</span>' : h; }
    function bad(t) { pluck(HZ.D4); msg(t); }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    function tapK(g, fn) { g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); }
    function P(v, deg, r) { var a = deg * Math.PI / 180; return { x: v.x + r * Math.cos(a), y: v.y - r * Math.sin(a) }; }
    function pts(a) { return a.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '); }
    function bar(A, B, w, fill, g) { var dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2, kx = dx / L * 8, ky = dy / L * 8; return NS('polygon', { points: [[A.x + nx + kx, A.y + ny + ky], [B.x + nx - kx, B.y + ny - ky], [B.x - nx - kx, B.y - ny - ky], [A.x - nx + kx, A.y - ny + ky]].map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: fill }, g); }

    /* ── shape math (whole-number pins: exact) ── */
    function d2(a, b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }
    function vec(p, i) { var a = p[i], b = p[(i + 1) % p.length]; return [b[0] - a[0], b[1] - a[1]]; }
    function isPar(p, i, j) { var u = vec(p, i), v = vec(p, j); return u[0] * v[1] - u[1] * v[0] === 0; }
    function parPairs(p) { var r = []; if (isPar(p, 0, 2)) r.push([0, 2]); if (isPar(p, 1, 3)) r.push([1, 3]); return r; }
    function kindAt(p, i) { var n = p.length, q = p[i], a = p[(i + n - 1) % n], c = p[(i + 1) % n], dot = (a[0] - q[0]) * (c[0] - q[0]) + (a[1] - q[1]) * (c[1] - q[1]); return dot === 0 ? 'square' : dot > 0 ? 'smaller' : 'bigger'; }
    function allSq(p) { for (var i = 0; i < 4; i++) if (kindAt(p, i) !== 'square') return false; return true; }
    function allEq(p) { var s = p.map(function (q, i) { return d2(q, p[(i + 1) % 4]); }); return s[0] === s[1] && s[1] === s[2] && s[2] === s[3]; }
    function best(p) { var n = parPairs(p).length; if (n === 2) { var r = allSq(p), h = allEq(p); return r && h ? 'square' : r ? 'rectangle' : h ? 'rhombus' : 'parallelogram'; } return n === 1 ? 'trapezoid' : 'quadrilateral'; }
    var FAM = { quadrilateral: ['quadrilateral'], trapezoid: ['quadrilateral', 'trapezoid'], parallelogram: ['quadrilateral', 'trapezoid', 'parallelogram'], rectangle: ['quadrilateral', 'trapezoid', 'parallelogram', 'rectangle'], rhombus: ['quadrilateral', 'trapezoid', 'parallelogram', 'rhombus'], square: ['quadrilateral', 'trapezoid', 'parallelogram', 'rectangle', 'rhombus', 'square'] };
    function cross(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }
    function segX(a, b, c, d) { var d1 = cross(c, d, a), d2_ = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d); return ((d1 > 0 && d2_ < 0) || (d1 < 0 && d2_ > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0)); }
    function badQuad(p) {
      for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) if (p[i][0] === p[j][0] && p[i][1] === p[j][1]) return 'Two corners are on the same pin. Use 4 different pins.';
      for (var k = 0; k < 4; k++) if (cross(p[(k + 3) % 4], p[k], p[(k + 1) % 4]) === 0) return 'Three corners are in one straight line, so that side is not a corner. The shape only has 3 sides. Try a different pin.';
      if (segX(p[0], p[1], p[2], p[3]) || segX(p[1], p[2], p[3], p[0])) return 'The band crosses over itself. That makes two triangles, not one 4-sided shape. Try a different pin.';
      return '';
    }
    function same(a, b) { return a[0] === b[0] && a[1] === b[1]; }

    /* ── geoboard ── */
    var N = 11, GB = 440, MG = 30;
    function sp() { return (GB - 2 * MG) / (N - 1); }
    function GP(q) { return { x: 130 + MG + q[0] * sp(), y: 10 + MG + q[1] * sp() }; }
    function board() { svg.setAttribute('viewBox', '0 0 700 460'); NS('rect', { x: 132, y: 12, width: GB - 4, height: GB - 4, rx: 22, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg); }
    function pins(onTap, hi) {
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) (function (x, y) {
        var c = GP([x, y]), g = NS('g', onTap ? { class: 'tr-pin', 'data-p': x + ',' + y, role: 'button', tabindex: -1, 'aria-label': 'Pin ' + (x + 1) + ', ' + (y + 1) } : { 'pointer-events': 'none' }, svg);
        if (onTap) NS('circle', { cx: c.x, cy: c.y, r: sp() * 0.48, fill: 'transparent' }, g);
        if (hi && hi[0] === x && hi[1] === y) NS('circle', { cx: c.x, cy: c.y, r: 11, fill: 'none', stroke: BAND[0], 'stroke-width': 3 }, g);
        NS('circle', { cx: c.x, cy: c.y, r: 5, fill: PIN, stroke: '#fff', 'stroke-width': 1.5 }, g);
        if (onTap) tapK(g, function () { onTap([x, y]); });
      })(x, y);
    }
    function band(p, closed, col) { NS(closed ? 'polygon' : 'polyline', { points: pts(p.map(GP)), fill: closed ? col : 'none', 'fill-opacity': .14, stroke: col, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); }
    // tick marks: sides of the same length share a mark count (1, then 2); a side with no match gets none
    function ticks(p) {
      var s = p.map(function (q, i) { return d2(q, p[(i + 1) % 4]); }), grp = {}, marks = [0, 0, 0, 0], k = 0;
      s.forEach(function (v, i) { (grp[v] = grp[v] || []).push(i); });
      Object.keys(grp).forEach(function (v) { if (grp[v].length > 1) { k++; grp[v].forEach(function (i) { marks[i] = k; }); } });
      p.forEach(function (q, i) { if (!marks[i]) return; var A = GP(q), B = GP(p[(i + 1) % 4]), dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, m = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
        for (var t = 0; t < marks[i]; t++) { var off = (t - (marks[i] - 1) / 2) * 9; NS('line', { x1: m.x + ux * off - nx * 10, y1: m.y + uy * off - ny * 10, x2: m.x + ux * off + nx * 10, y2: m.y + uy * off + ny * 10, stroke: NAVY, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); } });
    }
    // arrow marks on a parallel pair: one chevron for the first pair, two for the second, all pointing the same way
    function arrows(p, pair, n) {
      var ref = vec(p, pair[0]);
      pair.forEach(function (i) { var A = GP(p[i]), B = GP(p[(i + 1) % 4]), v = vec(p, i); if (v[0] * ref[0] + v[1] * ref[1] < 0) { var t = A; A = B; B = t; }
        var dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, m = { x: (A.x + B.x) / 2 + ux * 36, y: (A.y + B.y) / 2 + uy * 36 };
        for (var c = 0; c < n; c++) { var o = c * 10, tip = { x: m.x + ux * o, y: m.y + uy * o }; NS('polyline', { points: pts([{ x: tip.x - ux * 10 - nx * 8, y: tip.y - uy * 10 - ny * 8 }, tip, { x: tip.x - ux * 10 + nx * 8, y: tip.y - uy * 10 + ny * 8 }]), fill: 'none', stroke: ORG, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'pointer-events': 'none' }, svg); } });
    }

    /* ── set square on corners ── */
    var KW = { square: 'a square corner', smaller: 'smaller than a square corner', bigger: 'bigger than a square corner' }, KC = { square: OKG, smaller: ORG, bigger: RED };
    function cornerMark(p, i, k) {
      var n = p.length, Q = GP(p[i]), A = GP(p[(i + n - 1) % n]), C = GP(p[(i + 1) % n]), la = Math.hypot(A.x - Q.x, A.y - Q.y), lc = Math.hypot(C.x - Q.x, C.y - Q.y), u = { x: (A.x - Q.x) / la, y: (A.y - Q.y) / la }, v = { x: (C.x - Q.x) / lc, y: (C.y - Q.y) / lc };
      if (k === 'square') { var s = 14; NS('polyline', { points: pts([{ x: Q.x + u.x * s, y: Q.y + u.y * s }, { x: Q.x + (u.x + v.x) * s, y: Q.y + (u.y + v.y) * s }, { x: Q.x + v.x * s, y: Q.y + v.y * s }]), fill: 'none', stroke: OKG, 'stroke-width': 3, 'pointer-events': 'none' }, svg); return; }
      var r = 20, a1 = Math.atan2(u.y, u.x), a2 = Math.atan2(v.y, v.x), da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      NS('path', { d: 'M' + (Q.x + r * Math.cos(a1)).toFixed(1) + ' ' + (Q.y + r * Math.sin(a1)).toFixed(1) + ' A' + r + ' ' + r + ' 0 0 ' + (da > 0 ? 1 : 0) + ' ' + (Q.x + r * Math.cos(a2)).toFixed(1) + ' ' + (Q.y + r * Math.sin(a2)).toFixed(1), fill: 'none', stroke: KC[k], 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
    }
    function squareOn(p, i) {
      var n = p.length, Q = GP(p[i]), A = GP(p[(i + n - 1) % n]), C = GP(p[(i + 1) % n]), la = Math.hypot(A.x - Q.x, A.y - Q.y), u = { x: (A.x - Q.x) / la, y: (A.y - Q.y) / la };
      var w1 = { x: -u.y, y: u.x }, w2 = { x: u.y, y: -u.x }, cx = C.x - Q.x, cy = C.y - Q.y, w = (w1.x * cx + w1.y * cy) >= (w2.x * cx + w2.y * cy) ? w1 : w2, L = 92;
      NS('polygon', { points: pts([Q, { x: Q.x + u.x * L, y: Q.y + u.y * L }, { x: Q.x + w.x * L, y: Q.y + w.y * L }]), fill: SQF, 'fill-opacity': .72, stroke: NAVY, 'stroke-width': 2, 'pointer-events': 'none' }, svg);
    }
    function corners(p, onCheck) {
      p.forEach(function (q, i) {
        var c = GP(q), on = S.ck[i], g = NS('g', { class: 'tn-cn' + (on ? ' done' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'A corner' + (on ? ': ' + KW[on] : ', not checked yet') }, svg);
        NS('circle', { cx: c.x, cy: c.y, r: 24 * F, fill: 'transparent' }, g);
        if (!on) NS('circle', { cx: c.x, cy: c.y, r: 9, fill: 'rgba(201,162,39,.25)', stroke: GOLD, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, g);
        tapK(g, function () { onCheck(i); });
      });
      var home = { x: 610, y: 430 }, g = NS('g', { class: 'drag tn-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag its square corner onto a corner of the shape.' }, svg);
      NS('polygon', { points: pts([home, P(home, 0, 72), P(home, 90, 72)]), fill: SQF, 'fill-opacity': .9, stroke: '#8792A8', 'stroke-width': 2 }, g);
      NS('circle', { cx: home.x, cy: home.y, r: 30, fill: 'transparent' }, g);
      NS('text', { x: home.x + 36, y: home.y + 20, 'text-anchor': 'middle', 'font-size': 13 * F, 'font-weight': 800, fill: GRAY, text: 'set square', 'pointer-events': 'none' }, g);
      drag(g, svg, function (pt) { g.setAttribute('transform', 'translate(' + (pt.x - home.x) + ',' + (pt.y - home.y) + ')'); }, function (pt) {
        var bi = -1, bd = 1e9; p.forEach(function (q, i) { var c = GP(q), dd = pt ? Math.hypot(pt.x - c.x, pt.y - c.y) : 1e9; if (dd < bd) { bd = dd; bi = i; } });
        if (bi > -1 && bd < 40 * F) onCheck(bi); else { bad('Drop the set square so its square corner lands right on a corner of the shape.'); draw(); }
      }, function () {});
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); for (var i = 0; i < p.length; i++) if (!S.ck[i]) { onCheck(i); return; } } });
    }
    function checkCorner(p, i) { var k = kindAt(p, i); S.ck[i] = k; LAST = i; save(); pluck(k === 'square' ? HZ.C5 : k === 'bigger' ? HZ.E4 : HZ.G4); draw();
      var n = Object.keys(S.ck).length; msg('This corner is <b style="color:' + KC[k] + '">' + KW[k] + '</b>. ' + (n < p.length ? n + ' of ' + p.length + ' corners checked.' : 'All ' + p.length + ' corners checked.'), k === 'square'); after(); }
    function allCk(p) { for (var i = 0; i < p.length; i++) if (!S.ck[i]) return false; return true; }

    /* ── tap two sides to test if they are parallel ── */
    function sideTaps(p) {
      p.forEach(function (q, i) {
        var A = GP(q), B = GP(p[(i + 1) % 4]), inPair = S.pr.some(function (pp) { return pp.indexOf(i) > -1; }), g = NS('g', { class: 'qd-side' + (inPair ? ' done' : '') + (S.s1 === i ? ' sel' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'Side ' + (i + 1) + (inPair ? ', in a parallel pair' : '') }, svg);
        bar(A, B, 30 * F, S.s1 === i ? 'rgba(201,162,39,.45)' : 'rgba(255,255,255,.01)', g);
        tapK(g, function () { tapSide(p, i); });
      });
    }
    function tapSide(p, i) {
      if (S.pr.some(function (pp) { return pp.indexOf(i) > -1; })) { msg('That side is already in a parallel pair. Look at the other sides.'); return; }
      if (S.s1 < 0 || S.s1 === i) { S.s1 = S.s1 === i ? -1 : i; save(); draw(); if (S.s1 > -1) msg('Now tap the side you think goes the same way as this one.'); return; }
      var a = S.s1, b = i; S.s1 = -1;
      if (isPar(p, a, b)) { S.pr.push([a, b]); save(); pluck(HZ.C5); draw(); var all = parPairs(p).length; msg('✓ Parallel: those two sides go the same way and never meet. The arrow marks show the pair.' + (S.pr.length >= all ? ' That is every parallel pair.' : ' Look for another pair.'), true); after(); }
      else { save(); draw(); bad('Not parallel. If you made those two sides longer, they would meet. Parallel sides go the same way, like train tracks.'); }
    }
    function parDone(p) { return S.pr.length >= parPairs(p).length; }

    /* ── the name box ── */
    var WHY = { quadrilateral: 'A quadrilateral has 4 straight sides.', trapezoid: 'A trapezoid has at least 1 pair of parallel sides.', parallelogram: 'A parallelogram has 2 pairs of parallel sides.', rectangle: 'A rectangle has 4 square corners.', rhombus: 'A rhombus has 4 equal sides.', square: 'A square has 4 equal sides and 4 square corners.' };
    function nameUI(p, ready, why) {
      namesB.innerHTML = ''; cardsB.innerHTML = ''; if (!p) { cardsB.hidden = true; return; } cardsB.hidden = false;
      var line = el('div', 'tn-row'); line.appendChild(el('span', 'tn-lab', 'The name that tells the most:'));
      var sl = el('span', 'tn-slot' + (S.nm ? ' ok' : ''), S.nm ? esc(S.nm) : 'drop a name card here'); sl.tabIndex = S.nm ? -1 : 0; sl.setAttribute('role', 'button'); sl.setAttribute('aria-label', 'Box for the name' + (S.nm ? ': ' + S.nm : ''));
      if (!S.nm) tapK(sl, function () { if (SEL) put(SEL); else bad('First pick a name card, then tap this box. Or drag a card onto the box.'); });
      line.appendChild(sl); namesB.appendChild(line);
      CARDS.forEach(function (c) { var b = el('button', 'bm-chip an-card tn-card qd-card' + (SEL === c ? ' sel' : '') + (S.nm === c ? ' used' : ''), esc(c)); b.type = 'button'; b.dataset.c = c; if (S.nm) b.disabled = true;
        hdrag(b, function (t) { if (t && t.closest && t.closest('.tn-slot') && !S.nm) put(c); else bad('Drop the card right on the name box.'); }, function () { SEL = SEL === c ? null : c; draw(); if (SEL) msg('Now tap the name box.'); });
        cardsB.appendChild(b); });
      function put(c) { SEL = null; if (!ready()) { bad(why); draw(); return; } var w = best(p);
        if (c === w) { S.nm = c; LAST = -1; save(); pluck(HZ.C5); draw(); msg('✓ <b>' + esc(c) + '</b>. ' + WHY[c], true); after(); return; }
        if (FAM[w].indexOf(c) > -1) { bad('True, it is a ' + esc(c) + '! But there is a name that tells more about it. ' + WHY[c]); draw(); return; }
        bad('Not a ' + esc(c) + '. ' + WHY[c] + ' Look at the arrow marks, the tick marks and the corners.'); draw(); }
    }

    /* ══ modes ══ */
    function drawReshape() {
      board(); var p = S.p;
      band(p, true, COL);
      pins(function (q) { if (S.sel < 0) return; moveTo(S.sel, q); }, null);
      p.forEach(function (q, i) {
        var c = GP(q), g = NS('g', { class: 'drag qd-h' + (S.sel === i ? ' sel' : ''), 'data-i': i, tabindex: 0, role: 'slider', 'aria-label': 'Corner ' + (i + 1) + ' of the band. Drag it to another pin, or tap it and then tap a pin.' }, svg);
        NS('circle', { cx: c.x, cy: c.y, r: 24 * F, fill: 'transparent' }, g); NS('circle', { cx: c.x, cy: c.y, r: (S.sel === i ? 14 : 11) * F, fill: S.sel === i ? GOLD : COL, stroke: '#fff', 'stroke-width': 3 }, g);
        drag(g, svg, function (pt) { g.setAttribute('transform', 'translate(' + (pt.x - c.x) + ',' + (pt.y - c.y) + ')'); }, function (pt) {
          if (!pt) { draw(); return; } var x = Math.round((pt.x - 130 - MG) / sp()), y = Math.round((pt.y - 10 - MG) / sp());
          if (x < 0 || y < 0 || x > 10 || y > 10) { bad('Drop the corner on a pin.'); draw(); return; } moveTo(i, [x, y]); }, function () { if (S.sel > -1 && S.sel !== i) { moveTo(S.sel, S.p[i]); return; } S.sel = S.sel === i ? -1 : i; save(); draw(); if (S.sel > -1) msg('Now tap the pin where this corner should go.'); });
      });
      var n = Object.keys(S.seen).length;
      chips.innerHTML = '<span class="tr-res none">' + Math.min(n, 3) + ' of 3 new shapes</span>' + Object.keys(S.seen).slice(0, 6).map(function (k, j) { return '<span class="tr-res yes">Shape ' + (j + 1) + ' ✓</span>'; }).join('');
      btn('↩ Back to the rectangle', 'ghost sm tr-redo', function () { S.p = Q0.map(function (q) { return q.slice(); }); S.sel = -1; save(); draw(); msg('The band is a rectangle again. Your shapes still count.'); }, false);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins. A band with 4 corners. ' + n + ' new shapes made.');
      if (n >= 3) flag(box, 'made3');
    }
    function moveTo(i, q) {
      var p = S.p.map(function (r) { return r.slice(); }); p[i] = q.slice(); S.sel = -1;
      var why = badQuad(p); if (why) { save(); bad(why); draw(); return; }
      S.p = p; var key = p.map(function (r) { return r.join(','); }).slice().sort().join('|'), orig = Q0.map(function (r) { return r.join(','); }).slice().sort().join('|'), fresh = key !== orig && !S.seen[key];
      if (fresh) S.seen[key] = 1; save(); pluck(HZ.C5); draw(); var n = Object.keys(S.seen).length;
      msg(fresh ? '✓ A new shape: still 4 straight sides, 4 corners, and no gaps. ' + (n >= 3 ? 'That is 3 new shapes!' : 'Make ' + (3 - n) + ' more.') : 'You made that shape already, or it is the first rectangle. Move a corner somewhere new.', fresh);
      if (n >= 3) flag(box, 'made3');
    }
    function drawCheck() {
      board(); pins(null); var p = Q0; band(p, true, COL); ticks(p);
      S.pr.forEach(function (pp, j) { arrows(p, pp, j + 1); });
      p.forEach(function (q, i) { if (S.ck[i]) cornerMark(p, i, S.ck[i]); });
      if (LAST > -1) squareOn(p, LAST);
      sideTaps(p); corners(p, function (i) { checkCorner(p, i); });
      svg.setAttribute('aria-label', 'A 4-sided shape on a geoboard. Tick marks show sides of the same length.');
      if (DO === 'check') nameUI(p, function () { return parDone(p) && allCk(p); }, 'First find every parallel pair and check every corner. Then you will know the best name.');
    }
    function hook(q) {
      if (S.k) return;
      if (S.p.length && same(S.p[0], q)) {
        if (S.p.length < 4) { bad('Hook the band on 4 pins before you close it.'); return; }
        var why = badQuad(S.p); if (why) { bad(why.replace('Try a different pin.', 'Press Start over.')); return; }
        S.k = 1; var r = ruleBad(S.p); S.bad = r; save(); pluck(r ? HZ.D4 : HZ.C5); draw();
        if (r) { flag(box, 'made', false); msg(r); return; }
        flag(box, 'made'); msg(RULE === 'one-pair' ? '✓ A 4-sided shape with exactly 1 pair of parallel sides. Now tap the two sides that are parallel.' : '✓ A rectangle that is not a square: 2 long sides and 2 short sides. Now check every corner with the set square.', true); after(); return;
      }
      if (S.p.some(function (r) { return same(r, q); })) { bad('That pin is already in the band.'); return; }
      if (S.p.length >= 4) { bad('You have 4 pins. Now tap the first pin to close the band.'); return; }
      S.p.push(q); save(); pluck(HZ.E4 + S.p.length * 40); draw();
      msg(S.p.length < 4 ? 'Pin ' + S.p.length + ' is hooked. Tap the next pin.' : '4 pins. Now tap the first pin (the one with the ring) to close the band.');
    }
    function ruleBad(p) {
      var n = parPairs(p).length;
      if (RULE === 'one-pair') return n === 1 ? '' : n === 2 ? 'That shape has 2 pairs of parallel sides, so it is a parallelogram. Make only 1 pair go the same way: try a top side shorter than the bottom side. Press Start over.' : 'None of its sides are parallel. Make the top side and the bottom side go the same way, straight across. Press Start over.';
      if (RULE === 'rect-not-square') { if (!allSq(p)) return 'That shape does not have 4 square corners. Go straight across and straight up and down from pin to pin. Press Start over.'; if (allEq(p)) return 'That is a square: all 4 sides are the same length. Make 2 sides longer than the other 2. Press Start over.'; return ''; }
      return '';
    }
    function startOver() { S.p = []; S.k = 0; S.bad = ''; S.pr = []; S.ck = {}; S.nm = ''; S.s1 = -1; LAST = -1; save(); draw(); flag(box, 'made', false); msg('The band is off. Tap a pin to start.'); }
    function drawMake() {
      board(); var p = S.p;
      if (p.length) band(p, !!S.k, S.bad ? RED : COL);
      pins(S.k ? null : hook, p[0]);
      if (S.k && !S.bad) {
        ticks(p); S.pr.forEach(function (pp, j) { arrows(p, pp, j + 1); });
        p.forEach(function (q, i) { if (S.ck[i]) cornerMark(p, i, S.ck[i]); }); if (LAST > -1) squareOn(p, LAST);
        if (NEED.indexOf('par') > -1) sideTaps(p);
        if (NEED.indexOf('ck') > -1) corners(p, function (i) { checkCorner(p, i); });
      }
      btn('↩ Start over', 'ghost sm tr-redo', startOver, !p.length);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins.' + (S.k ? ' A band makes a 4-sided shape.' : p.length ? ' The band is on ' + p.length + ' pins.' : ''));
      nameUI(S.k && !S.bad ? p : null, function () { return (NEED.indexOf('par') < 0 || parDone(p)) && (NEED.indexOf('ck') < 0 || allCk(p)); }, NEED.indexOf('par') > -1 ? 'First tap the two sides that are parallel.' : 'First check every corner with the set square.');
    }
    function drawIsRect() {
      board(); pins(null); var p = Q0; band(p, true, COL); ticks(p);
      p.forEach(function (q, i) { if (S.ck[i]) cornerMark(p, i, S.ck[i]); }); if (LAST > -1) squareOn(p, LAST);
      corners(p, function (i) { checkCorner(p, i); });
      svg.setAttribute('aria-label', 'Ben\'s square on a geoboard. Tick marks show 4 equal sides.');
      namesB.innerHTML = ''; cardsB.innerHTML = ''; var V = { yes: 'Yes, it is a rectangle', no: 'No, it is not a rectangle' };
      var line = el('div', 'tn-row'); line.appendChild(el('span', 'tn-lab', 'Is Ben\'s square a rectangle?'));
      var sl = el('span', 'tn-slot' + (S.v ? ' ok' : ''), S.v ? esc(V[S.v]) : 'drop a card here'); sl.tabIndex = 0; sl.setAttribute('role', 'button'); sl.setAttribute('aria-label', 'Box for the card');
      if (!S.v) tapK(sl, function () { if (SEL) vput(SEL); else bad('First pick a card, then tap this box.'); });
      line.appendChild(sl); namesB.appendChild(line);
      ['yes', 'no'].forEach(function (k) { var b = el('button', 'bm-chip an-card tn-card qd-card' + (SEL === k ? ' sel' : ''), esc(V[k])); b.type = 'button'; b.dataset.c = k; if (S.v) b.disabled = true;
        hdrag(b, function (t) { if (t && t.closest && t.closest('.tn-slot') && !S.v) vput(k); else bad('Drop the card right on the box.'); }, function () { SEL = SEL === k ? null : k; draw(); });
        cardsB.appendChild(b); });
      function vput(k) { SEL = null; if (!allCk(p)) { bad('Check all 4 corners with the set square first.'); draw(); return; }
        if (k === 'yes') { S.v = 'yes'; LAST = -1; save(); pluck(HZ.C5); draw(); flag(box, 'sorted'); msg('✓ Yes! It has 4 square corners, so it is a rectangle. Its 4 equal sides make it a square, too.', true); }
        else { bad('Look at the corners you checked: all 4 are square corners. A rectangle is any 4-sided shape with 4 square corners.'); draw(); } }
    }
    /* qsort (Mia) */
    var QS = [{ k: 'dart', yes: true, d: 'M20 110 L70 15 L120 110 L70 75 Z', why: 'It looks pointy, but count: 4 straight sides, 4 corners, no gaps. A dart shape is a quadrilateral.' },
              { k: 'curve', yes: false, d: 'M20 110 L20 25 L120 25 L120 110 Q70 70 20 110', why: 'One side is curved. A quadrilateral has 4 straight sides.' },
              { k: 'gap', yes: false, d: 'M30 110 L20 25 L120 25 L120 110 L55 110', why: 'The sides don\'t all meet: there is a gap. A quadrilateral is closed.' },
              { k: 'five', yes: false, d: 'M20 110 L20 50 L70 15 L120 50 L120 110 Z', why: 'Count the sides: there are 5. A quadrilateral has exactly 4.' }];
    function qsvg(o) { return '<svg viewBox="0 0 140 125" aria-hidden="true"><path d="' + o.d + '" fill="' + (/Z$/.test(o.d) ? 'rgba(47,111,222,.14)' : 'none') + '" stroke="#2F6FDE" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/></svg>'; }
    function drawSort() {
      var tray = $('.qd-tray', box), area = $('.qd-area', box); tray.innerHTML = ''; area.innerHTML = '<div class="qd-groups"></div>'; var gb = $('.qd-groups', area);
      [['yes', 'Quadrilateral'], ['no', 'Not a quadrilateral']].forEach(function (g) {
        var d = el('div', 'tn-grp qd-grp', '<div class="tn-gh">' + g[1] + '</div><div class="tn-gin"></div>'); d.dataset.g = g[0]; d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-label', 'Group: ' + g[1]);
        QS.forEach(function (o, i) { if (S.g[i] === g[0]) $('.tn-gin', d).appendChild(el('div', 'tn-rt in', qsvg(o))); });
        tapK(d, function () { if (SEL != null) drop(SEL, g[0]); else bad('First pick a shape, then tap its group. Or drag the shape onto a group.'); });
        gb.appendChild(d);
      });
      QS.forEach(function (o, i) { if (S.g[i]) return; var b = el('button', 'tn-rt' + (SEL === i ? ' sel' : ''), qsvg(o)); b.type = 'button'; b.dataset.k = o.k; b.setAttribute('aria-label', { dart: 'A pointy dart shape.', curve: 'A shape with one curved side.', gap: 'A shape whose sides do not all meet.', five: 'A house shape with a pointed top.' }[o.k] + ' Drag it onto a group, or tap it and then tap a group.');
        hdrag(b, function (t) { var g = t && t.closest && t.closest('.qd-grp'); if (g) drop(i, g.dataset.g); else bad('Drop the shape right on one of the two groups.'); }, function () { SEL = SEL === i ? null : i; draw(); if (SEL != null) msg('Now tap the group where this shape goes.'); });
        tray.appendChild(b); });
      if (!tray.children.length) tray.appendChild(el('p', 'tn-done', '✓ All four shapes are sorted.'));
      function drop(i, g) { SEL = null; var o = QS[i], ok = (g === 'yes') === o.yes;
        if (ok) { S.g[i] = g; save(); pluck(HZ.C5); draw(); msg('✓ ' + o.why, true); if (Object.keys(S.g).length >= QS.length) { flag(box, 'sorted'); msg('✓ All sorted. Only the dart is a quadrilateral: 4 straight sides, closed. The others each break a rule.', true); } return; }
        bad(o.yes ? 'Look again. Count its sides and check for gaps or curves. ' + 'Does it break any rule?' : 'Look again. ' + o.why); draw(); }
      if (Object.keys(S.g).length >= QS.length) flag(box, 'sorted');
    }
    /* tree (Wow) */
    var TREE = ['quadrilateral', 'trapezoid', 'parallelogram', 'rectangle', 'rhombus', 'square'];
    var TP = { quadrilateral: 'M15 95 L55 20 L120 70 L60 70 Z', trapezoid: 'M15 95 L125 95 L95 30 L40 30 Z', parallelogram: 'M10 90 L95 90 L130 30 L45 30 Z', rectangle: 'M15 30 L125 30 L125 90 L15 90 Z', rhombus: 'M70 10 L120 60 L70 110 L20 60 Z', square: 'M30 15 L110 15 L110 95 L30 95 Z' };
    var TO = ['rhombus', 'quadrilateral', 'square', 'trapezoid', 'rectangle', 'parallelogram'];
    function tsvg(k) { return '<svg viewBox="0 0 140 120" aria-hidden="true"><path d="' + TP[k] + '" fill="rgba(107,70,193,.14)" stroke="#6B46C1" stroke-width="5" stroke-linejoin="round"/></svg>'; }
    function drawTree() {
      var tray = $('.qd-tray', box), area = $('.qd-area', box); tray.innerHTML = ''; var placed = Object.keys(S.at).length >= TREE.length;
      area.innerHTML = '<div class="qd-tree"><div class="qd-tr r1"></div><div class="qd-arr">↓</div><div class="qd-tr r2"></div><div class="qd-arr">↓</div><div class="qd-tr r3"></div><div class="qd-arr">↙ ↘</div><div class="qd-tr r4"></div><div class="qd-arr">↘ ↙</div><div class="qd-tr r5"></div></div>';
      var rows = { quadrilateral: 'r1', trapezoid: 'r2', parallelogram: 'r3', rectangle: 'r4', rhombus: 'r4', square: 'r5' };
      TREE.forEach(function (k) {
        var on = S.at[k], d = el('div', 'tn-grp qd-node' + (on ? ' ok' : '') + (S.tap[k] ? ' tap' : ''), '<div class="tn-gh">' + k + '</div><div class="tn-gin">' + (on ? '<div class="tn-rt in">' + tsvg(k) + '</div>' : '<span class="qd-ph">drop a shape</span>') + '</div>');
        d.dataset.k = k; d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-label', (placed ? 'Name: ' + k + (S.tap[k] ? ', fits the square' : '') : 'Spot on the tree: ' + k + (on ? ', filled' : '')));
        tapK(d, function () { if (placed) { if (!S.tap[k]) { S.tap[k] = 1; save(); pluck(HZ.C5 + Object.keys(S.tap).length * 30); draw(); var n = Object.keys(S.tap).length; msg(n >= TREE.length ? '✓ All 6 names fit the square! It is a quadrilateral, a trapezoid, a parallelogram, a rectangle, a rhombus and a square. That makes it the most special 4-sided shape.' : '✓ A square is a ' + k + ', too. ' + n + ' of 6 names. Are there more?', true); if (n >= TREE.length) flag(box, 'all'); } return; }
          if (SEL) drop(SEL, k); else bad('First pick a shape card, then tap its spot on the tree. Or drag the card onto the tree.'); });
        $('.' + rows[k], area).appendChild(d);
      });
      TO.forEach(function (k) { if (S.at[k]) return; var b = el('button', 'tn-rt qd-tc' + (SEL === k ? ' sel' : ''), tsvg(k)); b.type = 'button'; b.dataset.k = k; b.setAttribute('aria-label', 'A shape card. Drag it to its spot on the family tree.');
        hdrag(b, function (t) { var g = t && t.closest && t.closest('.qd-node'); if (g) drop(k, g.dataset.k); else bad('Drop the card right on a spot on the tree.'); }, function () { SEL = SEL === k ? null : k; draw(); if (SEL) msg('Now tap the spot on the tree where this shape goes.'); });
        tray.appendChild(b); });
      if (!tray.children.length) tray.appendChild(el('p', 'tn-done', placed ? 'Now tap every name on the tree that fits a square.' : ''));
      function drop(k, spot) { SEL = null;
        if (S.at[spot]) { bad('That spot is already filled.'); draw(); return; }
        if (k === spot) { S.at[spot] = 1; save(); pluck(HZ.C5); draw(); msg('✓ ' + WHY[k] + (Object.keys(S.at).length >= TREE.length ? ' The tree is full!' : ''), true); if (Object.keys(S.at).length >= TREE.length) flag(box, 'placed'); return; }
        var hint = FAM[k].indexOf(spot) > -1 ? 'True, that shape is a ' + spot + '. But it belongs lower on the tree, where the name tells more.' : 'That shape is not a ' + spot + '. ' + WHY[spot];
        bad(hint + ' Check its sides and corners.'); draw(); }
      if (placed) flag(box, 'placed'); if (Object.keys(S.tap).length >= TREE.length) flag(box, 'all');
    }
    function after() {
      if (DO === 'check') { if (parDone(Q0)) flag(box, 'par'); if (allCk(Q0)) flag(box, 'checked'); if (S.nm) flag(box, 'named'); }
      if (DO === 'make' && S.k && !S.bad) { flag(box, 'made'); if (parDone(S.p) && S.pr.length) flag(box, 'par'); if (allCk(S.p)) flag(box, 'checked'); if (S.nm) flag(box, 'named'); }
      if (DO === 'isrect') { if (allCk(Q0)) flag(box, 'checked'); if (S.v) flag(box, 'sorted'); }
    }
    function draw() { sizeF(); if (svg) svg.innerHTML = ''; if (btns) btns.innerHTML = ''; if (chips) chips.innerHTML = ''; ({ reshape: drawReshape, check: drawCheck, make: drawMake, isrect: drawIsRect, qsort: drawSort, tree: drawTree }[DO] || drawCheck)(); }
    onWidth(box, draw); draw(); after();
  };

'''
CSS = '''
/* ── quad (3.12.06 properties of quadrilaterals; patch1206): side taps, sort, family tree ── */
.sb-quad svg .qd-side,.sb-quad svg .qd-h,.sb-quad svg .tr-pin,.sb-quad svg .tn-cn{cursor:pointer}
.sb-quad svg .qd-side:focus-visible,.sb-quad svg .qd-h:focus-visible,.sb-quad svg .tn-cn:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.sb-quad svg .tn-cn:not(.done) circle+circle{animation:anPulse 1.6s ease-in-out infinite}
.sb-quad .qd-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0}
.sb-quad .qd-chips .tr-res{display:inline-block;padding:4px 10px;border-radius:999px;font-weight:800;font-size:14px;border:1.5px solid #DCE2EE;background:#fff;color:#5B6478}
.sb-quad .qd-chips .tr-res.yes{border-color:#1E7A4C;color:#1E7A4C;background:#E8F5EE}
.sb-quad .qd-names{display:flex;flex-direction:column;gap:8px;margin:8px 0 4px}
.sb-quad .tn-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px}
.sb-quad .tn-lab{font-weight:900;color:#0E1C42;font-size:17px}
.sb-quad .tn-slot{min-width:220px;min-height:42px;display:inline-flex;align-items:center;justify-content:center;padding:6px 12px;border:2.5px dashed #8792A8;border-radius:12px;color:#8792A8;font-size:14px;font-weight:800;background:#fff;cursor:pointer}
.sb-quad .tn-slot.ok{border-style:solid;border-color:#1E7A4C;color:#1E7A4C;background:#E8F5EE;font-size:17px;cursor:default}
.sb-quad .tn-slot:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.sb-quad .qd-cards{justify-content:center;margin-top:6px}
.sb-quad .tn-card.sel{outline:3px solid #C9A227;outline-offset:2px}
.sb-quad .qd-tray{display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:10px;margin:6px 0 10px;padding:10px;border:1.5px dashed #DCE2EE;border-radius:12px;background:#FBFCFE;min-height:80px}
.sb-quad .tn-rt{background:#fff;border:2px solid #DCE2EE;border-radius:12px;padding:6px;cursor:grab;touch-action:none;box-shadow:0 2px 0 rgba(0,0,0,.12)}
.sb-quad .tn-rt svg{display:block;width:96px;height:auto}
.sb-quad .tn-rt.sel{border-color:#C9A227;box-shadow:0 0 0 3px rgba(201,162,39,.35)}
.sb-quad .tn-rt.dragging{opacity:.85;z-index:5;position:relative}
.sb-quad .tn-rt.in{cursor:default;box-shadow:none;border-color:#1E7A4C;padding:3px}
.sb-quad .tn-rt.in svg{width:70px}
.sb-quad .tn-done{margin:0;font-weight:800;color:#1E7A4C}
.sb-quad .qd-groups{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sb-quad .tn-grp{border:2.5px dashed #8792A8;border-radius:14px;background:#fff;min-height:120px;padding:8px;cursor:pointer;text-align:center}
.sb-quad .tn-grp:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.sb-quad .tn-gh{font-weight:900;color:#0E1C42;font-size:16px;margin-bottom:6px}
.sb-quad .tn-gin{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
.sb-quad .qd-tree{display:flex;flex-direction:column;align-items:center;gap:2px}
.sb-quad .qd-tr{display:flex;gap:12px;justify-content:center}
.sb-quad .qd-arr{font-weight:900;color:#8792A8;font-size:20px;letter-spacing:40px;padding-left:40px}
.sb-quad .qd-node{min-height:0;width:180px;padding:6px}
.sb-quad .qd-node.ok{border-style:solid;border-color:#1E7A4C;background:#F4FBF7}
.sb-quad .qd-node.tap{background:#E8F5EE;box-shadow:0 0 0 3px rgba(30,122,76,.35)}
.sb-quad .qd-ph{display:inline-block;padding:16px 0;color:#8792A8;font-weight:800;font-size:13px}
@media (max-width:560px){.sb-quad .qd-node{width:39vw;max-width:170px}.sb-quad .tn-rt svg{width:76px}.sb-quad .tn-rt.in svg{width:56px}.sb-quad .tn-slot{min-width:0;width:100%}.sb-quad .qd-arr{letter-spacing:20px;padding-left:20px}}
'''
for p in sys.argv[1:]:
    s = open(p).read()
    if p.endswith('.css'):
        if '.sb-quad svg .qd-side' in s: print(p, 'already'); continue
        open(p, 'w').write(s.rstrip('\n') + '\n' + CSS.lstrip('\n')); print(p, 'ok'); continue
    if 'MODS.quad = function' in s: print(p, 'already'); continue
    assert s.count(HOOK) == 1, p
    s = s.replace(HOOK, MOD + HOOK, 1)
    open(p, 'w').write(s); print(p, 'ok')
