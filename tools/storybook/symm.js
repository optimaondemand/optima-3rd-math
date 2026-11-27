  /* ── symm: lines of symmetry + the compass (3.12.07) ──────────────────────
     data-do fold    · a paper shape with dashed candidate fold lines; tap one to fold it over.
                       data-shape "x,y x,y …" (stage coordinates), data-lines "x,y x,y|x,y x,y|…".
                       Flags: tried (every line folded), found (at least one matched).
     data-do mirror  · half a shape on a geoboard, left of a dashed line; tap pins to build the
                       other half. data-half "5,1 1,5 …" (pins), data-axis "5". Flag: built.
     data-do compass · a compass on a centimeter ruler. Drag the pencil leg to set the opening,
                       then press Draw. data-radii "3,1" → flags r3, r1. data-cards → flag card.
     data-do euclid  · Euclid's first problem: two circles of the same size, the fold line through
                       their crossings, and the triangle. Flags: cset, ca, cb, fline.
     Note: MODS.sym is already the <, > and = model, so this one is MODS.symm. */
  MODS.symm = function (box) {
    var name = box.dataset.name || 'symm', DO = box.dataset.do || 'fold';
    var NAVY = '#0E1C42', OKG = '#1E7A4C', RED = '#B23A2E', GOLD = '#C9A227', GRAY = '#5B6478', PIN = '#6B7280', LINE = '#D9DEEA', PAPER = '#FBF6EA', PUR = '#6B46C1', ORG = '#C26A0A', STEEL = '#8792A8';
    var DEF = { fold: { t: {}, last: -1 }, mirror: { p: [] }, compass: { r: 3, drew: [], nm: '' }, euclid: { set: 0, a: 0, b: 0, x: {}, line: 0 } };
    var S = mstate(name, JSON.parse(JSON.stringify(DEF[DO] || {})));
    box.innerHTML = '<div class="sb-stage sb-an sb-quad"><div class="an-btns"></div><svg viewBox="0 0 700 460" role="group"></svg><div class="qd-chips"></div><div class="qd-names"></div><div class="bm-chips qd-cards" role="group" aria-label="Cards to drag"></div></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.an-btns', box), chips = $('.qd-chips', box), namesB = $('.qd-names', box), cardsB = $('.qd-cards', box), F = 1, SEL = null;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OKG + '">' + h + '</span>' : h; }
    function bad(t) { pluck(HZ.D4); msg(t); }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    function tapK(g, fn) { g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); }
    function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
    function nums(s) { return (s || '').trim().split(/\s+/).map(function (q) { return q.split(',').map(Number); }); }

    /* ── reflect a point across the line through A and B ── */
    function refl(p, A, B) {
      var dx = B[0] - A[0], dy = B[1] - A[1], L = dx * dx + dy * dy || 1;
      var t = ((p[0] - A[0]) * dx + (p[1] - A[1]) * dy) / L, f = [A[0] + t * dx, A[1] + t * dy];
      return [2 * f[0] - p[0], 2 * f[1] - p[1]];
    }
    function near(a, b) { return Math.abs(a[0] - b[0]) < 1.5 && Math.abs(a[1] - b[1]) < 1.5; }
    function isLineOfSym(shape, A, B) {
      return shape.every(function (p) { var r = refl(p, A, B); return shape.some(function (q) { return near(r, q); }); });
    }

    /* ══ fold ══ */
    var SHAPE = nums(box.dataset.shape || '260,60 380,60 365,110 330,160 330,200 375,250 390,330 320,370 250,330 265,250 310,200 310,160 275,110');
    var LINES = (box.dataset.lines || '320,30 320,400').split('|').map(function (s) { return nums(s); });
    function drawFold() {
      svg.setAttribute('viewBox', '0 0 640 420');
      NS('rect', { x: 8, y: 8, width: 624, height: 404, rx: 20, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      NS('polygon', { points: pts(SHAPE), fill: PAPER, stroke: NAVY, 'stroke-width': 4.5, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, svg);
      // the fold that is showing now: a fold flips ONE half over, so the mirrored copy is clipped to the
      // far side of the line. What lands outside the shape is the part that sticks out.
      if (S.last > -1 && S.t[S.last] != null) {
        var L = LINES[S.last], ok = S.t[S.last] === 1, img = SHAPE.map(function (p) { return refl(p, L[0], L[1]); });
        var dx = L[1][0] - L[0][0], dy = L[1][1] - L[0][1], LN = Math.hypot(dx, dy) || 1, ux = dx / LN, uy = dy / LN, nx = -uy, ny = ux, BIG = 1600;
        // which side is "far"? the side the first vertex of the shape is NOT on
        var s0 = (SHAPE[0][0] - L[0][0]) * nx + (SHAPE[0][1] - L[0][1]) * ny, sgn = s0 >= 0 ? 1 : -1;
        var mid = [(L[0][0] + L[1][0]) / 2, (L[0][1] + L[1][1]) / 2];
        var half = [[mid[0] - ux * BIG, mid[1] - uy * BIG], [mid[0] + ux * BIG, mid[1] + uy * BIG],
                    [mid[0] + ux * BIG + nx * BIG * sgn, mid[1] + uy * BIG + ny * BIG * sgn], [mid[0] - ux * BIG + nx * BIG * sgn, mid[1] - uy * BIG + ny * BIG * sgn]];
        var defs = NS('defs', {}, svg), cp = NS('clipPath', { id: name + '-fold' }, defs);
        NS('polygon', { points: pts(half) }, cp);
        var g = NS('g', { 'clip-path': 'url(#' + name + '-fold)', 'pointer-events': 'none' }, svg);
        NS('polygon', { points: pts(img), fill: ok ? 'rgba(30,122,76,.22)' : 'rgba(178,58,46,.22)', stroke: ok ? OKG : RED, 'stroke-width': 4.5, 'stroke-dasharray': ok ? '' : '10 7', 'stroke-linejoin': 'round' }, g);
      }
      LINES.forEach(function (L, i) {
        var done = S.t[i] != null, col = !done ? GRAY : S.t[i] ? OKG : RED;
        var g = NS('g', { class: 'sf-line' + (done ? ' done' : '') + (S.last === i ? ' sel' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'Fold line ' + (i + 1) + (done ? (S.t[i] ? ': the halves match' : ': the halves do not match') : ', not folded yet') }, svg);
        // the hit area is a polygon, not a thick line: a line's box can be flat, and a flat box is not clickable
        var dx = L[1][0] - L[0][0], dy = L[1][1] - L[0][1], LN = Math.hypot(dx, dy) || 1, w = 15 * F, nx = -dy / LN * w, ny = dx / LN * w;
        NS('polygon', { points: pts([[L[0][0] + nx, L[0][1] + ny], [L[1][0] + nx, L[1][1] + ny], [L[1][0] - nx, L[1][1] - ny], [L[0][0] - nx, L[0][1] - ny]]), fill: 'transparent' }, g);
        NS('line', { x1: L[0][0], y1: L[0][1], x2: L[1][0], y2: L[1][1], stroke: col, 'stroke-width': 3.5, 'stroke-dasharray': '9 7', 'stroke-linecap': 'round', 'pointer-events': 'none' }, g);
        tapK(g, function () { doFold(i); });
      });
      var n = Object.keys(S.t).length, got = Object.keys(S.t).filter(function (k) { return S.t[k] === 1; }).length;
      chips.innerHTML = '<span class="tr-res none">' + n + ' of ' + LINES.length + ' folds tried</span>' +
        LINES.map(function (L, i) { return S.t[i] == null ? '' : '<span class="tr-res ' + (S.t[i] ? 'yes' : 'no') + '">Fold ' + (i + 1) + (S.t[i] ? ' ✓ matches' : ' ✗ no match') + '</span>'; }).join('');
      btn('↩ Unfold', 'ghost sm tr-redo', function () { S.last = -1; save(); draw(); msg('The paper is flat again. Tap another dashed line to fold it.'); }, S.last < 0);
      svg.setAttribute('aria-label', 'A paper shape with ' + LINES.length + ' dashed fold lines. ' + n + ' folds tried, ' + got + ' matched.');
      if (n >= LINES.length) flag(box, 'tried');
      if (got) flag(box, 'found');
    }
    function doFold(i) {
      var L = LINES[i], ok = isLineOfSym(SHAPE, L[0], L[1]);
      S.t[i] = ok ? 1 : 0; S.last = i; save(); pluck(ok ? HZ.C5 : HZ.D4); draw();
      msg(ok ? '✓ The two halves match exactly, with nothing sticking out. This fold is a <b>line of symmetry</b>.'
             : 'The folded half does not match. Part of it sticks out past the edge, so this fold is <b>not</b> a line of symmetry.', ok);
      var n = Object.keys(S.t).length;
      if (n >= LINES.length) { var got = Object.keys(S.t).filter(function (k) { return S.t[k] === 1; }).length;
        msg((got ? '✓ ' : '') + 'You tried every fold. ' + (got === 0 ? 'Not one of them made the halves match, so this shape has no line of symmetry.' : got === 1 ? 'Only one fold made the halves match.' : got + ' folds made the halves match.'), got > 0); }
    }

    /* ── geoboard (same pins as the Geoboard tool) ── */
    var N = 11, GB = 440, MG = 30;
    function sp() { return (GB - 2 * MG) / (N - 1); }
    function GP(q) { return { x: 130 + MG + q[0] * sp(), y: 10 + MG + q[1] * sp() }; }
    function board() { svg.setAttribute('viewBox', '0 0 700 460'); NS('rect', { x: 132, y: 12, width: GB - 4, height: GB - 4, rx: 22, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg); }

    /* ══ mirror ══ */
    var HALF = nums(box.dataset.half || '5,1 1,5 3,5 3,9 5,9'), AX = +(box.dataset.axis || 5);
    function mir(q) { return [2 * AX - q[0], q[1]]; }
    var TARG = HALF.map(mir).filter(function (q) { return q[0] !== AX; }).filter(function (q, i, a) { return a.findIndex(function (r) { return r[0] === q[0] && r[1] === q[1]; }) === i; });
    function has(list, q) { return list.some(function (r) { return r[0] === q[0] && r[1] === q[1]; }); }
    function drawMirror() {
      board();
      var top = GP([AX, 0]), bot = GP([AX, N - 1]);
      NS('line', { x1: top.x, y1: top.y - 14, x2: bot.x, y2: bot.y + 14, stroke: GOLD, 'stroke-width': 3.5, 'stroke-dasharray': '9 7', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
      var done = TARG.every(function (q) { return has(S.p, q); });
      if (done) {
        var full = HALF.concat(HALF.map(mir).reverse().filter(function (q) { return q[0] !== AX; }));
        NS('polygon', { points: full.map(GP).map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '), fill: PUR, 'fill-opacity': .14, stroke: PUR, 'stroke-width': 5, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, svg);
      } else {
        NS('polyline', { points: HALF.map(GP).map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '), fill: 'none', stroke: PUR, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
      }
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) (function (x, y) {
        var c = GP([x, y]), on = has(S.p, [x, y]);
        var g = NS('g', { class: 'tr-pin' + (on ? ' done' : ''), 'data-p': x + ',' + y, role: 'button', tabindex: -1, 'aria-label': 'Pin ' + (x + 1) + ', ' + (y + 1) + (on ? ', part of the mirror half' : '') }, svg);
        NS('circle', { cx: c.x, cy: c.y, r: sp() * 0.48, fill: 'transparent' }, g);
        NS('circle', { cx: c.x, cy: c.y, r: on ? 9 : 5, fill: on ? PUR : PIN, stroke: '#fff', 'stroke-width': on ? 3 : 1.5 }, g);
        tapK(g, function () { tapPin([x, y]); });
      })(x, y);
      chips.innerHTML = '<span class="tr-res none">' + S.p.length + ' of ' + TARG.length + ' corners placed</span>';
      btn('↩ Start over', 'ghost sm tr-redo', function () { S.p = []; save(); flag(box, 'built', false); draw(); msg('The mirror half is clear. Tap a pin to start again.'); }, !S.p.length);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins. Half a shape is on the left of a dashed line. ' + S.p.length + ' of ' + TARG.length + ' mirror corners placed.');
      if (done) flag(box, 'built');
    }
    function tapPin(q) {
      if (has(S.p, q)) { msg('That pin is already part of the mirror half.'); return; }
      if (q[0] === AX) { bad('That pin is on the dashed line. The mirror half is on the other side of the line.'); return; }
      if (q[0] < AX) { bad('That pin is on the half that is already there. Build the other half, on the right of the dashed line.'); return; }
      if (!has(TARG, q)) { bad('Not that pin. Count how far a corner sits from the dashed line, then count the same number of steps on the other side.'); return; }
      S.p.push(q); save(); pluck(HZ.C5 + S.p.length * 30); draw();
      var left = TARG.length - S.p.length;
      msg(left ? '✓ That corner is the same number of steps from the line as its partner. ' + left + ' more to place.' : '✓ Both halves match exactly now. The dashed line is a line of symmetry.', true);
    }

    /* ══ compass ══ */
    var RAD = (box.dataset.radii || '3,1').split(',').map(Number), CM = 42, NX = 180, NY = 320;
    var CARDS = (box.dataset.cards || '').split(',').filter(Boolean);
    function drawCompass() {
      svg.setAttribute('viewBox', '0 0 700 460');
      NS('rect', { x: 8, y: 8, width: 684, height: 444, rx: 20, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      // the circles already drawn stay on the paper
      S.drew.forEach(function (r) {
        NS('circle', { cx: NX, cy: NY, r: r * CM, fill: 'none', stroke: NAVY, 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
        NS('line', { x1: NX - r * CM, y1: NY, x2: NX + r * CM, y2: NY, stroke: STEEL, 'stroke-width': 2.5, 'stroke-dasharray': '8 6', 'pointer-events': 'none' }, svg);
      });
      // the ruler, with 0 right under the needle
      var ry = 92;
      NS('rect', { x: NX - 18, y: ry, width: 10 * CM + 36, height: 44, rx: 8, fill: '#F6EFDC', stroke: '#C9B280', 'stroke-width': 2.5, 'pointer-events': 'none' }, svg);
      for (var c = 0; c <= 10; c++) {
        NS('line', { x1: NX + c * CM, y1: ry, x2: NX + c * CM, y2: ry + (c % 5 === 0 ? 22 : 14), stroke: NAVY, 'stroke-width': c % 5 === 0 ? 2.5 : 1.5, 'pointer-events': 'none' }, svg);
        if (c % 1 === 0) NS('text', { x: NX + c * CM, y: ry + 38, 'text-anchor': 'middle', 'font-size': 13 * F, 'font-weight': 800, fill: GRAY, text: String(c), 'pointer-events': 'none' }, svg);
      }
      NS('text', { x: NX + 10 * CM + 30, y: ry + 28, 'text-anchor': 'start', 'font-size': 13 * F, 'font-weight': 800, fill: GRAY, text: 'cm', 'pointer-events': 'none' }, svg);
      // the compass itself: needle leg at NX, pencil leg r cm away
      var px = NX + S.r * CM, hx = (NX + px) / 2, hy = ry + 62;
      NS('line', { x1: hx, y1: hy, x2: NX, y2: NY, stroke: STEEL, 'stroke-width': 7, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
      NS('line', { x1: hx, y1: hy, x2: px, y2: NY, stroke: STEEL, 'stroke-width': 7, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
      NS('circle', { cx: hx, cy: hy, r: 11, fill: '#C9CFDC', stroke: NAVY, 'stroke-width': 2.5, 'pointer-events': 'none' }, svg);
      NS('circle', { cx: NX, cy: NY, r: 6, fill: NAVY, 'pointer-events': 'none' }, svg);
      NS('text', { x: NX, y: NY + 30, 'text-anchor': 'middle', 'font-size': 14 * F, 'font-weight': 800, fill: GRAY, text: 'needle point', 'pointer-events': 'none' }, svg);
      var g = NS('g', { class: 'drag sf-pen', tabindex: 0, role: 'slider', 'aria-valuenow': S.r, 'aria-valuemin': 1, 'aria-valuemax': 8, 'aria-label': 'The pencil leg of the compass. Drag it to set the opening. Now ' + S.r + ' centimeters.' }, svg);
      NS('circle', { cx: px, cy: NY, r: 26 * F, fill: 'transparent' }, g);
      NS('polygon', { points: pts([[px, NY], [px - 9, NY - 26], [px + 9, NY - 26]]), fill: '#E8B64C', stroke: NAVY, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
      NS('text', { x: px, y: NY + 54, 'text-anchor': 'middle', 'font-size': 14 * F, 'font-weight': 800, fill: ORG, text: 'pencil', 'pointer-events': 'none' }, g);
      drag(g, svg, function (pt) { g.setAttribute('transform', 'translate(' + (pt.x - px) + ',0)'); }, function (pt) {
        if (!pt) { draw(); return; }
        var r = Math.round((pt.x - NX) / CM);
        if (r < 1 || r > 8) { bad('Open the compass between 1 cm and 8 cm on the ruler.'); draw(); return; }
        setR(r);
      }, function () {});
      g.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setR(Math.min(8, S.r + 1)); } if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setR(Math.max(1, S.r - 1)); } });
      btn('✏️ Draw the circle', '', function () {
        if (S.drew.indexOf(S.r) > -1) { bad('You already drew a circle with that opening. Set a different opening first.'); return; }
        S.drew.push(S.r); save(); pluck(HZ.C5); draw();
        msg('✓ The needle stayed in one place and the pencil went all the way round, so every point on the circle is <b>' + S.r + ' cm</b> from the needle. That is the radius. The dashed line goes right across the middle.', true);
        RAD.forEach(function (r) { if (S.drew.indexOf(r) > -1) flag(box, 'r' + r); });
      });
      btn('↩ Clear the paper', 'ghost sm tr-redo', function () { S.drew = []; save(); RAD.forEach(function (r) { flag(box, 'r' + r, false); }); draw(); msg('The paper is clear. Set the opening and draw again.'); }, !S.drew.length);
      chips.innerHTML = '<span class="tr-res none">opening: ' + S.r + ' cm</span>' + S.drew.map(function (r) { return '<span class="tr-res yes">circle drawn: radius ' + r + ' cm</span>'; }).join('');
      svg.setAttribute('aria-label', 'A compass standing on paper next to a centimeter ruler. The opening is ' + S.r + ' centimeters. ' + S.drew.length + ' circles drawn.');
      RAD.forEach(function (r) { if (S.drew.indexOf(r) > -1) flag(box, 'r' + r); });
      cardUI();
    }
    function setR(r) { S.r = r; save(); pluck(HZ.E4 + r * 30); draw(); msg('The compass is open ' + r + ' cm. Press ✏️ Draw the circle.'); }
    function cardUI() {
      namesB.innerHTML = ''; cardsB.innerHTML = '';
      if (!CARDS.length) { cardsB.hidden = true; return; }
      cardsB.hidden = false;
      var line = el('div', 'tn-row'); line.appendChild(el('span', 'tn-lab', 'Open the compass wider and you draw:'));
      var sl = el('span', 'tn-slot' + (S.nm ? ' ok' : ''), S.nm ? esc(S.nm) : 'drop a card here'); sl.tabIndex = S.nm ? -1 : 0; sl.setAttribute('role', 'button'); sl.setAttribute('aria-label', 'Box for the card' + (S.nm ? ': ' + S.nm : ''));
      if (!S.nm) tapK(sl, function () { if (SEL) put(SEL); else bad('First pick a card, then tap this box. Or drag a card onto the box.'); });
      line.appendChild(sl); namesB.appendChild(line);
      CARDS.forEach(function (c) {
        var b = el('button', 'bm-chip an-card tn-card qd-card' + (SEL === c ? ' sel' : '') + (S.nm === c ? ' used' : ''), esc(c)); b.type = 'button'; b.dataset.c = c; if (S.nm) b.disabled = true;
        hdrag(b, function (t) { if (t && t.closest && t.closest('.tn-slot') && !S.nm) put(c); else bad('Drop the card right on the box.'); }, function () { SEL = SEL === c ? null : c; draw(); if (SEL) msg('Now tap the box.'); });
        cardsB.appendChild(b);
      });
      function put(c) {
        SEL = null;
        if (S.drew.length < 2) { bad('Draw both circles first. Then you can see what a wider opening does.'); draw(); return; }
        if (c === CARDS[0]) { S.nm = c; save(); pluck(HZ.C5); draw(); flag(box, 'card'); msg('✓ A wider opening puts the pencil farther from the needle, so the circle is bigger all the way round.', true); return; }
        bad('Look at your two circles. The one you drew with the wider opening is the bigger one.'); draw();
      }
    }

    /* ══ euclid ══ */
    var EA = [250, 300], EB = [410, 300], ER = 160, EH = ER * Math.sqrt(3) / 2;
    var XP = [[(EA[0] + EB[0]) / 2, 300 - EH], [(EA[0] + EB[0]) / 2, 300 + EH]];
    function drawEuclid() {
      svg.setAttribute('viewBox', '0 0 700 480');
      NS('rect', { x: 8, y: 8, width: 684, height: 464, rx: 20, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      if (S.a) NS('circle', { cx: EA[0], cy: EA[1], r: ER, fill: 'none', stroke: '#2F6FDE', 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
      if (S.b) NS('circle', { cx: EB[0], cy: EB[1], r: ER, fill: 'none', stroke: '#D2453B', 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
      if (S.line) {
        NS('line', { x1: XP[0][0], y1: XP[0][1] - 40, x2: XP[1][0], y2: XP[1][1] + 40, stroke: GOLD, 'stroke-width': 3.5, 'stroke-dasharray': '9 7', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        NS('polygon', { points: pts([EA, EB, XP[0]]), fill: PUR, 'fill-opacity': .14, stroke: PUR, 'stroke-width': 4.5, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, svg);
        [[EA, EB], [EB, XP[0]], [XP[0], EA]].forEach(function (s) {
          // not at the exact midpoint: on side A–B that is where the fold line crosses, and the mark would hide in it
          var t = 0.38, mx = s[0][0] + (s[1][0] - s[0][0]) * t, my = s[0][1] + (s[1][1] - s[0][1]) * t, dx = s[1][0] - s[0][0], dy = s[1][1] - s[0][1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
          NS('line', { x1: mx - nx * 10, y1: my - ny * 10, x2: mx + nx * 10, y2: my + ny * 10, stroke: NAVY, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        });
      }
      NS('line', { x1: EA[0], y1: EA[1], x2: EB[0], y2: EB[1], stroke: NAVY, 'stroke-width': 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
      [[EA, 'A'], [EB, 'B']].forEach(function (p) {
        NS('circle', { cx: p[0][0], cy: p[0][1], r: 7, fill: NAVY, 'pointer-events': 'none' }, svg);
        NS('text', { x: p[0][0], y: p[0][1] + 32, 'text-anchor': 'middle', 'font-size': 18 * F, 'font-weight': 900, fill: NAVY, text: p[1], 'pointer-events': 'none' }, svg);
      });
      if (S.a && S.b && !S.line) XP.forEach(function (c, i) {
        var g = NS('g', { class: 'sf-x' + (S.x[i] ? ' done' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'A point where the two circles cross' + (S.x[i] ? ', tapped' : ', not tapped yet') }, svg);
        NS('circle', { cx: c[0], cy: c[1], r: 24 * F, fill: 'transparent' }, g);
        NS('circle', { cx: c[0], cy: c[1], r: S.x[i] ? 9 : 10, fill: S.x[i] ? GOLD : 'rgba(201,162,39,.25)', stroke: GOLD, 'stroke-width': 3, 'stroke-dasharray': S.x[i] ? '' : '4 3' }, g);
        tapK(g, function () { tapX(i); });
      });
      btn('📏 Open the compass from A to B', '', function () { S.set = 1; save(); pluck(HZ.C5); flag(box, 'cset'); draw(); msg('✓ The compass is open exactly as wide as the line from A to B. Keep it open.', true); }, !!S.set);
      btn('✏️ Draw the circle around A', '', function () { if (!S.set) { bad('Open the compass from A to B first.'); return; } S.a = 1; save(); pluck(HZ.E5); flag(box, 'ca'); draw(); msg('✓ The needle sat on A and the pencil went all the way round. Every point on the blue circle is as far from A as B is.', true); }, !S.set || !!S.a);
      btn('✏️ Draw the circle around B', '', function () { if (!S.a) { bad('Draw the circle around A first.'); return; } S.b = 1; save(); pluck(HZ.G5); flag(box, 'cb'); draw(); msg('✓ Two circles the same size. Now tap the two places where they cross.', true); }, !S.a || !!S.b);
      btn('↩ Start over', 'ghost sm tr-redo', function () { S.set = 0; S.a = 0; S.b = 0; S.x = {}; S.line = 0; save(); ['cset', 'ca', 'cb', 'fline'].forEach(function (k) { flag(box, k, false); }); draw(); msg('The paper is clear. Open the compass from A to B to start again.'); }, !S.set);
      chips.innerHTML = '<span class="tr-res ' + (S.set ? 'yes' : 'none') + '">compass open A to B</span><span class="tr-res ' + (S.a ? 'yes' : 'none') + '">circle around A</span><span class="tr-res ' + (S.b ? 'yes' : 'none') + '">circle around B</span><span class="tr-res ' + (S.line ? 'yes' : 'none') + '">fold line</span>';
      svg.setAttribute('aria-label', 'A line from A to B' + (S.a ? ', a circle around A' : '') + (S.b ? ', a circle around B' : '') + (S.line ? ', a dashed fold line through the two crossings, and a triangle with a tick mark on each side' : '') + '.');
      ['cset', 'ca', 'cb'].forEach(function (k, i) { if ([S.set, S.a, S.b][i]) flag(box, k); });
      if (S.line) flag(box, 'fline');
    }
    function tapX(i) {
      if (S.x[i]) { msg('You tapped that crossing already. Tap the other one.'); return; }
      S.x[i] = 1; save(); pluck(HZ.C5); draw();
      if (Object.keys(S.x).length < 2) { msg('✓ One crossing. Tap the other one too.', true); return; }
      S.line = 1; save(); flag(box, 'fline'); draw();
      msg('✓ The dashed line joins the two crossings. Fold the picture along it: the blue circle lands on the red one and A lands on B, so the whole picture matches. The three sides of the triangle have one tick mark each.', true);
    }

    // a redraw replaces every node in the svg, so remember what had keyboard focus and give it back
    function focusKey() { var a = document.activeElement; if (!a || !svg.contains(a)) return null; return (a.getAttribute('class') || '') + '|' + (a.dataset ? (a.dataset.i == null ? '' : a.dataset.i) : ''); }
    function refocus(k) { if (!k) return; var cls = k.split('|')[0].split(' ')[0], i = k.split('|')[1];
      var n = $$('.' + cls, svg).filter(function (e) { return i === '' || e.dataset.i === i; })[0]; if (n && n.focus) n.focus(); }
    function draw() { var k = focusKey(); sizeF(); svg.innerHTML = ''; btns.innerHTML = ''; chips.innerHTML = ''; if (DO !== 'compass') { namesB.innerHTML = ''; cardsB.innerHTML = ''; cardsB.hidden = true; }
      ({ fold: drawFold, mirror: drawMirror, compass: drawCompass, euclid: drawEuclid }[DO] || drawFold)(); refocus(k); }
    onWidth(box, draw); draw();
  };
