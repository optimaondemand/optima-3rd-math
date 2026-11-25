# patch1203: 3.12.03 Right Angles. Run after patch1202 on sb.src.js, assets/storybook/sb.js and assets/storybook/sb.css.
#   python3 patch1203.py tools/storybook/sb.src.js assets/storybook/sb.js assets/storybook/sb.css
# Extends the `ang` model (same tools-site Protractor-arm + Set Square look) with a folded papyrus
# right-angle checker and six new data-do jobs:
#   fold    : Think. A torn papyrus scrap with bumpy edges. Press Fold 1 (flag fold1: the fold makes a straight
#             edge), press Fold 2 (flag fold2: the edge folded onto itself makes a square corner), drag the folded
#             corner onto the set square's square corner (flag fit), then the card (data-ans right; flag sorted).
#             After that, "Tear a new scrap" folds a different scrap: it always makes the same corner.
#   corners : a shape (data-pts "x,y;x,y;..." in a 700 x 420 box, convex, listed around the shape).
#             Drag the folded checker onto each corner, or tap a corner (flag checked when every corner is
#             checked); then tap each right angle to mark it with a small square (flag marked when exactly the
#             right angles are marked). A wrong mark says why and is not kept.
#   look    : one corner that looks square (data-b base, data-a opening). Drag the checker onto the vertex
#             (flag on: a gap shows), then the card (data-ans; flag sorted).
#   cross   : two streets that cross (data-b, data-a = 90). Tap each of the 4 corners at the crossing: the
#             checker fits and a small square appears (flag four).
#   perp    : a slanted road (data-b, a multiple of 15) with a dot. Drag the green line's handle until it stands
#             at a right angle (flag stood; leaning again clears it), then drag the set square onto the dot (flag on)
#             and turn it until it fits (flag checked).
#   posts   : Euclid's posts (Book I, Prop. 28). Stand post A, then post B, at a right angle on the ground
#             (flags a, b), then press Make them taller twice (flag tall): the gap stays the same.
import sys
PICKOLD = "      if (k === ANS) { pluck(HZ.C5); flag(box, 'sorted'); msg('✓ Yes. This angle is ' + WORD[k] + '.', true); }"
PICKNEW = "      if (k === ANS) { pluck(HZ.C5); flag(box, 'sorted'); msg('✓ Yes. This angle is ' + WORD[k] + '.', true); if (DO === 'fold') draw(); }"
DEFOLD = "    var DEF = { open: { a: 6 },"
DEFNEW = "    var DEF = { fold: { f: 0, on: 0, c: '', seed: 1 }, corners: { chk: {}, mk: {}, last: -1, ex: 0, ey: 0 }, look: { on: 0, c: '' }, cross: { t: {}, last: -1 }, perp: { a: 52, on: 0, rot: 0 }, posts: { a: 70, b: 106, h: 0 }, open: { a: 6 },"
DRAWOLD = "    function draw() { sizeF(); svg.innerHTML = ''; ({ open: drawOpen, parts: drawParts, ben: drawBen, turn: drawTurn, meet: drawMeet, own: drawOwn, euclid: drawEuclid }[DO] || drawOpen)(); }"
DRAWNEW = "    function draw() { sizeF(); svg.innerHTML = ''; ({ open: drawOpen, parts: drawParts, ben: drawBen, turn: drawTurn, meet: drawMeet, own: drawOwn, euclid: drawEuclid, fold: drawFold, corners: drawCorners, look: drawLook, cross: drawCross, perp: drawPerp, posts: drawPosts }[DO] || drawOpen)(); }"
MOD = r'''
    /* ══ 3.12.03 right angles (patch1203): the folded papyrus checker ══ */
    var PAP = '#EFE0BC', PAPE = '#8C7550', PAPD = '#6B4A12';
    if (DO === 'fold') WHY = { right: { less: 'If it were less, the set square would stick out past one of your folded edges. Here both edges lie right on top of each other.', greater: 'If it were greater, your folded paper would stick out past the set square. Here both edges lie right on top of each other.' } };
    if (DO === 'look') WHY = { greater: { less: 'If it were less, the green side would hide under the checker. Here there is a gap between them.', right: 'A right angle fits the checker exactly. Here there is a gap between the checker and the green side.' } };
    // bumpy radius for a torn scrap: r(theta) in degrees, seeded
    function bump(seed) { var s = seed || 1; return function (t) { var a = t * Math.PI / 180; return 1 + .10 * Math.sin(3 * a + s * 1.7) + .07 * Math.sin(5 * a + s * 2.9) + .05 * Math.sin(8 * a + s * .6) + .03 * Math.sin(13 * a + s); }; }
    function ptsD(ps, close) { return ps.map(function (p, i) { return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ') + (close ? ' Z' : ''); }
    // the folded checker: square corner at c, straight edges along rot and rot + 90, a torn edge between them
    function checker(c, rot, size, extra, seed) {
      var g = NS('g', extra || { 'pointer-events': 'none' }, svg), R = bump(seed || 3), ps = [c], k;
      for (k = 0; k <= 90; k += 3) { var q = k === 0 || k === 90 ? 1 : (.92 + .16 * (R(k * 4) - .9)); ps.push(P(c, rot + k, size * q)); }
      NS('path', { d: ptsD(ps, true), fill: PAP, 'fill-opacity': .93, stroke: PAPE, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g);
      g.appendChild(line(c, P(c, rot, size), PAPD, 3)); g.appendChild(line(c, P(c, rot + 90, size), PAPD, 3));
      var m1 = P(c, rot, 13), m2 = P(m1, rot + 90, 13), m3 = P(c, rot + 90, 13);
      NS('polyline', { points: [m1, m2, m3].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: 'none', stroke: PAPE, 'stroke-width': 1.5 }, g);
      return g;
    }
    function sqMark(V, b, col) { var m = mark(V, b, 90, col || GRN); if (m) m.setAttribute('stroke-width', 3.5); return m; }
    // drag a whole group; onDrop gets the drop point of the group's anchor (or null)
    function dragGroup(g, anchor, onDrop) {
      drag(g, svg, function (pt) { if (!g._o) g._o = { x: pt.x, y: pt.y }; g.setAttribute('transform', 'translate(' + (pt.x - g._o.x) + ',' + (pt.y - g._o.y) + ')'); },
        function (pt) { var o = g._o; g._o = null; if (!pt || !o) { draw(); return; } onDrop({ x: anchor.x + pt.x - o.x, y: anchor.y + pt.y - o.y }); });
    }
    function wrongBeep(t) { pluck(HZ.D4); msg(t); }

    /* ── fold (Think) ── */
    function drawFold() {
      var H = F > 1 ? 460 : 420; svg.setAttribute('viewBox', '0 0 700 ' + H); var R = bump(S.seed), C = { x: 350, y: 250 }, RAD = 140, ps = [], k;
      btns.innerHTML = '';
      if (S.f === 0) {
        for (k = 0; k < 360; k += 4) ps.push(P(C, k, RAD * R(k)));
        NS('path', { d: ptsD(ps, true), fill: PAP, stroke: PAPE, 'stroke-width': 2 }, svg);
        line(P(C, 180, RAD * 1.25), P(C, 0, RAD * 1.25), GRAY, 2, { 'stroke-dasharray': '7 6' });
        NS('text', { x: C.x + RAD * 1.25 + 8, y: C.y + 5, 'font-size': 15 * F, 'font-weight': 800, fill: GRAY, text: 'fold here', 'pointer-events': 'none' }, svg);
        btn('✋ Fold 1: fold the scrap in half', 'an-f1', function () { S.f = 1; save(); pluck(HZ.E4); draw(); flag(box, 'fold1'); msg('✓ The fold made one straight edge, even though the scrap had bumpy edges.', true); });
      } else if (S.f === 1) {
        // folded in half: the top half, as wide as both halves together, with a straight bottom edge
        for (k = 0; k <= 180; k += 3) ps.push(P(C, k, RAD * Math.max(R(k), R(360 - k))));
        NS('path', { d: ptsD(ps, true), fill: PAP, stroke: PAPE, 'stroke-width': 2 }, svg);
        line(P(C, 180, RAD * R(180)), P(C, 0, RAD * Math.max(R(0), R(360))), NAVY, 5);
        line({ x: C.x, y: C.y + 22 }, { x: C.x, y: C.y - RAD * 1.3 }, GRAY, 2, { 'stroke-dasharray': '7 6' });
        NS('text', { x: C.x + 8, y: C.y - RAD * 1.3 + 4, 'font-size': 15 * F, 'font-weight': 800, fill: GRAY, text: 'fold here', 'pointer-events': 'none' }, svg);
        pill(C.x + RAD * .55, C.y + 30 * F, 'straight edge', NAVY);
        btn('✋ Fold 2: fold the straight edge onto itself', 'an-f2', function () { S.f = 2; save(); pluck(HZ.G4); draw(); flag(box, 'fold2'); msg('✓ The straight edge folded onto itself. Look at the new corner.', true); });
      } else {
        // folded twice: a quarter, square corner at the bottom left
        var SQ = { x: 530, y: H - 70 }, at = S.on ? SQ : { x: 150, y: H - 90 }, sz = 150;
        setsq(SQ, 0, 170, false);
        var g = checker(at, 0, sz, S.on ? { 'pointer-events': 'none' } : { class: 'drag an-ck', tabindex: 0, role: 'slider', 'aria-label': 'Your folded corner. Drag it onto the square corner of the set square.' }, S.seed);
        if (!S.on) { NS('circle', { cx: at.x, cy: at.y, r: 9, fill: GOLD, 'pointer-events': 'none' }, g); pill(at.x + 70, at.y + 40 * F > H - 6 ? H - 22 : at.y + 34 * F, 'your folded corner', PAPD); }
        else { sqMark(SQ, 0, GRN); pill(SQ.x + 85, SQ.y - 200 > 30 ? SQ.y - 205 : 30, 'corner on corner, edge on edge', OKG); }
        if (!S.on) {
          dragGroup(g, at, function (p) { if (Math.hypot(p.x - SQ.x, p.y - SQ.y) < 60 * F) fitOn(); else { wrongBeep('Drop your folded corner right on the square corner of the set square, the corner at the bottom left.'); draw(); } });
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fitOn(); } });
        }
        if (S.c === ANS) btn('🔄 Tear a new scrap and fold it again', 'ghost sm an-new', function () { S.seed = (S.seed % 7) + 1; S.f = 0; S.on = 0; save(); draw(); msg('A new scrap, with different bumpy edges. Fold it twice again.'); });
      }
      sortRow(S.f === 2 && S.on);
      svg.setAttribute('aria-label', ['A torn scrap of papyrus with bumpy edges.', 'The scrap folded in half. The fold is one straight edge.', 'The scrap folded twice. It has one square corner.' + (S.on ? ' It sits on the square corner of the set square and fits exactly.' : '')][S.f]);
      if (S.f >= 1) flag(box, 'fold1'); if (S.f >= 2) flag(box, 'fold2'); if (S.on) flag(box, 'fit'); if (S.on && S.c === ANS) flag(box, 'sorted');
    }
    function fitOn() { S.on = 1; save(); pluck(HZ.C5); draw(); flag(box, 'fit'); msg('✓ It fits exactly: corner on corner, and both straight edges lie on the edges of the set square.', true); }

    /* ── corners: check every corner of a shape, then mark the right angles ── */
    var PTS = (box.dataset.pts || '').split(';').filter(Boolean).map(function (s) { var a = s.split(','); return { x: +a[0], y: +a[1] }; });
    var LET = 'ABCDEFGH';
    function cornerInfo(i) {
      var n = PTS.length, V = PTS[i], nx = PTS[(i + 1) % n], pv = PTS[(i + n - 1) % n], b = angTo(V, nx), d = (angTo(V, pv) - b + 360) % 360;
      var a = d <= 180 ? d : 360 - d, rot = d <= 180 ? b : b - 90;
      return { V: V, a: a, rot: rot, free: d <= 180 ? b + 90 : b - 90, kind: Math.abs(a - 90) < 1.5 ? 'right' : a < 90 ? 'less' : 'greater', other: d <= 180 ? b + a : b - a };
    }
    var CMSG = { right: 'fits exactly. Both sides lie along its edges. It is a right angle.', less: 'is smaller: the second side hides under the checker. It is less than a right angle.', greater: 'is wider: there is a gap between the checker and the second side. It is greater than a right angle.' };
    function drawCorners() {
      svg.setAttribute('viewBox', '0 0 700 420'); var n = PTS.length, allC = true, i;
      NS('polygon', { points: PTS.map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: '#FBF6EA', stroke: 'none', 'pointer-events': 'none' }, svg);
      for (i = 0; i < n; i++) line(PTS[i], PTS[(i + 1) % n], NAVY, 5);
      for (i = 0; i < n; i++) { if (!S.chk[i]) allC = false; if (S.mk[i]) { var ci = cornerInfo(i); sqMark(ci.V, ci.rot, GRN); } }
      // the checker: in the tray, or on the last corner checked
      var tray = { x: 585, y: 395 }, li = S.last >= 0 && !allC ? cornerInfo(S.last) : null, at = li ? li.V : tray;
      if (li && li.kind === 'greater') NS('path', { d: 'M' + li.V.x + ' ' + li.V.y + ' L' + P(li.V, li.free, 70).x + ' ' + P(li.V, li.free, 70).y + ' L' + P(li.V, li.other, 70).x + ' ' + P(li.V, li.other, 70).y + ' Z', fill: 'rgba(178,58,46,.22)', stroke: 'none', 'pointer-events': 'none' }, svg);
      // corner letters and tap spots
      for (i = 0; i < n; i++) (function (i) {
        var c = cornerInfo(i), lp = P(c.V, c.rot + 45 + 180, 32 * F), done = S.chk[i];
        NS('text', { x: lp.x, y: lp.y + 7 * F, 'text-anchor': 'middle', 'font-size': 21 * F, 'font-weight': 900, fill: done ? (c.kind === 'right' ? OKG : NAVY) : NAVY, text: LET[i], 'pointer-events': 'none' }, svg);
        var t = NS('g', { class: 'rk-v' + (done ? ' done' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'Corner ' + LET[i] + (done ? ', checked: ' + WORD[c.kind] : '') + (S.mk[i] ? ', marked' : '') }, svg);
        NS('circle', { cx: c.V.x, cy: c.V.y, r: 22 * F, fill: 'transparent' }, t);
        NS('circle', { cx: c.V.x, cy: c.V.y, r: 7, fill: done ? (c.kind === 'right' ? OKG : RED) : GOLD, stroke: '#fff', 'stroke-width': 2 }, t);
        function go() { if (allC) markIt(i); else checkIt(i); }
        t.addEventListener('click', go); t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      })(i);
      // the checker goes on top, so on a phone a press on it never lands on a corner's tap spot
      var g = allC ? null : checker(at, li ? li.rot : 0, 72, { class: 'drag rk-ck', tabindex: 0, role: 'slider', 'aria-label': 'The folded checker. Drag it onto a corner of the shape.' }, 3);
      if (li && li.kind === 'less') line(li.V, P(li.V, li.other, 72), NAVY, 3, { 'stroke-dasharray': '5 5', opacity: .6 });
      if (g && !li) pill(tray.x - 70 * F, tray.y - 12, 'checker', PAPD);
      if (g) {
        dragGroup(g, at, function (p) { var best = -1, bd = 1e9; PTS.forEach(function (q, k) { var d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = k; } }); if (bd < 60 * F) checkIt(best); else { wrongBeep('Drop the checker so its square corner lands right on a corner of the shape.'); draw(); } });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); for (var k = 0; k < n; k++) if (!S.chk[k]) { checkIt(k); return; } } });
      }
      svg.setAttribute('aria-label', 'A shape with ' + n + ' corners, ' + LET.slice(0, n).split('').join(', ') + '.' + (allC ? ' Every corner is checked.' : ''));
      if (allC) flag(box, 'checked'); if (allC && marksOK()) flag(box, 'marked');
    }
    function marksOK() { for (var i = 0; i < PTS.length; i++) if (!!S.mk[i] !== (cornerInfo(i).kind === 'right')) return false; return true; }
    function checkIt(i) {
      var c = cornerInfo(i); S.chk[i] = 1; S.last = i; save(); pluck(c.kind === 'right' ? HZ.C5 : c.kind === 'less' ? HZ.E4 : HZ.G4); draw();
      var left = 0; for (var k = 0; k < PTS.length; k++) if (!S.chk[k]) left++;
      msg((c.kind === 'right' ? '✓ ' : '') + 'Corner ' + LET[i] + ' ' + CMSG[c.kind] + (left ? ' ' + left + (left === 1 ? ' corner' : ' corners') + ' left to check.' : ' Every corner is checked.'), c.kind === 'right');
      if (!left) flag(box, 'checked');
    }
    function markIt(i) {
      var c = cornerInfo(i);
      if (S.mk[i]) { delete S.mk[i]; save(); draw(); msg('Corner ' + LET[i] + ': mark taken off.'); flag(box, 'marked', false); return; }
      if (c.kind !== 'right') { wrongBeep('Corner ' + LET[i] + ' is ' + WORD[c.kind] + '. Only right angles get the small square.'); return; }
      S.mk[i] = 1; save(); pluck(HZ.C5); draw();
      if (marksOK()) { flag(box, 'marked'); msg('✓ Every right angle has its small square, and no other corner does.', true); }
      else msg('✓ Corner ' + LET[i] + ' is marked with a small square.', true);
    }

    /* ── look: a corner that looks square ── */
    var LB = +box.dataset.b || 12, LA = +box.dataset.a || 100;
    function drawLook() {
      var H = 420; svg.setAttribute('viewBox', '0 0 700 ' + H); var V = { x: 250, y: 330 }, tray = { x: 560, y: 380 };
      NS('polygon', { points: [V, P(V, LB, 300), P(P(V, LB, 300), LB + LA, 220), P(V, LB + LA, 220)].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: '#F4EEE2', stroke: 'none', 'pointer-events': 'none' }, svg);
      line(V, P(V, LB, 300), NAVY); line(V, P(V, LB + LA, 260), GRN); dot(V, NAVY, 7);
      if (S.on) {
        NS('path', { d: 'M' + V.x + ' ' + V.y + ' L' + P(V, LB + 90, 150).x + ' ' + P(V, LB + 90, 150).y + ' L' + P(V, LB + LA, 150).x + ' ' + P(V, LB + LA, 150).y + ' Z', fill: 'rgba(178,58,46,.28)', stroke: 'none', 'pointer-events': 'none' }, svg);
        checker(V, LB, 150, { 'pointer-events': 'none' }, 5); line(V, P(V, LB + LA, 260), GRN); dot(V, NAVY, 7);
        var gp = P(V, LB + 90 + (LA - 90) / 2, 190); pill(gp.x - 40, gp.y - 10, 'gap', RED);
      } else {
        var g = checker(tray, 0, 110, { class: 'drag an-ck', tabindex: 0, role: 'slider', 'aria-label': 'The folded checker. Drag it so its square corner sits on the vertex.' }, 5);
        dragGroup(g, tray, function (p) { if (Math.hypot(p.x - V.x, p.y - V.y) < 60 * F) lookOn(); else { wrongBeep('Drop the checker so its square corner lands on the vertex dot.'); draw(); } });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lookOn(); } });
      }
      sortRow(!!S.on);
      svg.setAttribute('aria-label', "The corner of Ben's tile: a navy side and a green side." + (S.on ? ' The checker sits on the corner with one edge on the navy side. There is a gap between the checker and the green side.' : ''));
      if (S.on) flag(box, 'on'); if (S.on && S.c === ANS) flag(box, 'sorted');
    }
    function lookOn() { S.on = 1; save(); pluck(HZ.G4); draw(); flag(box, 'on'); msg('The checker sits on the vertex, with one edge on the navy side. Look between the checker and the green side.'); }

    /* ── cross: two streets cross ── */
    var XB = +box.dataset.b || 20, XA = +box.dataset.a || 90;
    function drawCross() {
      var H = 420; svg.setAttribute('viewBox', '0 0 700 ' + H); var V = { x: 350, y: 210 }, dirs = [XB, XB + XA, XB + 180, XB + XA + 180], i, cnt = 0;
      [[XB, XB + 180, 'Street 1'], [XB + XA, XB + XA + 180, 'Street 2']].forEach(function (s) { line(P(V, s[0], 330), P(V, s[1], 330), '#E8D9B5', 46 * (F > 1 ? 1.2 : 1), { 'stroke-linecap': 'butt' }); });
      line(P(V, XB, 330), P(V, XB + 180, 330), NAVY, 5); line(P(V, XB + XA, 330), P(V, XB + XA + 180, 330), GRN, 5);
      var l1 = P(V, XB, 250), l2 = P(V, XB + XA, 175);
      pill(l1.x, l1.y + 34 * F, 'Street 1', NAVY); pill(l2.x + 60 * F, l2.y, 'Street 2', GRN);
      for (i = 0; i < 4; i++) (function (i) {
        var b = dirs[i], done = S.t[i];
        if (done) { cnt++; if (S.last === i) checker(V, b, 70, { 'pointer-events': 'none', opacity: .7 }, 2 + i); sqMark(V, b, OKG); }
        var tp = P(V, b + 45, F > 1 ? 125 : 92), t = NS('g', { class: 'rk-q' + (done ? ' done' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'Corner ' + (i + 1) + ' at the crossing' + (done ? ', a right angle' : '') }, svg);
        NS('circle', { cx: tp.x, cy: tp.y, r: 30 * F, fill: done ? 'rgba(30,122,76,.12)' : 'rgba(201,162,39,.18)', stroke: done ? OKG : GOLD, 'stroke-width': 2.5, 'stroke-dasharray': done ? '' : '6 4' }, t);
        NS('text', { x: tp.x, y: tp.y + 7 * F, 'text-anchor': 'middle', 'font-size': 20 * F, 'font-weight': 900, fill: done ? OKG : NAVY, text: done ? '✓' : String(i + 1), 'pointer-events': 'none' }, t);
        function go() { if (S.t[i]) return; S.t[i] = 1; S.last = i; save(); pluck(HZ.C5 + i * 40); draw(); var c = 0; for (var k = 0; k < 4; k++) if (S.t[k]) c++; if (c === 4) { flag(box, 'four'); msg('✓ All four corners at the crossing are right angles.', true); } else msg('✓ Corner ' + (i + 1) + ' fits the checker: a right angle. Check the other corners too.', true); }
        t.addEventListener('click', go); t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      })(i);
      dot(V, NAVY, 7);
      svg.setAttribute('aria-label', 'Two streets cross at one point and make four corners.' + (cnt ? ' ' + cnt + ' of them checked: right angles.' : ''));
      if (cnt === 4) flag(box, 'four');
    }

    /* ── perp: stand a line on a slanted road, then check it ── */
    var RB = +box.dataset.b || 30;
    function drawPerp() {
      var H = F > 1 ? 470 : 440; svg.setAttribute('viewBox', '0 0 700 ' + H); paper(H, false); var V = { x: 330, y: H - 150 };
      var ok = S.a === 90, C = S.on ? V : { x: 120, y: 110 }, fits = S.on && ok && (S.rot === ((RB % 360) + 360) % 360 || S.rot === ((RB + 90) % 360 + 360) % 360);
      if (ok) { var g2 = setsq(C, S.rot, 150, !S.on, S.on ? { 'pointer-events': 'none' } : { class: 'drag an-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag it so its square corner sits on the dot.' }); }
      line(P(V, RB + 180, 320), P(V, RB, 320), NAVY, 6); var rp = P(V, RB, 250); pill(rp.x, rp.y + 30 * F, 'the road', NAVY);
      var e = P(V, RB + S.a, 210), gl = line(V, e, GRN, 5);
      if (ok) sqMark(V, RB, GRN); else NS('path', { d: arcD(V, 40, RB, RB + S.a), fill: 'none', stroke: GRN, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      dot(V, NAVY, 7);
      if (!S.on) {
        var h = handle(e, GRN, 'an-h', 'The round green handle on the new line. Drag it to stand the line up or lean it.'), live = S.a;
        drag(h, svg, function (pt) { var a = (angTo(V, pt) - RB + 360) % 360; if (a > 180) a = a > 270 ? 10 : 170; live = Math.max(10, Math.min(170, a)); var q = P(V, RB + live, 210); gl.setAttribute('x2', q.x); gl.setAttribute('y2', q.y); h.setAttribute('transform', 'translate(' + (q.x - e.x) + ',' + (q.y - e.y) + ')'); }, function (pt) { if (pt) setPerp(live); else draw(); });
        keys(h, function (k) { setPerp(S.a + k * 4); refocus('an-h'); });
      }
      btns.innerHTML = '';
      if (ok) {
        var hp = P(C, S.rot + 45, 150 * .707 + 30), rh = NS('g', { class: 'drag an-rot', tabindex: 0, role: 'slider', 'aria-label': 'Round turn handle of the set square. Drag it around to turn the set square.' }, svg);
        NS('circle', { cx: hp.x, cy: hp.y, r: 24 * F, fill: 'transparent' }, rh); NS('circle', { cx: hp.x, cy: hp.y, r: 16 * F, fill: '#fff', stroke: GRAY, 'stroke-width': 3 }, rh); NS('text', { x: hp.x, y: hp.y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, fill: NAVY, text: '⟳', 'pointer-events': 'none' }, rh);
        var lr = S.rot;
        drag(rh, svg, function (pt) { lr = ((Math.round((angTo(C, pt) - 45) / 15) * 15) % 360 + 360) % 360; g2.setAttribute('transform', 'rotate(' + (S.rot - lr) + ' ' + C.x + ' ' + C.y + ')'); var q = P(C, lr + 45, 150 * .707 + 30); rh.setAttribute('transform', 'translate(' + (q.x - hp.x) + ',' + (q.y - hp.y) + ')'); }, function (pt) { if (pt) setPRot(lr); else draw(); });
        keys(rh, function (k) { setPRot(S.rot + k * 15); refocus('an-rot'); });
        btn('↺ Turn', 'sm ghost an-tl', function () { setPRot(S.rot + 15); }); btn('↻ Turn', 'sm ghost an-tr', function () { setPRot(S.rot - 15); });
        if (!S.on) {
          dragGroup(g2, C, function (p) { if (Math.hypot(p.x - V.x, p.y - V.y) < 55 * F) { S.on = 1; save(); pluck(HZ.C5); draw(); flag(box, 'on'); perpFit(); } else { wrongBeep('Drop the set square so its square corner lands on the dot.'); draw(); } });
          g2.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.on = 1; save(); draw(); flag(box, 'on'); perpFit(); } });
        }
      }
      svg.setAttribute('aria-label', 'A slanted road with a dot on it, and a green line from the dot. ' + (ok ? 'The green line stands at a right angle to the road.' : 'The green line leans.') + (S.on ? ' The set square sits on the dot.' : '') + (fits ? ' It fits exactly.' : ''));
      if (ok) flag(box, 'stood'); else flag(box, 'stood', false); if (S.on) flag(box, 'on'); if (fits) flag(box, 'checked');
    }
    function setPerp(a) { a = Math.round(a); if (Math.abs(a - 90) <= 4) a = 90; S.a = Math.max(10, Math.min(170, a)); save(); pluck(S.a === 90 ? HZ.C5 : 220 + S.a * 2); draw(); msg(S.a === 90 ? '✓ The green line stands at a right angle to the road. The two lines are perpendicular.' : S.a < 90 ? 'The green line leans toward the right side of the road. Stand it up more.' : 'The green line leans toward the left side of the road. Stand it up more.', S.a === 90); }
    function setPRot(r) { S.rot = ((r % 360) + 360) % 360; save(); pluck(HZ.E4); draw(); if (S.on) perpFit(); else msg('The set square turned. Now drag it so its square corner sits on the dot.'); }
    function perpFit() { var r1 = ((RB % 360) + 360) % 360, r2 = (r1 + 90) % 360; if (S.rot === r1 || S.rot === r2) { flag(box, 'checked'); pluck(HZ.C5); msg('✓ The set square fits exactly: one edge on the road, one edge on your line. They are perpendicular.', true); } else msg('The square corner is on the dot, but its edges do not line up with the road and your line yet. Turn the set square.'); }

    /* ── posts: Euclid's posts (Book I, Prop. 28) ── */
    function drawPosts() {
      var H = F > 1 ? 500 : 440; svg.setAttribute('viewBox', '0 0 700 ' + H); var G = H - (F > 1 ? 100 : 60), A0 = { x: 250, y: G }, B0 = { x: 450, y: G }, L = [170, 250, 330][S.h] || 170;
      NS('rect', { x: 4, y: G, width: 692, height: H - G - 4, fill: '#E8D9B5', 'pointer-events': 'none' }, svg);
      line({ x: 30, y: G }, { x: 670, y: G }, NAVY, 5);
      var up = S.a === 90 && S.b === 90;
      // dotted lines show where each post points, up to the top
      [[A0, S.a, NAVY, 'A', 'an-pa'], [B0, S.b, GRN, 'B', 'an-pb']].forEach(function (q) {
        var far = P(q[0], q[1], 700); line(q[0], far, q[2], 2, { 'stroke-dasharray': '3 7', opacity: .45 });
      });
      if (up) for (var y = 1; y <= S.h + 1; y++) { var yy = G - y * (L / (S.h + 2)); line({ x: A0.x + 6, y: yy }, { x: B0.x - 6, y: yy }, GOLD, 2.5, { 'stroke-dasharray': '7 5' }); }
      if (up && S.h > 0) pill(350, G - L - 26 * F, 'the same gap all the way up', GOLD);
      [[A0, 'a', NAVY, 'A'], [B0, 'b', GRN, 'B']].forEach(function (q) {
        var V = q[0], k = q[1], a = S[k], e = P(V, a, L), ln = line(V, e, q[2], 9);
        if (a === 90) { sqMark(V, 0, q[2]); }
        dot(V, NAVY, 7); NS('text', { x: V.x, y: G + 34 * F, 'text-anchor': 'middle', 'font-size': 20 * F, 'font-weight': 900, fill: q[2], text: 'post ' + q[3], 'pointer-events': 'none' }, svg);
        var h = handle(e, q[2], 'an-p' + k, 'The round handle at the top of post ' + q[3] + '. Drag it to stand the post up or lean it.'), live = a;
        drag(h, svg, function (pt) { var aa = angTo(V, pt); if (aa > 180) aa = aa > 270 ? 20 : 160; live = Math.max(20, Math.min(160, aa)); var p2 = P(V, live, L); ln.setAttribute('x2', p2.x); ln.setAttribute('y2', p2.y); h.setAttribute('transform', 'translate(' + (p2.x - e.x) + ',' + (p2.y - e.y) + ')'); }, function (pt) { if (pt) setPost(k, live); else draw(); });
        keys(h, function (d) { setPost(k, S[k] + d * 4); refocus('an-p' + k); });
      });
      btns.innerHTML = ''; btn('⬆ Make them taller', 'an-tall', function () { if (!up) return; S.h = Math.min(2, S.h + 1); save(); pluck(HZ.C5 + S.h * 60); draw(); if (S.h >= 2) { flag(box, 'tall'); msg('✓ The posts are much taller now. The gap between them is the same at the bottom, in the middle, and at the top.', true); } else msg('Taller! Look at the gap between the posts. Make them taller again.'); }, !up || S.h >= 2);
      svg.setAttribute('aria-label', 'Two posts stand on the ground. Post A ' + (S.a === 90 ? 'stands at a right angle.' : 'leans.') + ' Post B ' + (S.b === 90 ? 'stands at a right angle.' : 'leans.') + (up ? ' The gap between them is the same all the way up.' : ''));
      if (S.a === 90) flag(box, 'a'); if (S.b === 90) flag(box, 'b'); if (S.h >= 2) flag(box, 'tall');
    }
    function setPost(k, v) {
      v = Math.round(v); if (Math.abs(v - 90) <= 4) v = 90; var was = S[k]; S[k] = Math.max(20, Math.min(160, v)); if (S[k] !== 90 && S.h) S.h = 0; save(); pluck(S[k] === 90 ? HZ.C5 : 220 + S[k] * 2); draw();
      var nm = k === 'a' ? 'Post A' : 'Post B';
      if (S[k] === 90) { flag(box, k); msg('✓ ' + nm + ' stands at a right angle on the ground. See its small square?', true); }
      else msg(nm + ' leans. Follow its dotted line: it heads ' + ((k === 'a') === (S[k] < 90) ? 'toward' : 'away from') + ' the other post. Stand it straight up.');
    }
'''
CSS = '''
/* ── ang, right angles (3.12.03) ── */
.sb-an svg .rk-v,.sb-an svg .rk-q{cursor:pointer}
.sb-an svg .rk-v:focus-visible,.sb-an svg .rk-q:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.sb-an svg .rk-q:not(.done){animation:anPulse 1.6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.sb-an svg .rk-q{animation:none}}
'''
def patch_js(p):
    s = open(p).read()
    if 'function drawFold()' in s: print(p, 'already'); return
    assert DEFOLD in s and DRAWOLD in s and PICKOLD in s, p
    s = s.replace(PICKOLD, PICKNEW, 1).replace(DEFOLD, DEFNEW, 1).replace(DRAWOLD, MOD + DRAWOLD.replace(DRAWOLD, DRAWNEW), 1)
    s = s.replace("/* ── ang (3.12.02 angles): angle-maker strips, labels, the set square check. data-do open | parts | ben | turn | meet | own | euclid. See patch1202.py ── */",
                  "/* ── ang (3.12.02 angles, 3.12.03 right angles): angle-maker strips, labels, the set square check, the folded papyrus checker. data-do open | parts | ben | turn | meet | own | euclid | fold | corners | look | cross | perp | posts. See patch1202.py, patch1203.py ── */", 1)
    open(p, 'w').write(s); print(p, 'ok')
def patch_css(p):
    s = open(p).read()
    if '.rk-v' in s: print(p, 'already'); return
    open(p, 'w').write(s.rstrip('\n') + '\n' + CSS.lstrip('\n')); print(p, 'ok')
for a in sys.argv[1:]:
    (patch_css if a.endswith('.css') else patch_js)(a)
