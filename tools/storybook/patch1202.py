# patch1202: 3.12.02 Angles. Run after patch1201 on sb.src.js, assets/storybook/sb.js and assets/storybook/sb.css.
#   python3 patch1202.py tools/storybook/sb.src.js assets/storybook/sb.js assets/storybook/sb.css
# New model `ang`: an angle drawn like the tools-site Protractor arms (navy ray, green ray with a round green
# handle, navy vertex dot, green arc; no degree scale, no degrees anywhere) and the tools-site Set Square
# (mint 45-degree triangle, gray square-corner mark). data-do picks the job:
#   open   : Think. Two strips pinned at the vertex (brad); drag the green strip open. Faint set square behind.
#            Flags little (open a little), right (fits the square corner), straight (one straight line).
#   parts  : drag the labels vertex / ray / ray onto the angle (flag labels), then drag the set square so its
#            square corner sits on the vertex (snaps along the navy ray; flag checked), then drag the card that
#            names the angle into the box (data-ans less|right|greater; flag sorted). data-b, data-a set the angle.
#   ben    : angles P (long rays, small opening) and Q (short rays, wide opening). Drag the end of Q's red ray
#            to make it longer (flag stretched), then drag Q by its vertex onto P's vertex (flag laid).
#   turn   : a right angle turned on its side (data-b). Drag the set square's corner onto the vertex (flag on),
#            then turn it with the round handle or the turn buttons until it fits (flag fits); then the card (sorted).
#   meet   : two sticks that do not touch. Drag the loose end of the green stick onto the navy stick's end
#            (flag met), then tap the vertex (flag vertex).
#   own    : grid paper. Open the green ray until the angle is greater than a right angle (flag greater), press
#            Check with the square corner (flag checked), then label the vertex and both rays (flag labels).
#   euclid : one ray standing on a straight line. Drag it until the green and red angles match (flag equal),
#            then lean it left until the red angle is less than a right angle (flag lean).
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── ang (3.12.02 angles): angle-maker strips, labels, the set square check. data-do open | parts | ben | turn | meet | own | euclid. See patch1202.py ── */
  MODS.ang = function (box) {
    var name = box.dataset.name || 'ang', DO = box.dataset.do || 'open', ANS = box.dataset.ans || '';
    var NAVY = '#0E1C42', GRN = '#1E8C5A', OKG = '#1E7A4C', RED = '#B23A2E', GOLD = '#C9A227', GRAY = '#8792A8', SQF = '#D9F0E3';
    var DEF = { open: { a: 6 }, parts: { at: {}, sq: 0, c: '' }, ben: { len: 130, laid: 0 }, turn: { on: 0, rot: 0, c: '' },
      meet: { ex: 0, ey: 0, met: 0, v: 0 }, own: { a: 40, sq: 0, at: {} }, euclid: { s: 55, eq: 0, ln: 0 } };
    var S = mstate(name, JSON.parse(JSON.stringify(DEF[DO] || {})));
    box.innerHTML = '<div class="sb-stage sb-an"><div class="an-btns"></div><svg viewBox="0 0 700 420" role="group"></svg><div class="bm-chips an-chips"></div><div class="an-sort" hidden></div></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.an-btns', box), chips = $('.an-chips', box), sortB = $('.an-sort', box), F = 1, sel = null;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OKG + '">' + h + '</span>' : h; }
    function P(v, deg, r) { var a = deg * Math.PI / 180; return { x: v.x + r * Math.cos(a), y: v.y - r * Math.sin(a) }; }
    function angTo(v, p) { var a = Math.atan2(v.y - p.y, p.x - v.x) * 180 / Math.PI; return (a + 360) % 360; }
    function line(a, b, col, w, extra) { var o = { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: col, 'stroke-width': w || 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }; for (var k in (extra || {})) o[k] = extra[k]; return NS('line', o, svg); }
    function arcD(v, r, a0, a1) { var p = P(v, a0, r), q = P(v, a1, r); return 'M' + p.x + ' ' + p.y + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 0 ' + q.x + ' ' + q.y; }
    function mark(v, b, a, col, r) {
      if (a === 90) { var s = 24, p1 = P(v, b, s), p2 = P(p1, b + 90, s), p3 = P(v, b + 90, s); return NS('polyline', { points: [p1, p2, p3].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: 'none', stroke: col, 'stroke-width': 3, 'pointer-events': 'none' }, svg); }
      if (a <= 0) return null; return NS('path', { d: arcD(v, r || 46, b, b + a), fill: 'none', stroke: col, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
    }
    function dot(v, col, r) { return NS('circle', { cx: v.x, cy: v.y, r: r || 6, fill: col || NAVY, 'pointer-events': 'none' }, svg); }
    function brad(v) { NS('circle', { cx: v.x, cy: v.y, r: 10, fill: GOLD, stroke: NAVY, 'stroke-width': 2, 'pointer-events': 'none' }, svg); dot(v, NAVY, 4); }
    function pill(x, y, t, col) { var w = (String(t).length * 9.5 + 18) * F, h = 30 * F; x = Math.max(w / 2 + 6, Math.min(694 - w / 2, x)); var g = NS('g', { 'pointer-events': 'none' }, svg); NS('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill: '#fff', stroke: col || NAVY, 'stroke-width': 2 }, g); NS('text', { x: x, y: y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, 'font-weight': 900, fill: col || NAVY, text: t }, g); return g; }
    function paper(h, grid) { NS('rect', { x: 4, y: 4, width: 692, height: h - 8, rx: 12, fill: '#fff', stroke: '#DCE2EE', 'stroke-width': 2, 'pointer-events': 'none' }, svg); if (grid) { for (var x = 24; x < 696; x += 20) line({ x: x, y: 6 }, { x: x, y: h - 6 }, '#E6EAF3', 1); for (var y = 24; y < h - 4; y += 20) line({ x: 6, y: y }, { x: 694, y: y }, '#E6EAF3', 1); } }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    function snapA(a, lo) { if (Math.abs(a - 90) <= 5) return 90; if (a >= 175) return 180; return Math.max(lo || 4, Math.round(a)); }
    function cls(a) { return a < 90 ? 'less' : a === 90 ? 'right' : a < 180 ? 'greater' : 'straight'; }
    var WORD = { less: 'less than a right angle', right: 'a right angle', greater: 'greater than a right angle', straight: 'a straight angle' };
    // the set square, as on the tools site: mint 45-degree triangle, square corner at c, legs along rot and rot + 90
    function setsq(c, rot, size, hi, extra) {
      var g = NS('g', extra || { 'pointer-events': 'none' }, svg), p1 = P(c, rot, size), p2 = P(c, rot + 90, size);
      NS('polygon', { points: [c, p1, p2].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: SQF, 'fill-opacity': .75, stroke: hi ? NAVY : GRAY, 'stroke-width': hi ? 2.5 : 1.5 }, g);
      var m1 = P(c, rot, 14), m2 = P(m1, rot + 90, 14), m3 = P(c, rot + 90, 14);
      NS('polyline', { points: [m1, m2, m3].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: 'none', stroke: GRAY, 'stroke-width': 1.5 }, g);
      return g;
    }
    function handle(p, col, cls, label, ring) {
      var g = NS('g', { class: 'drag ' + cls, tabindex: 0, role: 'slider', 'aria-label': label }, svg);
      NS('circle', { cx: p.x, cy: p.y, r: 26 * F, fill: 'transparent' }, g);
      if (ring) NS('circle', { cx: p.x, cy: p.y, r: 21 * F, fill: 'none', stroke: GOLD, 'stroke-width': 3 }, g);
      NS('circle', { cx: p.x, cy: p.y, r: 15 * F, fill: col, stroke: '#fff', 'stroke-width': 3 }, g);
      return g;
    }
    function keys(g, fn) { g.addEventListener('keydown', function (e) { var k = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? -1 : 0; if (!k) return; e.preventDefault(); fn(k); }); }
    function refocus(c) { var n = $('.' + c, svg); if (n) n.focus(); }

    /* the card that names the angle (parts, turn) */
    var CARDS = ['less', 'right', 'greater'];
    function sortRow(show) {
      sortB.hidden = !show; if (!show) return;
      var ok = S.c && S.c === ANS;
      sortB.innerHTML = '<div class="an-sline"><span>This angle is</span><span class="an-slot' + (S.c ? ok ? ' ok' : ' no' : '') + '" tabindex="0" role="button" aria-label="Box for the card">' + (S.c ? esc(WORD[S.c]) : 'drop a card here') + '</span></div><div class="bm-chips an-cards" role="group" aria-label="Cards to drag"></div>';
      var tray = $('.an-cards', sortB);
      CARDS.forEach(function (k) { var c = el('button', 'bm-chip an-card', esc(WORD[k])); c.type = 'button'; c.dataset.k = k; tray.appendChild(c);
        hdrag(c, function (t) { if (t && t.closest && t.closest('.an-slot')) pick(k); }, function () { pick(k); }); });
    }
    var WHY = {
      less: { right: 'A right angle fits the square corner exactly, with each ray on an edge. Here the green ray is not on the edge.', greater: 'If it were greater, the green ray would stick out past the set square. Look where the green ray is.' },
      right: { less: 'If it were less, the green ray would hide under the set square. Here both rays lie right on its edges.', greater: 'If it were greater, a ray would stick out past the set square. Here both rays lie right on its edges.' },
      greater: { less: 'If it were less, the green ray would hide under the set square. Look where the green ray is.', right: 'A right angle fits the square corner exactly. Here the green ray sticks out past it.' } };
    function pick(k) {
      S.c = k; save(); sortRow(true);
      if (k === ANS) { pluck(HZ.C5); flag(box, 'sorted'); msg('✓ Yes. This angle is ' + WORD[k] + '.', true); }
      else { pluck(HZ.D4); flag(box, 'sorted', false); msg('Not that card. ' + ((WHY[ANS] || {})[k] || '')); }
    }

    /* label slots and chips (parts, own) */
    function labels(slots, show) {
      // slots: [{k:'vertex'|'ray-a'|'ray-b', x, y, to:{x,y}}]
      var SW = 110 * (F > 1 ? 1.6 : 1), SH = 38 * (F > 1 ? 1.5 : 1);
      slots.forEach(function (s) {
        s.x = Math.max(SW / 2 + 8, Math.min(692 - SW / 2, s.x));
        line({ x: s.x, y: s.y }, s.to, GRAY, 1.5, { 'stroke-dasharray': '4 4', 'stroke-linecap': 'butt' }); NS('circle', { cx: s.to.x, cy: s.to.y, r: 4, fill: GRAY, 'pointer-events': 'none' }, svg);
        var full = S.at[s.k], kind = s.k === 'vertex' ? 'vertex' : 'ray';
        var g = NS('g', { class: 'an-lslot', 'data-k': s.k, role: 'button', tabindex: show && !full ? 0 : -1, 'aria-label': full ? kind : 'Empty label spot' }, svg);
        NS('rect', { x: s.x - SW / 2, y: s.y - SH / 2, width: SW, height: SH, rx: 12, fill: full ? '#E8F5EE' : '#fff', stroke: full ? OKG : sel ? GOLD : GRAY, 'stroke-width': 2.5, 'stroke-dasharray': full ? '' : '6 4' }, g);
        NS('text', { x: s.x, y: s.y + 6 * F, 'text-anchor': 'middle', 'font-size': (full ? 19 : 14) * F, 'font-weight': 900, fill: full ? OKG : GRAY, text: full ? kind : 'drop here', 'pointer-events': 'none' }, g);
        function go() { if (sel) place(sel, s.k); }
        g.addEventListener('click', go); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      chips.innerHTML = ''; if (!show) return;
      var left = ['vertex', 'ray', 'ray'].filter(function (k, i) { return k === 'vertex' ? !S.at.vertex : (i === 1 ? !(S.at['ray-a'] && S.at['ray-b']) : !(S.at['ray-a'] || S.at['ray-b'])); });
      left.forEach(function (k, i) {
        var c = el('button', 'bm-chip an-chip' + (i === 0 ? ' an-next' : '') + (sel === k ? ' sel' : ''), k); c.type = 'button'; c.dataset.k = k; chips.appendChild(c);
        hdrag(c, function (t) { var s = t && t.closest && t.closest('.an-lslot'); if (s && box.contains(s)) place(k, s.getAttribute('data-k')); }, function () { sel = sel === k ? null : k; msg(sel ? 'Now tap the spot where "' + k + '" goes.' : ''); draw(); });
      });
      if (S.at.vertex && S.at['ray-a'] && S.at['ray-b']) flag(box, 'labels');
    }
    function place(c, k) {
      if (S.at[k]) return; var kind = k === 'vertex' ? 'vertex' : 'ray';
      if (c !== kind) { pluck(HZ.D4); msg(c === 'vertex' ? 'Not that spot. The vertex is the one point where the two rays meet.' : 'Not that spot. A ray is one of the two straight sides. It starts at the vertex.'); return; }
      S.at[k] = 1; sel = null; save(); pluck(HZ.C5); draw();
      if (S.at.vertex && S.at['ray-a'] && S.at['ray-b']) { flag(box, 'labels'); msg('✓ Every label is on its part: one vertex and two rays.', true); }
      else msg(kind === 'vertex' ? '✓ Yes. The vertex is the point where the two rays meet.' : '✓ Yes. A ray is one side of the angle. It starts at the vertex.', true);
    }

    /* a ray you open by dragging its round green handle (open, own) */
    function opener(V, b, L1, L2, lo, onRel, w) {
      line(V, P(V, b, L1), NAVY, w || 5); var e = P(V, b + S.a, L2), rl = line(V, e, GRN, w || 5), mk = S.a === 90 ? mark(V, b, 90, GRN) : null, ap = S.a === 90 ? null : NS('path', { d: arcD(V, 46, b, b + S.a), fill: 'none', stroke: GRN, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      if (DO === 'open') brad(V); else dot(V, NAVY, 6);
      var h = handle(e, GRN, 'an-h', 'The round green handle on the green ' + (DO === 'open' ? 'strip' : 'ray') + '. Drag it to open or close the angle.'), live = S.a;
      h.setAttribute('aria-valuenow', S.a);
      drag(h, svg, function (pt) {
        var a = (angTo(V, pt) - b + 360) % 360; if (a > 180) a = a > 270 ? lo : 180; live = Math.max(lo, a);
        var q = P(V, b + live, L2); rl.setAttribute('x2', q.x); rl.setAttribute('y2', q.y); h.setAttribute('transform', 'translate(' + (q.x - e.x) + ',' + (q.y - e.y) + ')');
        if (mk) { mk.remove(); mk = null; } if (!ap) ap = NS('path', { fill: 'none', stroke: GRN, 'stroke-width': 3, 'pointer-events': 'none' }, svg); ap.setAttribute('d', arcD(V, 46, b, b + live));
      }, function (pt) { if (pt) onRel(snapA(live, lo)); else draw(); });
      keys(h, function (k) { onRel(snapA(S.a + k * 5, lo)); refocus('an-h'); });
    }

    /* ── open (Think) ── */
    function drawOpen() {
      svg.setAttribute('viewBox', '0 0 700 400'); var V = { x: 350, y: 330 };
      setsq(V, 0, 175, false, { 'pointer-events': 'none', opacity: .55 });
      opener(V, 0, 270, 270, 4, setOpen, 9);
      svg.setAttribute('aria-label', 'Two strips pinned together at one end. A set square sits behind them. The strips are ' + (S.a === 180 ? 'open to one straight line.' : 'open ' + WORD[cls(S.a)] + '.'));
      if (S.a >= 10 && S.a < 90) flag(box, 'little'); if (S.a === 90) flag(box, 'right'); if (S.a === 180) flag(box, 'straight');
    }
    var OPENMSG = { less: 'The strips are open a little. The opening between them is the angle. It is smaller than the square corner.', right: '✓ The strips fit the square corner of the set square exactly. That is a right angle.', greater: 'The opening is wider than the square corner now.', straight: '✓ The two strips make one straight line. That is a straight angle.' };
    function setOpen(a) {
      S.a = a; save(); var c = cls(a); pluck(c === 'right' || c === 'straight' ? HZ.C5 : 220 + a * 2); draw();
      msg(a < 10 ? 'The strips are almost closed. Open them a little more.' : OPENMSG[c], c === 'right' || c === 'straight');
      if (a >= 10 && a < 90) flag(box, 'little');
    }

    /* ── parts (Your Turn) ── */
    var PB = +box.dataset.b || 20, PA = +box.dataset.a || 60;
    function drawParts() {
      var H = F > 1 ? 470 : 430; svg.setAttribute('viewBox', '0 0 700 ' + H); var V = { x: 175, y: 345 };
      var e1 = P(V, PB, 230), e2 = P(V, PB + PA, 185);
      line(V, e1, NAVY); line(V, e2, GRN); mark(V, PB, PA, GRN); dot(V, NAVY, 7);
      var all = S.at.vertex && S.at['ray-a'] && S.at['ray-b'];
      labels([{ k: 'vertex', x: 110, y: H - 32, to: V }, { k: 'ray-a', x: 600, y: H - 32, to: P(V, PB, 170) }, { k: 'ray-b', x: 450, y: 50 * F, to: P(V, PB + PA, 140) }], !all);
      // the set square appears once the labels are on
      if (all) {
        var C = S.sq ? V : { x: 425, y: H - 28 }, rot = S.sq ? PB : 0;
        var g = setsq(C, rot, 260, !S.sq, S.sq ? { 'pointer-events': 'none' } : { class: 'drag an-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag it so its square corner sits on the vertex.' });
        // keep the angle on top of the set square
        line(V, e1, NAVY); line(V, e2, GRN); mark(V, PB, PA, GRN); dot(V, NAVY, 7);
        if (!S.sq) {
          drag(g, svg, function (pt) { if (!g._o) g._o = { x: pt.x, y: pt.y }; g.setAttribute('transform', 'translate(' + (pt.x - g._o.x) + ',' + (pt.y - g._o.y) + ')'); }, function (pt) {
            var o = g._o; g._o = null; if (!pt || !o) { draw(); return; } var cx = C.x + pt.x - o.x, cy = C.y + pt.y - o.y;
            if (Math.hypot(cx - V.x, cy - V.y) < 55 * F) checkOn(); else { pluck(HZ.D4); draw(); msg('Drop the set square so its square corner lands on the vertex dot.'); } });
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); checkOn(); } });
        }
      }
      sortRow(all && S.sq);
      svg.setAttribute('aria-label', 'An angle: a navy ray and a green ray meet at a dot.' + (S.sq ? ' The set square sits on the vertex with one edge on the navy ray.' : ''));
      if (S.sq) flag(box, 'checked'); if (S.c === ANS && S.sq) flag(box, 'sorted');
    }
    function checkOn() { S.sq = 1; save(); pluck(HZ.C5); draw(); flag(box, 'checked'); msg('✓ The square corner is on the vertex, and one edge lies on the navy ray. Now look at the green ray.', true); }

    /* ── ben: P and Q ── */
    var BB = 8;
    function drawBen() {
      svg.setAttribute('viewBox', '0 0 700 420'); var V1 = { x: 150, y: 350 }, V2 = S.laid ? V1 : { x: 500, y: 350 };
      line(V1, P(V1, BB, 250), NAVY); line(V1, P(V1, BB + 48, 270), GRN); mark(V1, BB, 48, GRN, 56); dot(V1, NAVY, 7);
      NS('text', { x: V1.x - 30 * F, y: V1.y + 8 * F, 'text-anchor': 'middle', 'font-size': 22 * F, 'font-weight': 900, fill: GRN, text: 'P', 'pointer-events': 'none' }, svg);
      var g = NS('g', S.laid ? { 'pointer-events': 'none', opacity: .9 } : {}, svg), e2 = P(V2, BB + 110, S.len);
      function L(a, b, c, w, x) { var o = { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: c, 'stroke-width': w || 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }; for (var k in (x || {})) o[k] = x[k]; return NS('line', o, g); }
      L(V2, P(V2, BB, 150), NAVY, S.laid ? 4 : 5, S.laid ? { 'stroke-dasharray': '8 6' } : {}); var rl = L(V2, e2, RED);
      NS('path', { d: arcD(V2, S.laid ? 70 : 52, BB, BB + 110), fill: 'none', stroke: RED, 'stroke-width': 3, 'pointer-events': 'none' }, g);
      if (!S.laid) NS('text', { x: V2.x - 30 * F, y: V2.y + 8 * F, 'text-anchor': 'middle', 'font-size': 22 * F, 'font-weight': 900, fill: RED, text: 'Q', 'pointer-events': 'none' }, g);
      else NS('text', { x: P(V1, BB + 110, Math.min(S.len, 160) * .6).x - 24 * F, y: P(V1, BB + 110, Math.min(S.len, 160) * .6).y, 'text-anchor': 'middle', 'font-size': 22 * F, 'font-weight': 900, fill: RED, text: 'Q', 'pointer-events': 'none' }, svg);
      if (!S.laid) {
        // Q's vertex handle (gold ring): drag the whole angle Q
        var vh = NS('g', { class: 'drag an-qv', tabindex: 0, role: 'slider', 'aria-label': "Angle Q's vertex. Drag it onto angle P's vertex." }, svg);
        NS('circle', { cx: V2.x, cy: V2.y, r: 24 * F, fill: 'transparent' }, vh); NS('circle', { cx: V2.x, cy: V2.y, r: 15 * F, fill: 'none', stroke: GOLD, 'stroke-width': 3 }, vh);
        drag(vh, svg, function (pt) { var t = 'translate(' + (pt.x - V2.x) + ',' + (pt.y - V2.y) + ')'; g.setAttribute('transform', t); vh.setAttribute('transform', t); }, function (pt) {
          if (pt && Math.hypot(pt.x - V1.x, pt.y - V1.y) < 50 * F) { S.laid = 1; save(); pluck(HZ.C5); draw(); flag(box, 'laid'); msg("✓ The vertices match, and the bottom rays line up. Now compare the openings: look at the green ray and the red ray.", true); }
          else { if (pt) { pluck(HZ.D4); msg("Drop angle Q's vertex right on angle P's vertex, the dot at the left."); } draw(); } });
        vh.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.laid = 1; save(); draw(); flag(box, 'laid'); } });
        // the end of Q's red ray: drag it out along the ray
        var eh = handle(e2, RED, 'an-end', "End of angle Q's red ray. Drag it to make the ray longer."), live = S.len, dir = BB + 110;
        drag(eh, svg, function (pt) { var dx = pt.x - V2.x, dy = V2.y - pt.y, a = dir * Math.PI / 180; live = Math.max(80, Math.min(240, dx * Math.cos(a) + dy * Math.sin(a))); var q = P(V2, dir, live); rl.setAttribute('x2', q.x); rl.setAttribute('y2', q.y); eh.setAttribute('transform', 'translate(' + (q.x - e2.x) + ',' + (q.y - e2.y) + ')'); }, function (pt) { if (pt) setLen(live); else draw(); });
        keys(eh, function (k) { setLen(S.len + k * 20); refocus('an-end'); });
      }
      dot(V2, NAVY, 7);
      svg.setAttribute('aria-label', 'Angle P has long rays and a small opening. Angle Q has short rays and a wide opening.' + (S.laid ? ' Angle Q now sits on angle P, vertex on vertex.' : ''));
      if (S.len >= 190) flag(box, 'stretched'); if (S.laid) flag(box, 'laid');
    }
    function setLen(v) { S.len = Math.max(80, Math.min(240, Math.round(v))); save(); pluck(200 + S.len); draw(); if (S.len >= 190) { flag(box, 'stretched'); msg("✓ Angle Q's red ray is much longer now, but the opening did not change. Angle Q is still the same size.", true); } else msg('The red ray is a little longer. Drag it much longer.'); }

    /* ── turn: Mia's turned right angle ── */
    var TB = +box.dataset.b || 30;
    function drawTurn() {
      var H = 430; svg.setAttribute('viewBox', '0 0 700 ' + H); var V = { x: 265, y: 330 }, SZ = 175;
      var C = S.on ? V : { x: 470, y: 380 }, fits = S.on && S.rot === TB;
      var g = setsq(C, S.rot, SZ, !S.on, S.on ? { 'pointer-events': 'none' } : { class: 'drag an-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag it so its square corner sits on the vertex.' });
      line(V, P(V, TB, 240), NAVY); line(V, P(V, TB + 90, 220), GRN); dot(V, NAVY, 7);
      if (fits) mark(V, TB, 90, GRN);
      // the round turn handle, just past the long edge
      var hp = P(C, S.rot + 45, SZ * .707 + 30), rh = NS('g', { class: 'drag an-rot', tabindex: 0, role: 'slider', 'aria-label': 'Round turn handle of the set square. Drag it around to turn the set square.' }, svg);
      NS('circle', { cx: hp.x, cy: hp.y, r: 24 * F, fill: 'transparent' }, rh); NS('circle', { cx: hp.x, cy: hp.y, r: 16 * F, fill: '#fff', stroke: GRAY, 'stroke-width': 3 }, rh); NS('text', { x: hp.x, y: hp.y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, fill: NAVY, text: '⟳', 'pointer-events': 'none' }, rh);
      var lr = S.rot;
      drag(rh, svg, function (pt) { lr = ((Math.round((angTo(C, pt) - 45) / 15) * 15) % 360 + 360) % 360; g.setAttribute('transform', 'rotate(' + (S.rot - lr) + ' ' + C.x + ' ' + C.y + ')'); var q = P(C, lr + 45, SZ * .707 + 30); rh.setAttribute('transform', 'translate(' + (q.x - hp.x) + ',' + (q.y - hp.y) + ')'); }, function (pt) { if (pt) setRot(lr); else draw(); });
      keys(rh, function (k) { setRot(S.rot + k * 15); refocus('an-rot'); });
      btns.innerHTML = ''; btn('↺ Turn', 'sm ghost an-tl', function () { setRot(S.rot + 15); }); btn('↻ Turn', 'sm ghost an-tr', function () { setRot(S.rot - 15); });
      if (!S.on) {
        drag(g, svg, function (pt) { if (!g._o) g._o = { x: pt.x, y: pt.y }; g.setAttribute('transform', 'translate(' + (pt.x - g._o.x) + ',' + (pt.y - g._o.y) + ')'); }, function (pt) {
          var o = g._o; g._o = null; if (!pt || !o) { draw(); return; } var cx = C.x + pt.x - o.x, cy = C.y + pt.y - o.y;
          if (Math.hypot(cx - V.x, cy - V.y) < 55 * F) { S.on = 1; save(); pluck(HZ.C5); draw(); flag(box, 'on'); fitMsg(); } else { pluck(HZ.D4); draw(); msg('Drop the set square so its square corner lands on the vertex dot.'); } });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.on = 1; save(); draw(); flag(box, 'on'); fitMsg(); } });
      }
      sortRow(fits);
      svg.setAttribute('aria-label', "Mia's angle: a navy ray and a green ray, turned so neither ray lies flat." + (S.on ? ' The set square sits on the vertex.' : '') + (fits ? ' It fits exactly.' : ''));
      if (S.on) flag(box, 'on'); if (fits) flag(box, 'fits'); if (fits && S.c === ANS) flag(box, 'sorted');
    }
    function setRot(r) { S.rot = ((r % 360) + 360) % 360; save(); pluck(S.on && S.rot === TB ? HZ.C5 : HZ.E4); draw(); fitMsg(); }
    function fitMsg() { if (!S.on) { msg('The set square turned. Now drag it so its square corner sits on the vertex.'); return; } if (S.rot === TB) { flag(box, 'fits'); msg('✓ The set square fits exactly. Both rays lie right along its edges.', true); } else msg('The square corner is on the vertex, but the edges do not line up with both rays yet. Turn the set square.'); }

    /* ── meet: Kai's sticks ── */
    function drawMeet() {
      svg.setAttribute('viewBox', '0 0 700 400'); var V = { x: 215, y: 320 }, FE = P(V, 68, 270), E0 = { x: V.x + 70, y: V.y - 75 };
      var E = S.met ? V : (S.ex ? { x: S.ex, y: S.ey } : E0);
      line(V, P(V, -4, 380), NAVY, 7); var gl = line(FE, E, GRN, 7);
      if (S.met) { mark(V, -4, 72, GRN); dot(V, NAVY, 7); }
      else {
        dot(V, NAVY, 5);
        var h = handle(E, GRN, 'an-e', 'Loose end of the green stick. Drag it onto the end of the navy stick.'), live = E;
        drag(h, svg, function (pt) { live = pt; gl.setAttribute('x2', pt.x); gl.setAttribute('y2', pt.y); h.setAttribute('transform', 'translate(' + (pt.x - E.x) + ',' + (pt.y - E.y) + ')'); }, function (pt) {
          if (!pt) { draw(); return; } if (Math.hypot(pt.x - V.x, pt.y - V.y) < 38 * F) { S.met = 1; save(); pluck(HZ.C5); draw(); flag(box, 'met'); msg('✓ Now the two sticks meet at one point. They make an angle.', true); }
          else { S.ex = Math.max(30, Math.min(670, pt.x)); S.ey = Math.max(30, Math.min(370, pt.y)); save(); pluck(HZ.D4); draw(); msg('The sticks still do not touch. Drag the green end onto the end of the navy stick.'); } });
        h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.met = 1; save(); draw(); flag(box, 'met'); } });
      }
      if (S.met && !S.v) {
        var t = NS('g', { class: 'an-v', role: 'button', tabindex: 0, 'aria-label': 'The point where the sticks meet', style: 'cursor:pointer' }, svg);
        NS('circle', { cx: V.x, cy: V.y, r: 22 * F, fill: 'rgba(201,162,39,.25)', stroke: GOLD, 'stroke-width': 3 }, t); NS('circle', { cx: V.x, cy: V.y, r: 6, fill: GOLD }, t);
        function tap() { S.v = 1; save(); pluck(HZ.C5); draw(); flag(box, 'vertex'); msg('✓ That point is the vertex, where the two sides meet.', true); }
        t.addEventListener('click', tap); t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
      }
      if (S.v) pill(V.x, V.y + 42 * F, 'vertex', NAVY);
      svg.setAttribute('aria-label', S.met ? 'A navy stick and a green stick meet at one point.' : 'A navy stick and a green stick. They do not touch: there is a gap between them.');
      if (S.met) flag(box, 'met'); if (S.v) flag(box, 'vertex');
    }

    /* ── own: make an angle greater than a right angle on grid paper ── */
    function drawOwn() {
      var H = F > 1 ? 470 : 430; svg.setAttribute('viewBox', '0 0 700 ' + H); paper(H, true); var V = { x: 330, y: H - 110 };
      var g = S.a > 90 && S.a < 180;
      if (S.sq) setsq(V, 0, 170, false);
      opener(V, 0, 300, 230, 10, setOwn);
      btns.innerHTML = ''; btn('📐 Check with the square corner', 'an-chk', function () { S.sq = 1; save(); draw(); ownMsg(true); }, S.sq && g);
      var ready = S.sq && g;
      if (ready || S.at.vertex || S.at['ray-a'] || S.at['ray-b']) labels([{ k: 'vertex', x: V.x - 150, y: H - 34, to: V }, { k: 'ray-a', x: 600, y: H - 34, to: P(V, 0, 240) }, { k: 'ray-b', x: Math.min(560, Math.max(100, P(V, S.a, 160).x)), y: 44 * F, to: P(V, S.a, 170) }], ready && !(S.at.vertex && S.at['ray-a'] && S.at['ray-b']));
      svg.setAttribute('aria-label', 'Grid paper with an angle you can open. It is ' + WORD[cls(S.a)] + '.');
      if (g) flag(box, 'greater'); else flag(box, 'greater', false); if (ready) flag(box, 'checked');
    }
    function ownMsg(chk) {
      var c = cls(S.a);
      if (!S.sq) { msg(c === 'greater' ? 'Your angle is open wider than a square corner. Check it with the square corner.' : c === 'straight' ? 'That is a straight line: a straight angle. Close it a little.' : c === 'right' ? 'That is a square corner. Open it a little wider.' : 'That opening is small. Open it wider.'); return; }
      if (c === 'greater') { pluck(HZ.C5); flag(box, 'checked'); msg('✓ The green ray sticks out past the set square. Your angle is greater than a right angle.', true); }
      else msg(c === 'less' ? 'The green ray hides under the set square. That angle is less than a right angle. Open it wider.' : c === 'right' ? 'The green ray lies right on the edge of the set square. That is a right angle. Open it a little wider.' : 'The two rays make one straight line. That is a straight angle. Close it a little.');
    }
    function setOwn(a) { S.a = a; save(); pluck(a === 90 ? HZ.C5 : 220 + a * 2); draw(); ownMsg(); }

    /* ── euclid: one line standing on a straight line ── */
    function drawEuclid() {
      svg.setAttribute('viewBox', '0 0 700 380'); var V = { x: 350, y: 300 }, s = S.s;
      line({ x: 60, y: V.y }, { x: 640, y: V.y }, NAVY, 5);
      if (s === 90) { mark(V, 0, 90, GRN); mark(V, 90, 90, RED); }
      else { NS('path', { d: arcD(V, 52, 0, s), fill: 'none', stroke: GRN, 'stroke-width': 4, 'pointer-events': 'none' }, svg); NS('path', { d: arcD(V, 68, s, 180), fill: 'none', stroke: RED, 'stroke-width': 4, 'pointer-events': 'none' }, svg); }
      var e = P(V, s, 240), rl = line(V, e, NAVY, 5); dot(V, NAVY, 7);
      var gp = P(V, s / 2, 96), rp = P(V, (s + 180) / 2, 112);
      NS('text', { x: gp.x, y: gp.y + 7, 'text-anchor': 'middle', 'font-size': 18 * F, 'font-weight': 900, fill: GRN, text: 'green', 'pointer-events': 'none' }, svg);
      NS('text', { x: rp.x, y: rp.y + 7, 'text-anchor': 'middle', 'font-size': 18 * F, 'font-weight': 900, fill: RED, text: 'red', 'pointer-events': 'none' }, svg);
      var h = handle(e, GOLD, 'an-h', 'The gold handle on the standing line. Drag it to lean the line left or right.'), live = s;
      drag(h, svg, function (pt) { var a = angTo(V, pt); if (a > 180) a = a > 270 ? 6 : 174; live = Math.max(6, Math.min(174, a)); var q = P(V, live, 240); rl.setAttribute('x2', q.x); rl.setAttribute('y2', q.y); h.setAttribute('transform', 'translate(' + (q.x - e.x) + ',' + (q.y - e.y) + ')'); }, function (pt) { if (pt) setS(live); else draw(); });
      keys(h, function (k) { setS(S.s + k * 5); refocus('an-h'); });
      svg.setAttribute('aria-label', 'A straight line with one line standing on it. The green angle is on the right and the red angle is on the left.' + (s === 90 ? ' Both have square corner marks.' : ''));
      if (S.eq) flag(box, 'equal'); if (S.ln) flag(box, 'lean');
    }
    function setS(v) {
      v = Math.round(v); if (Math.abs(v - 90) <= 5) v = 90; S.s = Math.max(6, Math.min(174, v));
      if (S.s === 90) { S.eq = 1; save(); pluck(HZ.C5); draw(); flag(box, 'equal'); msg('✓ The green angle and the red angle are the same size. Euclid says each one is a right angle.', true); return; }
      if (S.eq && S.s >= 100) { S.ln = 1; save(); pluck(HZ.E5); draw(); flag(box, 'lean'); msg('✓ The red angle is less than a right angle now. Look at the green angle.', true); return; }
      save(); pluck(HZ.D4); draw(); msg(S.eq ? (S.s < 90 ? 'Now the green angle is the small one. Lean the line the other way, to the left.' : 'Lean it a little more to the left.') : 'The two angles are not the same size yet. Keep moving the line.');
    }

    function draw() { sizeF(); svg.innerHTML = ''; ({ open: drawOpen, parts: drawParts, ben: drawBen, turn: drawTurn, meet: drawMeet, own: drawOwn, euclid: drawEuclid }[DO] || drawOpen)(); }
    onWidth(box, draw); draw();
    if (DO === 'own') ownMsg(); else if (DO === 'open' && S.a > 6) msg(OPENMSG[cls(S.a)], S.a === 90 || S.a === 180);
  };

