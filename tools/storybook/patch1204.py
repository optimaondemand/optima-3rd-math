# patch1204: 3.12.04 Triangles. Run after patch1203 on sb.src.js, assets/storybook/sb.js and assets/storybook/sb.css.
#   python3 patch1204.py tools/storybook/sb.src.js assets/storybook/sb.js assets/storybook/sb.css
# Adds MODS.tri: Cuisenaire rods and a geoboard, drawn like the Math Tools site (rod colors from tools/early.js,
# geoboard look from tools/geometry.js). No decoration. data-do:
#   close : Think. A base rod lies on the mat (data-base), two rods wait in the tray (data-rods "4,7").
#           Drag (or tap) a rod onto a gold ring at an end of the base rod (flags left, right). When both are on,
#           they meet at the top: the shape is closed (flag closed). Then tap each side (flag sides).
#   cant  : Kai. Same, but the two short rods can't reach each other (data-base 8, data-rods "2,3").
#           Both rods on (flag tried): they swing toward each other and lie flat; a gold bracket shows the gap.
#   try   : the Wow (Euclid I.20). Base rod (data-base 7) and a left rod (data-left 3) are fixed. The tray holds
#           rods 1 to 10. Drop one on the right ring: it closes, lies flat, or can't reach. Each rod tried gets a
#           chip under the mat. Flag all when every rod 1 to 10 is tried.
#   band  : Your Turn. 11 x 11 geoboard. Tap 3 pins, then the first pin again, to close a band (flag closed;
#           three pins in a line are refused: "flat"). Tap each side (flag sides), then each vertex (flag verts).
#   gap   : Ben. A band with 3 straight sides whose loose end stops one pin short. Card first (data-ans not;
#           flag sorted), then drag the loose end onto the first pin (flag closed).
#   curve : Mia. Two straight bands and one curved side. Card (flag sorted), tap the side that isn't straight
#           (flag found), press Swap in a straight band (flag fixed).
#   right : On your own. Close a band with a square corner whose two short sides are data-legs "3,5" pin
#           spaces (flag made), then drag the set square onto that corner (flag checked).
import sys
HOOK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod]; if (f) try { f(b); } catch (e) { console.error('model', b.dataset.mod, e); } });"
MOD = r'''  /* ── tri (3.12.04 triangles): Cuisenaire rods + geoboard, Math Tools look. data-do close | cant | try | band | gap | curve | right. See patch1204.py ── */
  MODS.tri = function (box) {
    var name = box.dataset.name || 'tri', DO = box.dataset.do || 'close', ANS = box.dataset.ans || 'not';
    var NAVY = '#0E1C42', OKG = '#1E7A4C', RED = '#B23A2E', GOLD = '#C9A227', GRAY = '#5B6478', PIN = '#6B7280', LINE = '#D9DEEA', SQF = '#D9F0E3';
    var BAND = ['#6B46C1', '#23915A', '#D2453B', '#2F6FDE', '#F08A24'];
    var ROD = [null, ['#F7F5EE', NAVY], ['#E03C31', '#fff'], ['#7BC043', '#fff'], ['#8E44AD', '#fff'], ['#F4D03F', NAVY], ['#1E7B34', '#fff'], ['#2C2C2C', '#fff'], ['#8B5A2B', '#fff'], ['#2E86DE', '#fff'], ['#F08A24', '#fff']];
    var RNAME = [null, 'white', 'red', 'light green', 'purple', 'yellow', 'dark green', 'black', 'brown', 'blue', 'orange'];
    var DEF = { close: { L: 0, R: 0, sd: {} }, cant: { L: 0, R: 0 }, 'try': { t: 0, tr: {} }, band: { p: [], k: 0, sd: {}, vt: {} }, gap: { c: '', k: 0 }, curve: { c: '', f: 0, x: 0 }, right: { p: [], k: 0, on: 0 } };
    var S = mstate(name, JSON.parse(JSON.stringify(DEF[DO] || {})));
    var ROD_MODE = DO === 'close' || DO === 'cant' || DO === 'try';
    box.innerHTML = '<div class="sb-stage sb-an sb-tri"><div class="an-btns"></div><svg viewBox="0 0 700 420" role="group"></svg>' + (ROD_MODE ? '<div class="tr-tray" role="group" aria-label="Rods to drag"></div>' : '') + '<div class="bm-chips an-chips"></div><div class="an-sort" hidden></div></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.an-btns', box), chips = $('.an-chips', box), sortB = $('.an-sort', box), tray = $('.tr-tray', box), F = 1;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OKG + '">' + h + '</span>' : h; }
    function P(v, deg, r) { var a = deg * Math.PI / 180; return { x: v.x + r * Math.cos(a), y: v.y - r * Math.sin(a) }; }
    function line(a, b, col, w, extra) { var o = { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: col, 'stroke-width': w || 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }; for (var k in (extra || {})) o[k] = extra[k]; return NS('line', o, svg); }
    function pill(x, y, t, col) { var w = (String(t).length * 9.5 + 18) * F, h = 30 * F; x = Math.max(w / 2 + 6, Math.min(694 - w / 2, x)); var g = NS('g', { 'pointer-events': 'none' }, svg); NS('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill: '#fff', stroke: col || NAVY, 'stroke-width': 2 }, g); NS('text', { x: x, y: y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, 'font-weight': 900, fill: col || NAVY, text: t }, g); return g; }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    function tapK(g, fn) { g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); }
    function bad(t) { pluck(HZ.D4); msg(t); }
    // a tap area along a side: a rotated bar (a plain line has no area for taps or tests)
    function bar(A, B, w, fill, g) { var dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2, kx = dx / L * 6, ky = dy / L * 6; return NS('polygon', { points: [[A.x + nx + kx, A.y + ny + ky], [B.x + nx - kx, B.y + ny - ky], [B.x - nx - kx, B.y - ny - ky], [A.x - nx + kx, A.y - ny + ky]].map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: fill }, g); }

    /* ══ Cuisenaire rods ══ */
    var U = 56;
    // one rod from A to B (its length is n units), drawn like the Math Tools rods: flat color, thin dark edge, its number
    function rod(A, B, n, extra) {
      var g = NS('g', extra || { 'pointer-events': 'none' }, svg), T = 24 * (F > 1 ? 1.6 : 1), dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy * T / 2, ny = ux * T / 2;
      NS('polygon', { points: [[A.x + nx, A.y + ny], [B.x + nx, B.y + ny], [B.x - nx, B.y - ny], [A.x - nx, A.y - ny]].map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: ROD[n][0], stroke: 'rgba(0,0,0,.45)', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g);
      var ang = Math.atan2(dy, dx) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
      var m = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }, t = NS('text', { x: m.x, y: m.y + 6, 'text-anchor': 'middle', 'font-size': 16 * (F > 1 ? 1.6 : 1), 'font-weight': 800, fill: ROD[n][1], text: String(n) }, g);
      t.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ' ' + m.x.toFixed(1) + ' ' + m.y.toFixed(1) + ')');
      return g;
    }
    function ring(p, side, filled) {
      var g = NS('g', { class: 'tr-ring' + (filled ? ' on' : ''), 'data-side': side, 'pointer-events': filled ? 'none' : 'all' }, svg);
      NS('circle', { cx: p.x, cy: p.y, r: 30 * F, fill: 'transparent' }, g);
      if (!filled) NS('circle', { cx: p.x, cy: p.y, r: 17 * F, fill: 'rgba(201,162,39,.18)', stroke: GOLD, 'stroke-width': 3, 'stroke-dasharray': '5 4' }, g);
      return g;
    }
    // where the two free ends meet: a on the left end A, b on the right end B, base c (all in units)
    function apex(A, c, a, b) { var x = (a * a - b * b + c * c) / (2 * c), h2 = a * a - x * x; return h2 > 0.01 ? { x: A.x + x * U, y: A.y - Math.sqrt(h2) * U } : null; }
    function trayRods(list, used, onPut) {
      if (!tray) return; tray.innerHTML = '';
      list.forEach(function (n) {
        var b = el('button', 'tr-rod' + (used[n] ? ' used' : ''), String(n)); b.type = 'button'; b.dataset.n = n;
        b.style.width = (n * 26 + 10) + 'px'; b.style.background = ROD[n][0]; b.style.color = ROD[n][1];
        b.setAttribute('aria-label', 'The ' + RNAME[n] + ' ' + n + ' rod. Drag it onto a gold ring, or tap it.');
        if (used[n] && DO !== 'try') { b.disabled = true; }
        hdrag(b, function (t) { var r = t && t.closest && t.closest('.tr-ring'); if (r) onPut(n, r.dataset.side); else bad('Drop the rod right on a gold ring, at the end of the long rod.'); }, function () { onPut(n, null); });
        tray.appendChild(b);
      });
    }
    function base(A, n) { var B = { x: A.x + n * U, y: A.y }; rod(A, B, n); return B; }

    /* ── close (Think) and cant (Kai) ── */
    var BASE = +box.dataset.base || 9, TR = (box.dataset.rods || '4,7').split(',').map(Number);
    function drawJoin() {
      svg.setAttribute('viewBox', '0 0 700 420'); var A = { x: (700 - BASE * U) / 2, y: 330 }, B = base(A, BASE), a = S.L, b = S.R, top = a && b ? apex(A, BASE, a, b) : null;
      if (a && !b) { var pa = P(A, 62, a * U); rod(A, pa, a); }
      if (b && !a) { var pb = P(B, 118, b * U); rod(B, pb, b); }
      if (a && b && top) {
        rod(A, top, a); rod(B, top, b);
        if (DO === 'close') {
          var sides = [[A, B, 'b'], [A, top, 'l'], [B, top, 'r']];
          sides.forEach(function (s) {
            var on = S.sd[s[2]], g = NS('g', { class: 'tr-side' + (on ? ' done' : ''), role: 'button', tabindex: 0, 'aria-label': 'A side of the shape' + (on ? ', counted' : '') }, svg);
            bar(s[0], s[1], 40 * F, on ? 'rgba(30,122,76,.3)' : 'rgba(255,255,255,.01)', g);
            tapK(g, function () { S.sd[s[2]] = 1; save(); pluck(HZ.C5); draw(); var n = Object.keys(S.sd).length; if (n >= 3) { flag(box, 'sides'); msg('✓ 3 sides. Each rod is one straight side.', true); } else msg('Side ' + n + '. Tap the other sides too.'); });
          });
          [A, B, top].forEach(function (v) { NS('circle', { cx: v.x, cy: v.y, r: 7, fill: NAVY, 'pointer-events': 'none' }, svg); });
        }
      }
      if (a && b && !top) {
        // the two short rods can't reach: lay them flat toward each other and show the gap
        var ea = { x: A.x + a * U, y: A.y - 34 }, eb = { x: B.x - b * U, y: B.y - 34 }, A2 = { x: A.x, y: A.y - 34 }, B2 = { x: B.x, y: B.y - 34 };
        rod(A2, ea, a); rod(B2, eb, b);
        line({ x: ea.x, y: ea.y - 26 }, { x: eb.x, y: eb.y - 26 }, GOLD, 4); line({ x: ea.x, y: ea.y - 34 }, { x: ea.x, y: ea.y - 18 }, GOLD, 4); line({ x: eb.x, y: eb.y - 34 }, { x: eb.x, y: eb.y - 18 }, GOLD, 4);
        pill((ea.x + eb.x) / 2, ea.y - 58 * F, 'gap', GOLD);
        NS('path', { d: 'M' + (A.x + a * U) + ' ' + A.y + ' A' + a * U + ' ' + a * U + ' 0 0 0 ' + (A.x) + ' ' + (A.y - a * U), fill: 'none', stroke: GRAY, 'stroke-width': 1.5, 'stroke-dasharray': '6 6', 'pointer-events': 'none' }, svg);
        NS('path', { d: 'M' + (B.x) + ' ' + (B.y - b * U) + ' A' + b * U + ' ' + b * U + ' 0 0 0 ' + (B.x - b * U) + ' ' + B.y, fill: 'none', stroke: GRAY, 'stroke-width': 1.5, 'stroke-dasharray': '6 6', 'pointer-events': 'none' }, svg);
      }
      if (!a) ring(A, 'L'); if (!b) ring(B, 'R');
      if (!(a && b)) pill(350, 380 + 4 * F, 'the ' + RNAME[BASE] + ' ' + BASE + ' rod', GRAY);
      trayRods(TR, { 4: 0 }, put);
      if (tray) $$('.tr-rod', tray).forEach(function (r) { var n = +r.dataset.n; if (n === S.L || n === S.R) { r.disabled = true; r.classList.add('used'); } });
      svg.setAttribute('aria-label', 'A ' + RNAME[BASE] + ' ' + BASE + ' rod lies flat.' + (a ? ' A ' + a + ' rod is on its left end.' : '') + (b ? ' A ' + b + ' rod is on its right end.' : '') + (a && b ? (top ? ' The rods meet at the top. The shape is closed.' : ' The rods cannot reach each other. There is a gap.') : ''));
      if (a) flag(box, 'left'); if (b) flag(box, 'right'); if (a && b && top) flag(box, 'closed'); if (a && b && !top) flag(box, 'tried');
      if (DO === 'close' && Object.keys(S.sd).length >= 3) flag(box, 'sides');
    }
    function put(n, side) {
      if (n === S.L || n === S.R) return;
      if (!side) side = !S.L ? 'L' : 'R';
      if (side === 'L' && S.L) side = 'R'; if (side === 'R' && S.R) side = 'L';
      S[side] = n; save(); pluck(HZ.E4 + n * 20); draw();
      if (S.L && S.R) {
        var A = { x: 0, y: 0 }, ok = apex(A, BASE, S.L, S.R);
        if (ok) msg('✓ The rods meet at the top. Three straight sides, end to end, with no gaps: the shape is closed.', true);
        else msg('The ' + S.L + ' rod and the ' + S.R + ' rod swing toward each other, but they can\'t reach. Together they make ' + (S.L + S.R) + ', and the long rod is ' + BASE + '. There is a gap, so the shape can\'t close.');
      } else msg('The ' + RNAME[n] + ' ' + n + ' rod is on. Now put the other rod on the other ring.');
    }

    /* ── try (the Wow, Euclid I.20) ── */
    var LEFT = +box.dataset.left || 3;
    function kindOf(t) { var c = BASE, a = LEFT; return t > Math.abs(c - a) && t < c + a ? 'yes' : (t === Math.abs(c - a) || t === c + a) ? 'flat' : 'short'; }
    function drawTry() {
      svg.setAttribute('viewBox', '0 0 700 420'); U = 50; var A = { x: 210, y: 330 }, B = base(A, BASE), t = S.t;
      if (!t) { rod(A, P(A, 70, LEFT * U), LEFT); ring(B, 'R'); }
      else {
        var k = kindOf(t);
        if (k === 'yes') { var top = apex(A, BASE, LEFT, t); rod(A, top, LEFT); rod(B, top, t); pill(350, 60 * F, 'it closes: a triangle', OKG); }
        else if (k === 'flat') {
          if (t === BASE + LEFT) { var L2 = { x: A.x - LEFT * U, y: A.y - 30 }; rod({ x: A.x, y: A.y - 30 }, L2, LEFT); rod({ x: B.x, y: B.y - 60 }, { x: B.x - t * U, y: B.y - 60 }, t); }
          else { rod({ x: A.x, y: A.y - 30 }, { x: A.x + LEFT * U, y: A.y - 30 }, LEFT); rod({ x: B.x, y: B.y - 30 }, { x: B.x - t * U, y: B.y - 30 }, t); }
          pill(350, 60 * F, 'it lies flat: no triangle', RED);
        } else {
          var ea = { x: A.x + LEFT * U, y: A.y - 30 }, eb = { x: B.x - t * U, y: B.y - 30 };
          rod({ x: A.x, y: A.y - 30 }, ea, LEFT); rod({ x: B.x, y: B.y - 30 }, eb, t);
          line({ x: ea.x, y: ea.y - 24 }, { x: eb.x, y: eb.y - 24 }, GOLD, 4); pill((ea.x + eb.x) / 2, ea.y - 50 * F, 'gap', GOLD);
          pill(350, 60 * F, 'it can\'t reach: no triangle', RED);
        }
        btn('↩ Take the ' + t + ' rod off', 'ghost sm tr-off', function () { S.t = 0; save(); draw(); msg('Pick another rod for the third side.'); });
      }
      var all = []; for (var n = 1; n <= 10; n++) all.push(n);
      trayRods(all, S.tr, function (n) { S.t = n; S.tr[n] = kindOf(n); save(); pluck(kindOf(n) === 'yes' ? HZ.C5 : HZ.D4); draw(); var k = kindOf(n);
        msg(k === 'yes' ? '✓ The ' + n + ' rod closes the shape: a triangle.' : k === 'flat' ? 'The ' + n + ' rod makes the rods lie flat in one straight line. No triangle.' : 'The ' + n + ' rod is too short. The ends can\'t reach. No triangle.', k === 'yes'); });
      chips.innerHTML = '<span class="tr-res none">' + Object.keys(S.tr).length + ' of 10 rods tried</span>' + all.filter(function (n) { return S.tr[n]; }).map(function (n) { var k = S.tr[n]; return '<span class="tr-res ' + k + '">' + n + ': ' + (k === 'yes' ? '✓ closes' : k === 'flat' ? 'flat' : 'can\'t reach') + '</span>'; }).join('');
      var cnt = Object.keys(S.tr).length;
      svg.setAttribute('aria-label', 'A black 7 rod lies flat. A light green 3 rod is on its left end.' + (t ? ' The ' + t + ' rod is on the right end.' : '') + ' You have tried ' + cnt + ' of 10 rods.');
      if (cnt >= 10) flag(box, 'all');
    }

    /* ══ geoboard: 11 x 11 pins, like the Math Tools Geoboard ══ */
    var N = 11, GB = 440, MG = 30;
    function sp() { return (GB - 2 * MG) / (N - 1); }
    function GP(q) { return { x: 130 + MG + q[0] * sp(), y: 10 + MG + q[1] * sp() }; }
    function board() {
      svg.setAttribute('viewBox', '0 0 700 460');
      NS('rect', { x: 132, y: 12, width: GB - 4, height: GB - 4, rx: 22, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
    }
    function pins(onTap, hi) {
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) (function (x, y) {
        var c = GP([x, y]), g = NS('g', onTap ? { class: 'tr-pin', 'data-p': x + ',' + y, role: 'button', tabindex: -1, 'aria-label': 'Pin ' + (x + 1) + ', ' + (y + 1) } : { 'pointer-events': 'none' }, svg);
        if (onTap) NS('circle', { cx: c.x, cy: c.y, r: sp() * 0.48, fill: 'transparent' }, g);
        if (hi && hi[0] === x && hi[1] === y) NS('circle', { cx: c.x, cy: c.y, r: 11, fill: 'none', stroke: BAND[0], 'stroke-width': 3 }, g);
        NS('circle', { cx: c.x, cy: c.y, r: 5, fill: PIN, stroke: '#fff', 'stroke-width': 1.5 }, g);
        if (onTap) tapK(g, function () { onTap([x, y]); });
      })(x, y);
    }
    function poly(ps) { return ps.map(function (q) { var p = GP(q); return p.x + ',' + p.y; }).join(' '); }
    function bandShape(ps, closed, col) { return NS(closed ? 'polygon' : 'polyline', { points: poly(ps), fill: closed ? col : 'none', 'fill-opacity': .14, stroke: col, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); }
    function same(a, b) { return a[0] === b[0] && a[1] === b[1]; }
    function cross(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }
    function sqAt(q, a, c, col) { var Q = GP(q), A = GP(a), C = GP(c), la = Math.hypot(A.x - Q.x, A.y - Q.y), lc = Math.hypot(C.x - Q.x, C.y - Q.y), s = 14;
      var u = { x: (A.x - Q.x) / la * s, y: (A.y - Q.y) / la * s }, v = { x: (C.x - Q.x) / lc * s, y: (C.y - Q.y) / lc * s };
      NS('polyline', { points: [[Q.x + u.x, Q.y + u.y], [Q.x + u.x + v.x, Q.y + u.y + v.y], [Q.x + v.x, Q.y + v.y]].map(function (p) { return p[0] + ',' + p[1]; }).join(' '), fill: 'none', stroke: col || NAVY, 'stroke-width': 2.5, 'pointer-events': 'none' }, svg); }
    function isRight(q, a, c) { return (a[0] - q[0]) * (c[0] - q[0]) + (a[1] - q[1]) * (c[1] - q[1]) === 0; }
    function L2(a, b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }
    // hook pins into a band: tap pins, then tap the first pin to close it
    function hook(q, after) {
      if (S.k) return;
      if (S.p.length && same(S.p[0], q)) {
        if (S.p.length < 3) { bad('Hook the band on 3 pins before you close it.'); return; }
        if (S.p.length > 3) { bad('A triangle needs exactly 3 pins. Press Start over and use 3 pins.'); return; }
        if (cross(S.p[0], S.p[1], S.p[2]) === 0) { bad('Those 3 pins are in one straight line, so the band lies flat. Press Start over and pick 3 pins that are not in a line.'); return; }
        S.k = 1; save(); pluck(HZ.C5); draw(); after(); return;
      }
      if (S.p.some(function (r) { return same(r, q); })) { bad('That pin is already in the band.'); return; }
      if (S.p.length >= 3) { bad('You have 3 pins. Now tap the first pin to close the band.'); return; }
      S.p.push(q); save(); pluck(HZ.E4 + S.p.length * 40); draw();
      msg(S.p.length < 3 ? 'Pin ' + S.p.length + ' is hooked. Tap the next pin.' : '3 pins. Now tap the first pin (the one with the ring) to close the band.');
    }
    function startOver() { S.p = []; S.k = 0; if (S.sd) S.sd = {}; if (S.vt) S.vt = {}; S.on = 0; save(); draw(); msg('The band is off. Tap a pin to start.'); }

    /* ── band (Your Turn) ── */
    function drawBand() {
      board(); btns.innerHTML = '';
      if (S.p.length) bandShape(S.k ? S.p : S.p, !!S.k, BAND[0]);
      pins(S.k ? null : function (q) { hook(q, function () { msg('✓ The band is closed: a triangle. Now tap each side.', true); flag(box, 'closed'); }); }, S.p[0]);
      if (S.k) {
        S.p.forEach(function (q, i) {
          var a = GP(q), b = GP(S.p[(i + 1) % 3]), on = S.sd[i], g = NS('g', { class: 'tr-side' + (on ? ' done' : ''), role: 'button', tabindex: 0, 'aria-label': 'Side ' + (i + 1) + (on ? ', counted' : '') }, svg);
          bar(a, b, 26 * F, on ? 'rgba(30,122,76,.5)' : 'rgba(255,255,255,.01)', g);
          tapK(g, function () { S.sd[i] = 1; save(); pluck(HZ.C5); draw(); var n = Object.keys(S.sd).length; if (n >= 3) { flag(box, 'sides'); msg('✓ 3 sides, all straight. Now tap each vertex.', true); } else msg('Side ' + n + '. Tap another side.'); });
        });
        if (Object.keys(S.sd).length >= 3) S.p.forEach(function (q, i) {
          var c = GP(q), on = S.vt[i], g = NS('g', { class: 'tr-vt' + (on ? ' done' : ''), role: 'button', tabindex: 0, 'aria-label': 'Vertex ' + (i + 1) + (on ? ', counted' : '') }, svg);
          NS('circle', { cx: c.x, cy: c.y, r: 22, fill: 'transparent' }, g); NS('circle', { cx: c.x, cy: c.y, r: on ? 11 : 9, fill: on ? OKG : GOLD, stroke: '#fff', 'stroke-width': 2 }, g);
          tapK(g, function () { S.vt[i] = 1; save(); pluck(HZ.G4); draw(); var n = Object.keys(S.vt).length; if (n >= 3) { flag(box, 'verts'); msg('✓ 3 vertices. Each vertex has an angle, so a triangle has 3 angles too.', true); } else msg('Vertex ' + n + '. Find another one.'); });
        });
      }
      btn('↩ Start over', 'ghost sm tr-redo', startOver, !S.p.length);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins.' + (S.k ? ' A band makes a triangle.' : S.p.length ? ' The band is on ' + S.p.length + ' pins.' : ''));
      if (S.k) flag(box, 'closed'); if (Object.keys(S.sd).length >= 3) flag(box, 'sides'); if (Object.keys(S.vt).length >= 3) flag(box, 'verts');
    }

    /* the card (gap, curve) */
    var WORDS = { yes: 'a triangle', not: 'not a triangle' };
    function sortRow(show, lead) {
      sortB.hidden = !show; if (!show) return; var ok = S.c && S.c === ANS;
      sortB.innerHTML = '<div class="an-sline"><span>' + lead + '</span><span class="an-slot' + (S.c ? ok ? ' ok' : ' no' : '') + '" tabindex="0" role="button" aria-label="Box for the card">' + (S.c ? esc(WORDS[S.c]) : 'drop a card here') + '</span></div><div class="bm-chips an-cards" role="group" aria-label="Cards to drag"></div>';
      var tr = $('.an-cards', sortB);
      ['yes', 'not'].forEach(function (k) { var c = el('button', 'bm-chip an-card', esc(WORDS[k])); c.type = 'button'; c.dataset.k = k; tr.appendChild(c); hdrag(c, function (t) { if (t && t.closest && t.closest('.an-slot')) pick(k); }, function () { pick(k); }); });
    }
    var WHYC = { gap: 'Look where the band ends. Does it get back to the pin where it started?', curve: 'A triangle\'s sides are all straight. Look at the side on the bottom.' };
    function pick(k) { S.c = k; save(); draw(); if (k === ANS) { pluck(HZ.C5); flag(box, 'sorted'); msg('✓ Right. It is not a triangle yet.', true); } else { pluck(HZ.D4); flag(box, 'sorted', false); msg('Not that card. ' + WHYC[DO]); } }

    /* ── gap (Ben) ── */
    var GPTS = [[1, 8], [5, 1], [9, 8], [2, 8]];
    function drawGap() {
      board(); btns.innerHTML = '';
      if (S.k) bandShape(GPTS.slice(0, 3), true, BAND[2]);
      else {
        bandShape(GPTS, false, BAND[2]); pins(null);
        var s = GP(GPTS[0]), e = GP(GPTS[3]);
        line({ x: e.x, y: e.y + 22 }, { x: s.x, y: s.y + 22 }, GOLD, 3); line({ x: e.x, y: e.y + 14 }, { x: e.x, y: e.y + 30 }, GOLD, 3); line({ x: s.x, y: s.y + 14 }, { x: s.x, y: s.y + 30 }, GOLD, 3);
        pill((s.x + e.x) / 2, s.y + 52, 'gap', GOLD);
        if (S.c === ANS) {
          var h = NS('g', { class: 'drag tr-end', tabindex: 0, role: 'slider', 'aria-label': 'The loose end of the band. Drag it onto the pin where the band starts.' }, svg);
          NS('circle', { cx: e.x, cy: e.y, r: 26 * F, fill: 'transparent' }, h); NS('circle', { cx: e.x, cy: e.y, r: 13 * F, fill: BAND[2], stroke: '#fff', 'stroke-width': 3 }, h);
          drag(h, svg, function (pt) { h.setAttribute('transform', 'translate(' + (pt.x - e.x) + ',' + (pt.y - e.y) + ')'); }, function (pt) { if (pt && Math.hypot(pt.x - s.x, pt.y - s.y) < 26 * F) closeGap(); else { bad('Drop the loose end right on the first pin, where the band starts.'); draw(); } }, function () {});
          h.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); closeGap(); } });
        }
      }
      if (S.k) pins(null);
      sortRow(!S.k, 'Ben\'s shape is');
      svg.setAttribute('aria-label', S.k ? 'The band is closed: a triangle with 3 straight sides.' : 'A band with 3 straight sides. Its loose end stops one pin before the pin where it started, so there is a gap.');
      if (S.c === ANS) flag(box, 'sorted'); if (S.k) flag(box, 'closed');
    }
    function closeGap() { S.k = 1; save(); pluck(HZ.C5); draw(); flag(box, 'closed'); msg('✓ Now the band gets back to where it started. The shape is closed: a triangle.', true); }

    /* ── curve (Mia) ── */
    var CP = [[1, 8], [5, 1], [9, 8]];
    function drawCurve() {
      board(); btns.innerHTML = ''; pins(null);
      var a = GP(CP[0]), b = GP(CP[1]), c = GP(CP[2]);
      line(a, b, BAND[1], 5); line(b, c, BAND[1], 5);
      if (S.x) line(c, a, BAND[1], 5);
      else {
        var d = 'M' + c.x + ' ' + c.y + ' Q ' + ((a.x + c.x) / 2) + ' ' + (c.y + 120) + ' ' + a.x + ' ' + a.y;
        NS('path', { d: d, fill: 'none', stroke: S.f ? RED : BAND[1], 'stroke-width': 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        if (S.c === ANS) {
          var g = NS('g', { class: 'tr-cv', role: 'button', tabindex: 0, 'aria-label': 'The bottom side' }, svg);
          NS('path', { d: d, fill: 'none', stroke: 'transparent', 'stroke-width': 34 }, g);
          var g2 = NS('g', { class: 'tr-st', role: 'button', tabindex: 0, 'aria-label': 'A straight side' }, svg);
          NS('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: 'transparent', 'stroke-width': 30 }, g2);
          tapK(g2, function () { bad('That side is straight. Find the side that bends.'); });
          tapK(g, function () { S.f = 1; save(); pluck(HZ.C5); draw(); flag(box, 'found'); msg('✓ That side is curved, not straight. A triangle\'s 3 sides are all straight.', true); });
        }
        if (S.f) btn('📏 Swap in a straight band', 'tr-fix', function () { S.x = 1; save(); pluck(HZ.G4); draw(); flag(box, 'fixed'); msg('✓ Now all 3 sides are straight, and they meet with no gaps. It is a triangle.', true); });
      }
      sortRow(!S.f, 'Mia\'s shape is');
      svg.setAttribute('aria-label', S.x ? 'A triangle with 3 straight sides.' : 'A shape with 2 straight sides and 1 curved side at the bottom.');
      if (S.c === ANS) flag(box, 'sorted'); if (S.f) flag(box, 'found'); if (S.x) flag(box, 'fixed');
    }

    /* ── right (On your own) ── */
    var LEGS = (box.dataset.legs || '3,5').split(',').map(Number);
    function rightAt() { if (!S.k) return -1; for (var i = 0; i < 3; i++) { var q = S.p[i], a = S.p[(i + 2) % 3], c = S.p[(i + 1) % 3]; if (isRight(q, a, c)) { var l = [L2(q, a), L2(q, c)].sort(function (x, y) { return x - y; }); if (l[0] === LEGS[0] * LEGS[0] && l[1] === LEGS[1] * LEGS[1]) return i; return -2; } } return -3; }
    function drawRight() {
      board(); btns.innerHTML = '';
      if (S.p.length) bandShape(S.p, !!S.k, BAND[3]);
      pins(S.k ? null : function (q) { hook(q, checkMade); }, S.p[0]);
      var ri = rightAt();
      if (ri >= 0) {
        var q = S.p[ri], a = S.p[(ri + 2) % 3], c = S.p[(ri + 1) % 3], Q = GP(q);
        if (S.on) { sqAt(q, a, c, OKG); var A = GP(a), ang = Math.atan2(-(A.y - Q.y), A.x - Q.x) * 180 / Math.PI, C = GP(c), angc = Math.atan2(-(C.y - Q.y), C.x - Q.x) * 180 / Math.PI, d = ((angc - ang) + 360) % 360, rot = d === 90 ? ang : angc;
          var p1 = P(Q, rot, 120), p2 = P(Q, rot + 90, 120); NS('polygon', { points: [Q, p1, p2].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: SQF, 'fill-opacity': .7, stroke: NAVY, 'stroke-width': 2, 'pointer-events': 'none' }, svg);
          pill(570, 40 * F, 'it fits: a square corner', OKG); }
        else {
          var home = { x: 610, y: 420 }, g = NS('g', { class: 'drag tr-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag its square corner onto the square corner of your triangle.' }, svg);
          NS('polygon', { points: [home, P(home, 0, 80), P(home, 90, 80)].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: SQF, 'fill-opacity': .85, stroke: '#8792A8', 'stroke-width': 2 }, g);
          NS('circle', { cx: home.x, cy: home.y, r: 30, fill: 'transparent' }, g);
          drag(g, svg, function (pt) { g.setAttribute('transform', 'translate(' + (pt.x - home.x) + ',' + (pt.y - home.y) + ')'); }, function (pt) { if (pt && Math.hypot(pt.x - Q.x, pt.y - Q.y) < 34 * F) sqOn(); else { bad('Drop the set square so its square corner lands on the square corner of your triangle.'); draw(); } }, function () {});
          g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); sqOn(); } });
          pill(610, 445, 'set square', GRAY);
        }
      }
      btn('↩ Start over', 'ghost sm tr-redo', startOver, !S.p.length);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins.' + (S.k ? ' A band makes a triangle' + (ri >= 0 ? ' with a square corner.' : '.') : ''));
      if (ri >= 0) flag(box, 'made'); if (S.on) flag(box, 'checked');
    }
    function checkMade() { var ri = rightAt(); if (ri >= 0) { flag(box, 'made'); msg('✓ A triangle with a square corner, and its two short sides are ' + LEGS[0] + ' and ' + LEGS[1] + ' pin spaces. Now check the corner with the set square.', true); }
      else if (ri === -2) { flag(box, 'made', false); msg('It has a square corner, but the two sides at that corner are not ' + LEGS[0] + ' and ' + LEGS[1] + ' pin spaces long. Count the spaces between pins, not the pins. Press Start over and try again.'); }
      else { flag(box, 'made', false); msg('That is a triangle, but none of its corners is a square corner. Try going straight across and straight up or down from one pin. Press Start over.'); } }
    function sqOn() { S.on = 1; save(); pluck(HZ.C5); draw(); flag(box, 'checked'); msg('✓ The set square fits the corner exactly. Your triangle has a right angle.', true); }

    function draw() { sizeF(); svg.innerHTML = ''; btns.innerHTML = ''; ({ close: drawJoin, cant: drawJoin, 'try': drawTry, band: drawBand, gap: drawGap, curve: drawCurve, right: drawRight }[DO] || drawJoin)(); }
    onWidth(box, draw); draw();
  };

'''
CSS = '''
/* ── tri (3.12.04 triangles; patch1204): rods tray + geoboard parts ── */
.sb-tri .tr-tray{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px;margin:10px 0 4px;padding:10px;border:1.5px dashed #DCE2EE;border-radius:12px;background:#FBFCFE}
.sb-tri .tr-rod{height:30px;min-width:36px;border:1.5px solid rgba(0,0,0,.45);border-radius:4px;font:800 16px Nunito,Arial,sans-serif;cursor:grab;touch-action:none;box-shadow:0 2px 0 rgba(0,0,0,.18)}
.sb-tri .tr-rod:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.sb-tri .tr-rod.used{opacity:.35}
.sb-tri .tr-rod:disabled{cursor:default}
.sb-tri .tr-rod.dragging{opacity:.85;z-index:5;position:relative}
.sb-tri svg .tr-ring,.sb-tri svg .tr-side,.sb-tri svg .tr-vt,.sb-tri svg .tr-pin,.sb-tri svg .tr-cv,.sb-tri svg .tr-st{cursor:pointer}
.sb-tri svg .tr-ring circle+circle{animation:anPulse 1.6s ease-in-out infinite}
.sb-tri svg .tr-side:focus-visible,.sb-tri svg .tr-vt:focus-visible,.sb-tri svg .tr-cv:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.sb-tri .an-chips .tr-res{display:inline-block;padding:4px 10px;border-radius:999px;font-weight:800;font-size:14px;border:1.5px solid #DCE2EE;background:#fff;color:#5B6478}
.sb-tri .an-chips .tr-res.yes{border-color:#1E7A4C;color:#1E7A4C;background:#E8F5EE}
.sb-tri .an-chips .tr-res.flat,.sb-tri .an-chips .tr-res.short{border-color:#B23A2E;color:#B23A2E;background:#FBE7E4}
'''
for p in sys.argv[1:]:
    s = open(p).read()
    if p.endswith('.css'):
        if '.sb-tri .tr-tray' in s: print(p, 'already'); continue
        open(p, 'w').write(s.rstrip('\n') + '\n' + CSS.lstrip('\n')); print(p, 'ok'); continue
    if 'MODS.tri = function' in s: print(p, 'already'); continue
    assert s.count(HOOK) == 1, p
    s = s.replace(HOOK, MOD + HOOK, 1)
    open(p, 'w').write(s); print(p, 'ok')
