  /* ── area (3.13.01 Area). Roman mosaic tesserae = unit squares.
     data-do:
       tile  — cover a shape's cells with square tiles (tap an empty cell to lay a tile, tap a laid tile to lift it;
               a tray tile can also be dragged onto a cell). data-cells "c,r c,r …". flag 'tiled' when every cell is covered.
       count — a shape already filled with unit squares; tap each to count it, 1,2,3…. data-cells (+ optional data-cells2
               for a second panel). flags 'counted' (one figure) or 'cA' and 'cB' (two figures).
       halftile — whole cells (data-cells) + half cells (data-halves "c,r,corner", corner = tl|tr|bl|br triangle).
               Lay a whole tile on each whole cell and a half tile on each half cell; two halves = one unit.
               flag 'htiled' when all are covered.
       build — a blank grid; tap cells to shade a shape with data-target square units, different from data-ref "c,r …".
               flag 'built' when the count equals the target and the shape is not the reference shape.
     See tools/storybook/bp1301.py. */
  MODS.area = function (box) {
    var name = box.dataset.name || 'area', DO = box.dataset.do || 'tile';
    var NAVY = '#0E1C42', OKG = '#1E7A4C', RED = '#B23A2E', GOLD = '#C9A227', GRAY = '#5B6478', LINE = '#D9DEEA', CREAM = '#FBF6EA', TESS = '#C0632F', TESS2 = '#E09A5A', HALF = '#7CA98C', GRID = '#C9CFDC';
    function gnums(s) { return (s || '').trim().split(/\s+/).filter(Boolean).map(function (q) { var a = q.split(','); return { c: +a[0], r: +a[1], k: a[2] || '' }; }); }
    var CELLS = gnums(box.dataset.cells), CELLS2 = gnums(box.dataset.cells2), HALVES = gnums(box.dataset.halves);
    var REF = gnums(box.dataset.ref), TARGET = +box.dataset.target || 0;
    var ALL = CELLS.concat(CELLS2, HALVES, REF);
    var minC = Math.min.apply(null, ALL.map(function (p) { return p.c; })), maxC = Math.max.apply(null, ALL.map(function (p) { return p.c; }));
    var minR = Math.min.apply(null, ALL.map(function (p) { return p.r; })), maxR = Math.max.apply(null, ALL.map(function (p) { return p.r; }));
    var cols = +box.dataset.cols || (maxC - minC + 1), rows = +box.dataset.rows || (maxR - minR + 1);
    var two = DO === 'count' && CELLS2.length;

    var DEF = { tile: { on: {} }, count: { c: {}, c2: {} }, halftile: { on: {} }, build: { on: {} } };
    var S = mstate(name, JSON.parse(JSON.stringify(DEF[DO] || { on: {} })));
    box.innerHTML = '<div class="sb-stage sb-an sb-area"><div class="an-btns"></div><svg viewBox="0 0 700 460" role="group"></svg><div class="qd-chips ar-chips"></div><div class="ar-tray" role="group" aria-label="Tiles"></div></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.an-btns', box), chips = $('.ar-chips', box), tray = $('.ar-tray', box), F = 1;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.7 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OKG + '">' + h + '</span>' : h; }
    function bad(t) { pluck(HZ.D4); msg(t); }
    function key(p) { return p.c + ',' + p.r; }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    function tapK(g, fn) { g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); }

    /* grid geometry */
    var PAD = 26, GW, CP, OX, OY, VW, VH;
    function geom(nCols) {
      var maxW = 640, maxH = 360;
      CP = Math.min(58, Math.floor(maxW / (nCols + 0.5)), Math.floor(maxH / (rows + 0.5)));
      if (CP < 26) CP = 26;
      GW = CP;
      VW = 700; VH = rows * CP + 2 * PAD + 10;
    }
    function CX(c, ox) { return ox + (c - minC) * CP; }
    function CY(r) { return PAD + (r - minR) * CP; }
    function faintGrid(ox, nCols) {
      for (var r = 0; r <= rows; r++) NS('line', { x1: ox, y1: PAD + r * CP, x2: ox + nCols * CP, y2: PAD + r * CP, stroke: GRID, 'stroke-width': 1, 'pointer-events': 'none' }, svg);
      for (var c = 0; c <= nCols; c++) NS('line', { x1: ox + c * CP, y1: PAD, x2: ox + c * CP, y2: PAD + rows * CP, stroke: GRID, 'stroke-width': 1, 'pointer-events': 'none' }, svg);
    }
    function cellRect(x, y, fill, stroke, sw) { return NS('rect', { x: x + 1, y: y + 1, width: CP - 2, height: CP - 2, rx: 3, fill: fill, stroke: stroke, 'stroke-width': sw || 2, 'pointer-events': 'none' }, svg); }

    /* ══ tile ══ */
    function drawTile() {
      geom(cols); svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
      var ox = (VW - cols * CP) / 2;
      NS('rect', { x: 8, y: 8, width: VW - 16, height: VH - 16, rx: 18, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      faintGrid(ox, cols);
      CELLS.forEach(function (p) {
        var x = CX(p.c, ox), y = CY(p.r), on = S.on[key(p)];
        cellRect(x, y, on ? TESS : CREAM, on ? '#7C3A16' : NAVY, on ? 2.5 : 2.5);
        if (on) NS('line', { x1: x + CP * 0.3, y1: y + CP * 0.3, x2: x + CP * 0.7, y2: y + CP * 0.7, stroke: 'rgba(255,255,255,.4)', 'stroke-width': 2, 'pointer-events': 'none' }, svg);
        var g = NS('g', { class: 'ar-cell' + (on ? ' done' : ''), 'data-k': key(p), role: 'button', tabindex: 0, 'aria-label': on ? 'A tile is here. Tap to lift it off.' : 'An empty square. Tap to lay a tile.' }, svg);
        NS('rect', { x: x, y: y, width: CP, height: CP, fill: 'transparent' }, g);
        tapK(g, function () { toggle(p); });
      });
      var laid = CELLS.filter(function (p) { return S.on[key(p)]; }).length, gaps = CELLS.length - laid;
      chips.innerHTML = '<span class="tr-res ' + (gaps ? 'none' : 'yes') + '">' + laid + ' of ' + CELLS.length + ' squares covered</span>' + (gaps ? '<span class="tr-res no">' + gaps + ' still empty</span>' : '');
      btn('↩ Lift all the tiles', 'ghost sm tr-redo', function () { S.on = {}; save(); flag(box, 'tiled', false); draw(); msg('The shape is empty again. Tap a square to lay a tile.'); }, !laid);
      trayTile();
      svg.setAttribute('aria-label', 'A shape made of ' + CELLS.length + ' squares. ' + laid + ' covered with tiles, ' + gaps + ' still empty.');
      if (gaps === 0 && CELLS.length) { flag(box, 'tiled'); }
    }
    function toggle(p) {
      var k = key(p); if (S.on[k]) { delete S.on[k]; save(); pluck(HZ.E4); draw(); msg('You lifted that tile off. The square is empty again.'); return; }
      S.on[k] = 1; save(); pluck(HZ.C5); draw();
      var laid = CELLS.filter(function (q) { return S.on[key(q)]; }).length, gaps = CELLS.length - laid;
      msg(gaps ? '✓ Tile laid. No gaps and no overlaps, one tile per square. ' + gaps + ' square' + (gaps > 1 ? 's' : '') + ' still empty.' : '✓ Every square is covered, with no gaps and no overlaps. The area is <b>' + CELLS.length + ' square units</b>.', true);
    }
    function trayTile() {
      tray.innerHTML = ''; if (DO !== 'tile') { tray.hidden = true; return; } tray.hidden = false;
      var laid = CELLS.filter(function (p) { return S.on[key(p)]; }).length, left = CELLS.length - laid;
      var lab = el('span', 'ar-tlab', left ? '🧱 Tiles left to lay: ' + left : '🧱 All tiles laid'); tray.appendChild(lab);
      if (!left) return;
      var t = el('button', 'ar-tile-src', '◼'); t.type = 'button'; t.setAttribute('aria-label', 'A square tile. Drag it onto an empty square, or just tap an empty square.');
      hdrag(t, function (target) {
        var g = target && target.closest && target.closest('.ar-cell:not(.done)');
        if (g) { var kk = g.dataset.k, p = CELLS.filter(function (q) { return key(q) === kk; })[0]; if (p && !S.on[kk]) toggle(p); }
        else bad('Drop the tile right on an empty square inside the shape.');
      }, function () { msg('Tap an empty square in the shape to lay this tile. You can also drag it there.'); });
      tray.appendChild(t);
    }

    /* ══ count ══ */
    function drawCount() {
      geom(two ? cols * 2 + 1 : cols); svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
      NS('rect', { x: 8, y: 8, width: VW - 16, height: VH - 16, rx: 18, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      var panels = two ? [{ cells: CELLS, store: S.c, fl: 'cA', lab: 'A', ox: 60 }, { cells: CELLS2, store: S.c2, fl: 'cB', lab: 'B', ox: VW / 2 + 30 }]
                       : [{ cells: CELLS, store: S.c, fl: 'counted', lab: '', ox: (VW - cols * CP) / 2 }];
      panels.forEach(function (pan) {
        var order = pan.cells;
        if (pan.lab) NS('text', { x: pan.ox + cols * CP / 2, y: 20, 'text-anchor': 'middle', 'font-size': 16 * F, 'font-weight': 900, fill: NAVY, text: 'Panel ' + pan.lab, 'pointer-events': 'none' }, svg);
        order.forEach(function (p) {
          var x = CX(p.c, pan.ox), y = CY(p.r), n = pan.store[key(p)];
          cellRect(x, y, n ? '#DFF0E6' : TESS, n ? OKG : '#7C3A16', 2.5);
          if (n) NS('text', { x: x + CP / 2, y: y + CP / 2 + 6 * F, 'text-anchor': 'middle', 'font-size': 18 * F, 'font-weight': 900, fill: OKG, text: String(n), 'pointer-events': 'none' }, svg);
          var g = NS('g', { class: 'ar-cell' + (n ? ' done' : ''), 'data-k': pan.lab + key(p), role: 'button', tabindex: 0, 'aria-label': n ? 'Square number ' + n + ', already counted.' : 'A tile, not counted yet. Tap to count it.' }, svg);
          NS('rect', { x: x, y: y, width: CP, height: CP, fill: 'transparent' }, g);
          tapK(g, function () { countTap(pan, p); });
        });
        var got = Object.keys(pan.store).length;
        if (got >= pan.cells.length) flag(box, pan.fl);
      });
      var a = Object.keys(S.c).length, bb = two ? Object.keys(S.c2).length : 0;
      chips.innerHTML = two
        ? '<span class="tr-res ' + (a >= CELLS.length ? 'yes' : 'none') + '">Panel A: ' + a + ' of ' + CELLS.length + '</span><span class="tr-res ' + (bb >= CELLS2.length ? 'yes' : 'none') + '">Panel B: ' + bb + ' of ' + CELLS2.length + '</span>'
        : '<span class="tr-res ' + (a >= CELLS.length ? 'yes' : 'none') + '">' + a + ' of ' + CELLS.length + ' counted</span>';
      btn('↩ Count again', 'ghost sm tr-redo', function () { S.c = {}; S.c2 = {}; save(); ['counted', 'cA', 'cB'].forEach(function (k) { flag(box, k, false); }); draw(); msg('Counts cleared. Tap each square to count it.'); }, !a && !bb);
      tray.hidden = true;
      svg.setAttribute('aria-label', two ? 'Two panels of square tiles to count.' : 'A shape of ' + CELLS.length + ' square tiles to count.');
    }
    function countTap(pan, p) {
      var k = key(p); if (pan.store[k]) { msg('You counted that one already. It is square number ' + pan.store[k] + '.'); return; }
      var next = Object.keys(pan.store).length + 1; pan.store[k] = next; save(); pluck(HZ.C5 + next * 18); draw();
      if (next >= pan.cells.length) { msg('✓ You counted every square' + (pan.lab ? ' in Panel ' + pan.lab : '') + '. The area is <b>' + pan.cells.length + ' square units</b>.', true); flag(box, pan.fl); }
      else msg('✓ ' + next + ' so far. Keep going, one square at a time, and don\'t count any twice.', true);
    }

    /* ══ halftile ══ */
    function triPts(x, y, corner) {
      var a = { x: x, y: y }, b = { x: x + CP, y: y }, c = { x: x + CP, y: y + CP }, d = { x: x, y: y + CP };
      var m = { tl: [a, b, d], tr: [a, b, c], br: [b, c, d], bl: [a, c, d] }[corner] || [a, b, d];
      return m.map(function (q) { return q.x.toFixed(1) + ',' + q.y.toFixed(1); }).join(' ');
    }
    function drawHalf() {
      geom(cols); svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
      var ox = (VW - cols * CP) / 2;
      NS('rect', { x: 8, y: 8, width: VW - 16, height: VH - 16, rx: 18, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      faintGrid(ox, cols);
      CELLS.forEach(function (p) {
        var x = CX(p.c, ox), y = CY(p.r), on = S.on['W' + key(p)];
        cellRect(x, y, on ? TESS : CREAM, on ? '#7C3A16' : NAVY, 2.5);
        var g = NS('g', { class: 'ar-cell' + (on ? ' done' : ''), 'data-k': 'W' + key(p), role: 'button', tabindex: 0, 'aria-label': on ? 'A whole tile is here. Tap to lift it.' : 'An empty whole square. Tap to lay a whole tile.' }, svg);
        NS('rect', { x: x, y: y, width: CP, height: CP, fill: 'transparent' }, g);
        tapK(g, function () { toggleH('W' + key(p)); });
      });
      HALVES.forEach(function (p) {
        var x = CX(p.c, ox), y = CY(p.r), on = S.on['H' + key(p)];
        NS('polygon', { points: triPts(x, y, p.k), fill: on ? HALF : 'rgba(124,169,140,.14)', stroke: on ? '#3F6B50' : '#8aa', 'stroke-width': 2, 'stroke-dasharray': on ? '' : '5 4', 'pointer-events': 'none' }, svg);
        var g = NS('g', { class: 'ar-cell half' + (on ? ' done' : ''), 'data-k': 'H' + key(p), role: 'button', tabindex: 0, 'aria-label': on ? 'A half tile is here. Tap to lift it.' : 'An empty half square. Tap to lay a half tile.' }, svg);
        NS('rect', { x: x, y: y, width: CP, height: CP, fill: 'transparent' }, g);
        tapK(g, function () { toggleH('H' + key(p)); });
      });
      var W = CELLS.filter(function (p) { return S.on['W' + key(p)]; }).length, H = HALVES.filter(function (p) { return S.on['H' + key(p)]; }).length;
      var areaN = W + H / 2;
      chips.innerHTML = '<span class="tr-res ' + (W === CELLS.length ? 'yes' : 'none') + '">whole tiles: ' + W + ' of ' + CELLS.length + '</span><span class="tr-res ' + (H === HALVES.length ? 'yes' : 'none') + '">half tiles: ' + H + ' of ' + HALVES.length + '</span>';
      btn('↩ Lift all the tiles', 'ghost sm tr-redo', function () { S.on = {}; save(); flag(box, 'htiled', false); draw(); msg('All the tiles are off. Start laying them again.'); }, !W && !H);
      tray.hidden = true;
      svg.setAttribute('aria-label', 'A mosaic piece with a slanted edge: ' + CELLS.length + ' whole squares and ' + HALVES.length + ' half squares.');
      if (W === CELLS.length && H === HALVES.length) { flag(box, 'htiled'); msg('✓ Covered! ' + W + ' whole tiles and ' + H + ' half tiles. Two halves make one whole, so ' + H + ' halves make ' + (H / 2) + '. The area is ' + W + ' + ' + (H / 2) + ' = <b>' + areaN + ' square units</b>.', true); }
    }
    function toggleH(k) {
      if (S.on[k]) { delete S.on[k]; save(); pluck(HZ.E4); draw(); msg('You lifted that tile off.'); return; }
      S.on[k] = 1; save(); pluck(k[0] === 'H' ? HZ.G4 : HZ.C5); draw();
      if (out.textContent.indexOf('Covered') < 0) msg('✓ Tile laid. ' + (k[0] === 'H' ? 'A half tile fills a triangle.' : 'A whole tile fills a square.'), true);
    }

    /* ══ build ══ */
    function sameAsRef() {
      var mine = Object.keys(S.on).sort(), ref = REF.map(key).sort();
      return mine.length === ref.length && mine.every(function (k, i) { return k === ref[i]; });
    }
    function drawBuild() {
      geom(cols); svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
      var ox = (VW - cols * CP) / 2;
      NS('rect', { x: 8, y: 8, width: VW - 16, height: VH - 16, rx: 18, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      faintGrid(ox, cols);
      for (var r = minR; r < minR + rows; r++) for (var c = minC; c < minC + cols; c++) (function (c, r) {
        var p = { c: c, r: r }, x = CX(c, ox), y = CY(r), on = S.on[key(p)];
        if (on) { cellRect(x, y, TESS, '#7C3A16', 2.5); }
        var g = NS('g', { class: 'ar-cell' + (on ? ' done' : ''), 'data-k': key(p), role: 'button', tabindex: 0, 'aria-label': on ? 'A shaded square. Tap to clear it.' : 'An empty square. Tap to shade it.' }, svg);
        NS('rect', { x: x, y: y, width: CP, height: CP, fill: 'transparent' }, g);
        tapK(g, function () { toggleB(p); });
      })(c, r);
      var n = Object.keys(S.on).length;
      chips.innerHTML = '<span class="tr-res ' + (n === TARGET ? 'yes' : 'none') + '">' + n + ' of ' + TARGET + ' squares shaded</span>';
      btn('↩ Clear', 'ghost sm tr-redo', function () { S.on = {}; save(); flag(box, 'built', false); draw(); msg('Cleared. Tap squares to build your shape.'); }, !n);
      tray.hidden = true;
      svg.setAttribute('aria-label', 'A blank grid. Tap squares to shade a shape. ' + n + ' of ' + TARGET + ' shaded.');
      if (n === TARGET) { if (sameAsRef()) { msg('That is ' + TARGET + ' squares, but it is the same shape that was already shown. Clear a square and shade a different one so your shape looks different.'); flag(box, 'built', false); }
        else { flag(box, 'built'); msg('✓ Your shape covers ' + TARGET + ' square units too, and it is a different shape. Two different shapes can have the same area.', true); } }
      else flag(box, 'built', false);
    }
    function toggleB(p) {
      var k = key(p); if (S.on[k]) { delete S.on[k]; save(); pluck(HZ.E4); draw(); return; }
      var n = Object.keys(S.on).length;
      if (n >= TARGET) { bad('You already shaded ' + TARGET + ' squares. Clear one first if you want to move it.'); return; }
      S.on[k] = 1; save(); pluck(HZ.C5 + n * 20); draw();
      var now = Object.keys(S.on).length;
      if (now < TARGET) msg('✓ ' + now + ' of ' + TARGET + ' squares shaded.', true);
    }

    function focusKey() { var a = document.activeElement; if (!a || !svg.contains(a)) return null; return a.dataset ? a.dataset.k || '' : ''; }
    function refocus(k) { if (!k) return; var n = $$('.ar-cell', svg).filter(function (e) { return e.dataset.k === k; })[0]; if (n && n.focus) n.focus(); }
    function draw() { var k = focusKey(); sizeF(); svg.innerHTML = ''; btns.innerHTML = ''; chips.innerHTML = '';
      ({ tile: drawTile, count: drawCount, halftile: drawHalf, build: drawBuild }[DO] || drawTile)(); refocus(k); }
    onWidth(box, draw); draw();
  };