'''
CSS = '''
/* ── ang (3.12.02 angles) ── */
.sb-an .an-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:0 0 8px}
.sb-an .an-btns:empty,.sb-an .an-chips:empty{display:none}
.sb-an svg .an-lslot,.sb-an svg .an-v{cursor:pointer}
.sb-an svg .drag{cursor:grab}
.sb-an svg .drag:focus-visible,.sb-an svg .an-lslot:focus-visible,.sb-an svg .an-v:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.sb-an svg .an-v{animation:anPulse 1.6s ease-in-out infinite}
@keyframes anPulse{50%{opacity:.55}}
.sb-an .an-sort{margin-top:12px;border-top:1.5px dashed #DCE2EE;padding-top:10px}
.sb-an .an-sline{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;font-weight:900;font-size:18px;color:#0E1C42}
.sb-an .an-slot{min-width:220px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;padding:6px 14px;border:2.5px dashed #8792A8;border-radius:12px;color:#8792A8;font-size:15px;background:#fff}
.sb-an .an-slot.ok{border-style:solid;border-color:#1E7A4C;color:#1E7A4C;background:#E8F5EE;font-size:17px}
.sb-an .an-slot.no{border-style:solid;border-color:#B23A2E;color:#B23A2E;background:#FBEDEB;font-size:17px}
@media (max-width:560px){.sb-an .an-slot{min-width:0;width:100%}.sb-an .an-sline{font-size:16px}}
@media (prefers-reduced-motion:reduce){.sb-an svg .an-v{animation:none}}
'''
def patch_js(p):
    s = open(p).read()
    if 'MODS.ang = ' in s: print(p, 'already'); return
    assert MARK in s, p
    s = s.replace(MARK, MOD + MARK, 1)
    s = s.replace(", circ (circles + compass)", ", circ (circles + compass), ang (angles + set square)", 1)
    open(p, 'w').write(s); print(p, 'ok')
def patch_css(p):
    s = open(p).read()
    if '.sb-an ' in s: print(p, 'already'); return
    open(p, 'w').write(s.rstrip('\n') + '\n' + CSS.lstrip('\n')); print(p, 'ok')
for a in sys.argv[1:]:
    (patch_css if a.endswith('.css') else patch_js)(a)
